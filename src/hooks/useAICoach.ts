import { useState, useCallback, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { exercises } from "@/data/exercises";
import { foods, type FoodItem } from "@/data/foods";
import { toast } from "@/hooks/use-toast";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCallResult[];
}

export interface ToolCallResult {
  name: string;
  data: any;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`;

function findBestExerciseMatch(name: string): { id: string; name: string } | null {
  const lower = name.toLowerCase();
  const exact = exercises.find((e) => e.name.toLowerCase() === lower);
  if (exact) return { id: exact.id, name: exact.name };
  const partial = exercises.find((e) => e.name.toLowerCase().includes(lower) || lower.includes(e.name.toLowerCase()));
  if (partial) return { id: partial.id, name: partial.name };
  return { id: `custom_${Date.now()}`, name };
}

function findBestFoodMatch(name: string): FoodItem | null {
  const lower = name.toLowerCase();
  const exact = foods.find((f) => f.name.toLowerCase() === lower);
  if (exact) return exact;
  const partial = foods.find((f) => f.name.toLowerCase().includes(lower) || lower.includes(f.name.toLowerCase()));
  return partial || null;
}

export function useAICoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola! 💪 Soy tu **FitCoach** personal. Puedo ayudarte a:\n\n- 📝 **Registrar ejercicios** — Dime qué has entrenado y lo apunto\n- 🍽️ **Registrar comidas** — Cuéntame qué has comido\n- 🎯 **Planificar rutinas** — Te diseño entrenamientos\n- 🥗 **Consejos de nutrición** — Mejoro tu dieta\n\n¿En qué te puedo ayudar hoy?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const {
    addMealEntry,
    startWorkout,
    addExerciseToWorkout,
    addSetToExercise,
    updateSet,
    finishWorkout,
    activeWorkout,
  } = useAppStore();

  const processToolCalls = useCallback(
    (toolCalls: ToolCallResult[]) => {
      for (const tc of toolCalls) {
        if (tc.name === "log_exercises" && tc.data?.exercises) {
          // Start a workout if none active
          if (!useAppStore.getState().activeWorkout) {
            startWorkout("Entrenamiento IA");
          }
          for (const ex of tc.data.exercises) {
            const match = findBestExerciseMatch(ex.name);
            if (match) {
              addExerciseToWorkout(match.id, match.name);
              const state = useAppStore.getState();
              const exIdx = state.activeWorkout!.exercises.length - 1;
              if (ex.sets && ex.sets.length > 0) {
                // Update the first set (auto-created)
                updateSet(exIdx, 0, {
                  reps: ex.sets[0].reps,
                  weight: ex.sets[0].weight,
                  completed: true,
                });
                // Add remaining sets
                for (let i = 1; i < ex.sets.length; i++) {
                  addSetToExercise(exIdx);
                  updateSet(exIdx, i, {
                    reps: ex.sets[i].reps,
                    weight: ex.sets[i].weight,
                    completed: true,
                  });
                }
              }
            }
          }
          toast({
            title: "✅ Ejercicios registrados",
            description: `${tc.data.exercises.length} ejercicio(s) añadidos al entrenamiento`,
          });
        }

        if (tc.name === "log_meals" && tc.data?.meals) {
          for (const meal of tc.data.meals) {
            const foodMatch = findBestFoodMatch(meal.food_name);
            const grams = meal.grams || 100;
            const multiplier = grams / 100;

            const entry = {
              id: Math.random().toString(36).substring(2, 9),
              foodId: foodMatch?.id || `custom_${Date.now()}`,
              foodName: foodMatch?.name || meal.food_name,
              grams,
              calories: (foodMatch?.calories || 100) * multiplier,
              protein: (foodMatch?.protein || 10) * multiplier,
              carbs: (foodMatch?.carbs || 10) * multiplier,
              fat: (foodMatch?.fat || 5) * multiplier,
              mealType: meal.meal_type as any,
            };
            addMealEntry(entry);
          }
          toast({
            title: "✅ Comida registrada",
            description: `${tc.data.meals.length} alimento(s) añadidos`,
          });
        }
      }
    },
    [addMealEntry, startWorkout, addExerciseToWorkout, addSetToExercise, updateSet]
  );

  const sendMessage = useCallback(
    async (input: string) => {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: input,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      const abortController = new AbortController();
      abortRef.current = abortController;

      let assistantContent = "";
      const collectedToolCalls: any[] = [];
      let currentToolCall: any = null;

      const apiMessages = [...messages.filter((m) => m.id !== "welcome"), userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: apiMessages }),
          signal: abortController.signal,
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || `Error ${resp.status}`);
        }

        if (!resp.body) throw new Error("No response body");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let streamDone = false;

        const upsertAssistant = (content: string) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && last.id !== "welcome") {
              return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
            }
            return [...prev, { id: `assistant_${Date.now()}`, role: "assistant", content }];
          });
        };

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const choice = parsed.choices?.[0];
              if (!choice) continue;

              const delta = choice.delta;

              // Handle text content
              if (delta?.content) {
                assistantContent += delta.content;
                upsertAssistant(assistantContent);
              }

              // Handle tool calls
              if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                  if (tc.index !== undefined) {
                    if (!collectedToolCalls[tc.index]) {
                      collectedToolCalls[tc.index] = {
                        id: tc.id || "",
                        name: tc.function?.name || "",
                        arguments: "",
                      };
                    }
                    if (tc.function?.name) {
                      collectedToolCalls[tc.index].name = tc.function.name;
                    }
                    if (tc.function?.arguments) {
                      collectedToolCalls[tc.index].arguments += tc.function.arguments;
                    }
                  }
                }
              }

              // If finish_reason is "tool_calls", process them
              if (choice.finish_reason === "tool_calls" || choice.finish_reason === "stop") {
                // Will process after loop
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // Flush remaining buffer
        if (textBuffer.trim()) {
          for (let raw of textBuffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (raw.startsWith(":") || raw.trim() === "") continue;
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                upsertAssistant(assistantContent);
              }
            } catch {}
          }
        }

        // Process collected tool calls
        const processedToolCalls: ToolCallResult[] = [];
        for (const tc of collectedToolCalls) {
          if (tc && tc.name && tc.arguments) {
            try {
              const data = JSON.parse(tc.arguments);
              processedToolCalls.push({ name: tc.name, data });
            } catch (e) {
              console.error("Failed to parse tool call arguments:", e);
            }
          }
        }

        if (processedToolCalls.length > 0) {
          processToolCalls(processedToolCalls);

          // Update the assistant message with tool call info
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, toolCalls: processedToolCalls } : m
              );
            }
            return prev;
          });

          // If there was no text content with tool calls, add a confirmation message
          if (!assistantContent.trim()) {
            const confirmations: string[] = [];
            for (const tc of processedToolCalls) {
              if (tc.name === "log_exercises") {
                const names = tc.data.exercises.map((e: any) => e.name).join(", ");
                confirmations.push(`✅ **Ejercicios registrados**: ${names}`);
              }
              if (tc.name === "log_meals") {
                const names = tc.data.meals.map((m: any) => `${m.food_name} (${m.grams}g)`).join(", ");
                confirmations.push(`✅ **Comida registrada**: ${names}`);
              }
            }
            const confirmText = confirmations.join("\n\n");
            upsertAssistant(confirmText || "✅ ¡Registrado correctamente!");
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Chat error:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Error al conectar con el coach IA",
        });
        // Remove the loading state but keep user message
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, processToolCalls]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  return { messages, isLoading, sendMessage, stopGeneration };
}
