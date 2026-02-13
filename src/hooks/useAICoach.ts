import { useState, useCallback, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useDbSync } from "@/hooks/useDbSync";
import { useChatPersistence } from "@/hooks/useChatPersistence";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "¡Hola! 💪 Soy tu **FitCoach** personal. Puedo ayudarte a:\n\n- 📝 **Registrar ejercicios** — Dime qué has entrenado y lo apunto\n- 🍽️ **Registrar comidas** — Cuéntame qué has comido\n- 🎯 **Planificar rutinas** — Te diseño entrenamientos\n- 🥗 **Consejos de nutrición** — Mejoro tu dieta\n\n¿En qué te puedo ayudar hoy?",
};

export function useAICoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { saveMessage, loadMessages } = useChatPersistence();
  const { user } = useAuth();

  const {
    addMealEntry,
    startWorkout,
    addExerciseToWorkout,
    addSetToExercise,
    updateSet,
    finishWorkout,
  } = useAppStore();

  const { saveMealToDb, saveWorkoutToDb } = useDbSync();

  // Load persisted messages on mount (wait for user to be available)
  useEffect(() => {
    if (!user) {
      setLoaded(false);
      return;
    }
    if (loaded) return;
    loadMessages().then((msgs) => {
      if (msgs.length > 0) {
        setMessages([WELCOME_MESSAGE, ...msgs]);
      }
      setLoaded(true);
    });
  }, [user, loadMessages, loaded]);

  // Build historical context from DB
  const buildHistoricalContext = useCallback(async (): Promise<string> => {
    if (!user) return "";

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 14);
    const dateStr = sevenDaysAgo.toISOString().split("T")[0];

    // Fetch profile, meals, and workouts in parallel
    const [{ data: profile }, { data: meals }, { data: workouts }] = await Promise.all([
      supabase.from("profiles").select("calorie_goal, protein_goal, carbs_goal, fat_goal, weight, height").eq("user_id", user.id).maybeSingle(),
      supabase.from("meal_entries").select("*").eq("user_id", user.id).gte("date", dateStr).order("date", { ascending: false }).limit(200),
      supabase.from("workouts").select("*").eq("user_id", user.id).gte("date", dateStr).order("date", { ascending: false }).limit(20),
    ]);

    let ctx = "## Datos del usuario\n\n";

    // Profile info
    if (profile) {
      ctx += "### Objetivos:\n";
      ctx += `- Calorías: ${profile.calorie_goal} kcal/día\n`;
      ctx += `- Proteína: ${profile.protein_goal}g | Carbos: ${profile.carbs_goal}g | Grasa: ${profile.fat_goal}g\n`;
      if (profile.weight) ctx += `- Peso: ${profile.weight}kg\n`;
      if (profile.height) ctx += `- Altura: ${profile.height}cm\n`;
      if (profile.height) ctx += `- Altura: ${profile.height}cm\n`;
      ctx += "\n";
    }

    // Add protocol for workout suggestions
    ctx += "### Protocolo de Sugerencia de Rutinas:\n";
    ctx += "Si el usuario te pide una rutina, diséñala explicándola en texto. ADEMÁS, incluye SIEMPRE al final un bloque de código JSON (code block) con esta estructura exacta para habilitar el botón de 'Guardar Plantilla' en la interfaz:\n";
    ctx += "```json\n";
    ctx += JSON.stringify({
      suggestion_type: "workout",
      name: "Nombre corto de la rutina",
      description: "Breve descripción",
      exercises: [
        {
          name: "Nombre exacto del ejercicio",
          sets: [
            { reps: 10, weight: 0 },
            { reps: 10, weight: 0 }
          ]
        }
      ]
    }, null, 2);
    ctx += "\n```\n";
    ctx += "Asegúrate de que los nombres de ejercicios sean estándar.\n\n";

    // Workouts
    if (workouts && workouts.length > 0) {
      ctx += "### Entrenamientos recientes:\n";
      for (const w of workouts) {
        const { data: exs } = await supabase
          .from("workout_exercises")
          .select("exercise_name, id")
          .eq("workout_id", w.id)
          .order("order_index");

        ctx += `- **${w.date}** — ${w.name}:`;
        if (exs && exs.length > 0) {
          const details: string[] = [];
          for (const ex of exs) {
            const { data: sets } = await supabase
              .from("workout_sets")
              .select("weight, reps")
              .eq("workout_exercise_id", ex.id)
              .order("set_index");
            const setsStr = sets?.map((s) => `${Number(s.weight)}kg×${s.reps}`).join(", ") || "–";
            details.push(`${ex.exercise_name} (${setsStr})`);
          }
          ctx += " " + details.join("; ");
        }
        ctx += "\n";
      }
      ctx += "\n";
    }

    // Meals grouped by date
    if (meals && meals.length > 0) {
      ctx += "### Comidas recientes:\n";
      const byDate = new Map<string, typeof meals>();
      for (const m of meals) {
        const list = byDate.get(m.date) || [];
        list.push(m);
        byDate.set(m.date, list);
      }
      for (const [date, dayMeals] of byDate) {
        const totalCal = dayMeals.reduce((s, m) => s + Number(m.calories), 0);
        const totalProt = dayMeals.reduce((s, m) => s + Number(m.protein), 0);
        ctx += `- **${date}** (${Math.round(totalCal)} kcal, ${Math.round(totalProt)}g prot): `;
        ctx += dayMeals.map((m) => `${m.food_name} ${m.grams}g`).join(", ");
        ctx += "\n";
      }
    }

    return ctx;
  }, [user]);

  const processToolCalls = useCallback(
    (toolCalls: ToolCallResult[]) => {
      for (const tc of toolCalls) {
        if (tc.name === "log_exercises" && tc.data?.exercises) {
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
                updateSet(exIdx, 0, {
                  reps: ex.sets[0].reps,
                  weight: ex.sets[0].weight,
                  completed: true,
                });
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

          // Auto-finish and save workout to DB
          const workout = useAppStore.getState().activeWorkout;
          if (workout) {
            finishWorkout();
            saveWorkoutToDb(workout);
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
              id: crypto.randomUUID(),
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
            saveMealToDb(entry);
          }
          toast({
            title: "✅ Comida registrada",
            description: `${tc.data.meals.length} alimento(s) añadidos`,
          });
        }
      }
    },
    [addMealEntry, startWorkout, addExerciseToWorkout, addSetToExercise, updateSet, finishWorkout, saveMealToDb, saveWorkoutToDb]
  );

  const sendMessage = useCallback(
    async (input: string) => {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: input,
      };
      setMessages((prev) => [...prev, userMsg]);
      saveMessage(userMsg);
      setIsLoading(true);

      const abortController = new AbortController();
      abortRef.current = abortController;

      let assistantContent = "";
      const collectedToolCalls: any[] = [];

      // Build historical context for personalized advice
      let contextMessages: { role: string; content: string }[] = [];
      try {
        const ctx = await buildHistoricalContext();
        if (ctx) {
          contextMessages = [{ role: "system", content: `Datos del historial del usuario para personalizar tus respuestas:\n\n${ctx}` }];
        }
      } catch (e) {
        if (import.meta.env.DEV) console.error("Failed to build historical context:", e);
      }

      const MAX_MESSAGES = 48; // Leave room for system context message
      const chatHistory = [
        ...messages.filter((m) => m.id !== "welcome").map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: userMsg.role, content: userMsg.content },
      ];
      // Keep only the most recent messages if history is too long
      const trimmedHistory = chatHistory.length > MAX_MESSAGES
        ? chatHistory.slice(chatHistory.length - MAX_MESSAGES)
        : chatHistory;
      const apiMessages = [
        ...contextMessages,
        ...trimmedHistory,
      ];

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error("No hay sesión activa. Inicia sesión para usar el coach.");
        }

        if (import.meta.env.DEV) {
          console.log("Sending messages to AI Coach:", apiMessages);
        }

        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
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
        let assistantId = crypto.randomUUID();

        const upsertAssistant = (content: string) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && last.id === assistantId) {
              return prev.map((m) => (m.id === assistantId ? { ...m, content } : m));
            }
            return [...prev, { id: assistantId, role: "assistant", content }];
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

              if (delta?.content) {
                assistantContent += delta.content;
                upsertAssistant(assistantContent);
              }

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
            } catch { }
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
              if (import.meta.env.DEV) console.error("Failed to parse tool call arguments:", e);
            }
          }
        }

        if (processedToolCalls.length > 0) {
          processToolCalls(processedToolCalls);

          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, toolCalls: processedToolCalls } : m
              );
            }
            return prev;
          });

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
            assistantContent = confirmText || "✅ ¡Registrado correctamente!";
            upsertAssistant(assistantContent);
          }
        }

        // Save assistant message to DB
        if (assistantContent.trim()) {
          saveMessage({ id: assistantId, role: "assistant", content: assistantContent });
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        if (import.meta.env.DEV) console.error("Chat error:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Error al conectar con el coach IA",
        });
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, processToolCalls, saveMessage, buildHistoricalContext]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  return { messages, isLoading, sendMessage, stopGeneration };
}
