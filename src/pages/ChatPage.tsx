import { useState, useRef, useEffect } from "react";
import { useAICoach, type ChatMessage } from "@/hooks/useAICoach";
import { Send, Square, Bot, User, Dumbbell, UtensilsCrossed, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "@/hooks/use-toast";

const WorkoutSuggestionCard = ({ data }: { data: any }) => {
  const { addTemplate } = useAppStore();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    try {
      addTemplate({
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description,
        exercises: data.exercises.map((ex: any) => ({
          id: crypto.randomUUID(),
          exerciseId: `custom_${Date.now()}_${Math.random()}`,
          exerciseName: ex.name,
          sets: ex.sets.map((s: any) => ({
            id: crypto.randomUUID(),
            reps: s.reps,
            weight: s.weight
          }))
        }))
      });
      setSaved(true);
      toast({
        title: "✅ Plantilla guardada",
        description: `La rutina "${data.name}" se ha guardado en tus plantillas.`,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo guardar la plantilla.",
      });
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 animate-fade-in text-left">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {data.name}
          </h3>
          <p className="text-xs text-muted-foreground">{data.description}</p>
        </div>
      </div>

      <div className="space-y-1 my-3">
        {data.exercises.slice(0, 3).map((ex: any, i: number) => (
          <div key={i} className="text-xs text-muted-foreground flex justify-between">
            <span>• {ex.name}</span>
            <span>{ex.sets.length} series</span>
          </div>
        ))}
        {data.exercises.length > 3 && (
          <div className="text-xs text-muted-foreground italic">
            + {data.exercises.length - 3} ejercicios más
          </div>
        )}
      </div>

      <Button
        onClick={handleSave}
        disabled={saved}
        size="sm"
        className="w-full gap-2 rounded-lg"
        variant={saved ? "outline" : "default"}
      >
        {saved ? (
          <>¡Guardado!</>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Guardar como Plantilla
          </>
        )}
      </Button>
    </div>
  );
};

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  // Check for JSON block
  const jsonMatch = !isUser && message.content.match(/```json\s*({[\s\S]*?suggestion_type[\s\S]*?})\s*```/);
  let content = message.content;
  let suggestionData = null;

  if (jsonMatch) {
    try {
      suggestionData = JSON.parse(jsonMatch[1]);
      // Remove the JSON block from display content
      content = content.replace(jsonMatch[0], "").trim();
    } catch (e) {
      console.error("Failed to parse suggestion JSON", e);
    }
  }

  return (
    <div className={`flex items-start gap-2.5 animate-fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Bot className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${isUser
          ? "rounded-tr-sm bg-primary text-primary-foreground"
          : "rounded-tl-sm bg-card"
          }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none text-sm [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_strong]:text-primary [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display">
            <ReactMarkdown>{content}</ReactMarkdown>

            {suggestionData && (
              <WorkoutSuggestionCard data={suggestionData} />
            )}
          </div>
        )}

        {/* Tool call indicators */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 space-y-1.5 border-t border-border/30 pt-2">
            {message.toolCalls.map((tc, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-1.5">
                {tc.name === "log_exercises" ? (
                  <Dumbbell className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
                )}
                <span className="text-[11px] text-muted-foreground">
                  {tc.name === "log_exercises"
                    ? `${tc.data.exercises?.length || 0} ejercicio(s) registrados`
                    : `${tc.data.meals?.length || 0} alimento(s) registrados`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ChatPage = () => {
  const { messages, isLoading, sendMessage, stopGeneration } = useAICoach();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  const quickActions = [
    { label: "Registrar entreno", icon: Dumbbell, prompt: "He hecho entrenamiento de pecho: 4 series de press de banca a 80kg x 10 reps, 3 series de aperturas con mancuernas de 16kg x 12 reps" },
    { label: "Registrar comida", icon: UtensilsCrossed, prompt: "He comido 200g de pechuga de pollo con 150g de arroz blanco y ensalada" },
    { label: "Rutina semanal", icon: Sparkles, prompt: "Diseñame una rutina de entrenamiento semanal para ganar masa muscular, entreno 5 días" },
  ];

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col">
      {/* Header */}
      <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display">PeakCoach IA</h1>
            <p className="text-xs text-muted-foreground">Tu entrenador personal inteligente</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 no-scrollbar"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-card px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {/* Quick actions - only show on welcome */}
        {messages.length === 1 && (
          <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <p className="text-xs text-muted-foreground px-1">Prueba estos ejemplos:</p>
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(action.prompt);
                  inputRef.current?.focus();
                }}
                className="flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-3 text-left transition-colors hover:bg-card/80 glow-border"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <action.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/50 backdrop-blur-lg px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Escribe al coach..."
              rows={1}
              className="w-full resize-none rounded-2xl bg-secondary px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ maxHeight: "120px" }}
            />
          </div>
          {isLoading ? (
            <Button
              type="button"
              onClick={stopGeneration}
              size="icon"
              className="h-11 w-11 shrink-0 rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!input.trim()}
              size="icon"
              className="h-11 w-11 shrink-0 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
