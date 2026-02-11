import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useDbSync } from "@/hooks/useDbSync";
import { exercises, type MuscleGroup, muscleGroupLabels } from "@/data/exercises";
import { Plus, Dumbbell, Check, X, Trash2, Search, ArrowLeft, Bookmark, ChevronDown, ChevronRight, CheckCircle2, History } from "lucide-react";
import { removeAccents } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTemplateSharing, type SharedTemplate } from "@/hooks/useTemplateSharing";
import ShareTemplateDialog from "@/components/workout/ShareTemplateDialog";
import { Send, CheckCircle, XCircle } from "lucide-react";
import type { WorkoutTemplate } from "@/store/useAppStore";
import { useNotifications } from "@/hooks/useNotifications";

import { useNavigate } from "react-router-dom";

const WorkoutPage = () => {
  const navigate = useNavigate();
  const {
    activeWorkout,
    activeTemplateId,
    startWorkout,
    addExerciseToWorkout,
    addSetToExercise,
    updateSet,
    removeExerciseFromWorkout,
    finishWorkout,
    cancelWorkout,
    activeWorkoutType,
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    startWorkoutFromTemplate,
  } = useAppStore();

  const { saveWorkoutToDb, saveTemplateToDb, updateTemplateInDb, deleteTemplateFromDb, loadTemplates } = useDbSync();
  const { markAsRead } = useNotifications();

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | "all">("all");
  const [workoutName, setWorkoutName] = useState("");
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [startMode, setStartMode] = useState<"workout" | "template">("workout");
  const [isTemplateSaved, setIsTemplateSaved] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const { pendingShares, updateShareStatus, fetchPendingShares } = useTemplateSharing();
  const [sharingTemplate, setSharingTemplate] = useState<WorkoutTemplate | null>(null);

  // Clear share notifications when entering workout page
  useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  const filteredExercises = exercises.filter((e) => {
    const normalizedName = removeAccents(e.name.toLowerCase());
    const normalizedQuery = removeAccents(searchQuery.toLowerCase());
    const matchSearch = normalizedName.includes(normalizedQuery);
    const matchMuscle = selectedMuscle === "all" || e.muscleGroup === selectedMuscle;
    return matchSearch && matchMuscle;
  });

  const muscleGroups = Object.entries(muscleGroupLabels) as [MuscleGroup, string][];

  const handleStartWorkout = () => {
    const name = workoutName.trim();
    if (name) {
      if (startMode === "template") {
        // Check for duplicate name
        const isDuplicate = templates.some(
          (t) => t.name.trim().toLowerCase() === name.toLowerCase()
        );

        if (isDuplicate) {
          toast.error("Ya existe una plantilla con este nombre");
          return;
        }

        const templateId = crypto.randomUUID();
        const template = {
          id: templateId,
          name,
          exercises: []
        };
        addTemplate(template);
        saveTemplateToDb(template);
        startWorkout(name, "template");
        useAppStore.setState({ activeTemplateId: templateId });
        setIsTemplateSaved(true);
      } else {
        startWorkout(name);
        setIsTemplateSaved(false);
      }
      setShowStartDialog(false);
      setWorkoutName("");
      setShowDetailView(true);
    }
  };

  const handleSelectExercise = (exerciseId: string, exerciseName: string) => {
    addExerciseToWorkout(exerciseId, exerciseName);
    setShowExercisePicker(false);
    setSearchQuery("");
    setSelectedMuscle("all");
  };

  const handleFinishWorkout = () => {
    const workout = useAppStore.getState().activeWorkout;
    const type = useAppStore.getState().activeWorkoutType;

    finishWorkout();

    if (type === "workout" && workout) {
      saveWorkoutToDb(workout);
      toast.success("¡Entrenamiento finalizado!");
    } else {
      toast.success("¡Plantilla creada!");
    }
    setShowDetailView(false);
  };

  const handleSaveAsTemplate = () => {
    if (!activeWorkout) return;

    // Check for duplicate name
    const isDuplicate = templates.some(
      (t) => t.name.trim().toLowerCase() === activeWorkout.name.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast.error("Ya existe una plantilla con este nombre");
      return;
    }

    const templateId = crypto.randomUUID();
    const template = {
      id: templateId,
      name: activeWorkout.name,
      exercises: activeWorkout.exercises.map(ex => ({
        id: ex.id || crypto.randomUUID(),
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets: ex.sets.map(s => ({
          id: s.id || crypto.randomUUID(),
          reps: s.reps,
          weight: s.weight
        }))
      }))
    };
    addTemplate(template);
    saveTemplateToDb(template);
    setIsTemplateSaved(true);
    // Link the current workout to this template for auto-sync
    useAppStore.setState({ activeTemplateId: templateId });
    toast.success("Plantilla guardada correctamente");
  };

  // Auto-sync active workout to template if linked
  useEffect(() => {
    if (activeWorkout && activeTemplateId) {
      const timer = setTimeout(() => {
        const fullTemplate = {
          id: activeTemplateId,
          name: activeWorkout.name,
          exercises: activeWorkout.exercises.map(ex => ({
            id: ex.id,
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            sets: ex.sets.map(s => ({
              id: s.id,
              reps: s.reps,
              weight: s.weight
            }))
          }))
        };
        updateTemplate(fullTemplate);
        updateTemplateInDb(fullTemplate);
      }, 1000); // 1 second debounce
      return () => clearTimeout(timer);
    }
  }, [activeWorkout, activeTemplateId, updateTemplate, updateTemplateInDb]);

  const handleAcceptShare = async (share: SharedTemplate) => {
    // Check for duplicate name
    const isDuplicate = templates.some(
      (t) => t.name.trim().toLowerCase() === share.template_name.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast.error("Ya tienes una plantilla con este nombre");
      return;
    }

    const template: WorkoutTemplate = {
      id: crypto.randomUUID(),
      name: share.template_name,
      exercises: share.template_data.exercises
    };

    // Add to store
    addTemplate(template);
    // Add to DB
    await saveTemplateToDb(template);

    // Update status in shared table
    await updateShareStatus(share.id, "accepted");
    toast.success(`Plantilla "${template.name}" añadida a tu biblioteca`);
  };

  const handleRejectShare = async (shareId: string) => {
    await updateShareStatus(shareId, "rejected");
    toast.info("Plantilla rechazada");
  };

  // Dashboard View
  if (!activeWorkout || !showDetailView) {
    return (
      <div className="px-4 pt-6 pb-20">
        <div className="flex items-center justify-between mb-2 animate-fade-in text-foreground">
          <div>
            <h1 className="text-2xl font-bold font-display">Entrenamiento</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/history?tab=workouts")}
            className="rounded-xl h-9 w-9 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Ver historial de entrenamientos"
          >
            <History className="h-5 w-5" />
          </Button>
        </div>
        <p className="mb-8 text-sm text-muted-foreground animate-fade-in">Registra tus ejercicios y pesos</p>

        <div className="flex flex-col gap-6 animate-slide-up">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => {
                if (activeWorkout) {
                  setShowDetailView(true);
                } else {
                  setStartMode("workout");
                  setShowStartDialog(true);
                }
              }}
              className="h-28 flex flex-col items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 transition-all glow-border"
              style={{ boxShadow: "0 0 20px hsl(82 85% 50% / 0.15)" }}
            >
              <div className="p-2 bg-white/20 rounded-xl">
                {activeWorkout ? <Dumbbell className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
              <span className="text-xs text-center leading-tight">
                {activeWorkout ? "Continuar Entrenamiento" : "Iniciar Entrenamiento"}
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setStartMode("template");
                setShowStartDialog(true);
              }}
              className="h-28 flex flex-col items-center justify-center gap-2 rounded-2xl bg-card px-4 border-border glow-border hover:bg-secondary/50 transition-all"
            >
              <div className="p-2 bg-primary/10 rounded-xl">
                <Bookmark className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs">Crear Plantilla</span>
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-foreground">Tus Plantillas</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadTemplates()}
                className="h-7 px-2 text-[10px] text-muted-foreground hover:text-primary"
              >
                Actualizar
              </Button>
            </div>

            {/* Pending Shares Notifications */}
            {pendingShares.length > 0 && (
              <div className="space-y-2 mb-2">
                {pendingShares.map((share) => (
                  <div key={share.id} className="rounded-2xl bg-primary/5 border border-primary/20 p-4 animate-scale-in">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold border border-primary/30">
                        {share.sender_profile?.display_name?.[0].toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">
                          <span className="font-bold">{share.sender_profile?.display_name || "Un usuario"}</span> te ha compartido una plantilla
                        </p>
                        <p className="text-[10px] font-semibold text-primary truncate">"{share.template_name}"</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRejectShare(share.id)}
                        className="flex-1 h-8 rounded-xl text-[10px] hover:bg-destructive/10 hover:text-destructive"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptShare(share)}
                        className="flex-1 h-8 rounded-xl text-[10px]"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aceptar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {templates.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {templates.map((template) => (
                  <div key={template.id} className="rounded-2xl bg-card p-4 glow-border flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{template.name}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {template.exercises.length} ejercicios · {template.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)} series
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSharingTemplate(template)}
                        className="rounded-xl h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                        title="Compartir con un amigo"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          deleteTemplate(template.id);
                          deleteTemplateFromDb(template.id);
                        }}
                        className="rounded-xl h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          startWorkoutFromTemplate(template);
                          setShowDetailView(true);
                        }}
                        className="rounded-xl h-8 px-4 text-xs"
                      >
                        Empezar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 flex flex-col items-center justify-center gap-2 bg-card/30">
                <Bookmark className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground text-center">No tienes plantillas guardadas</p>
              </div>
            )}
          </div>
        </div>

        <ShareTemplateDialog
          open={!!sharingTemplate}
          onOpenChange={(open) => !open && setSharingTemplate(null)}
          template={sharingTemplate}
        />

        <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
          <DialogContent className="bg-card border-border max-w-[340px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display">
                {startMode === "template" ? "Nombre de la plantilla" : "Nombre del entrenamiento"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder={startMode === "template" ? "Ej: Full Body, Push Day..." : "Ej: Pecho y tríceps, Piernas..."}
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="bg-secondary border-border"
                onKeyDown={(e) => e.key === "Enter" && handleStartWorkout()}
                autoFocus
              />
              <Button
                onClick={handleStartWorkout}
                disabled={!workoutName.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {startMode === "template" ? "Crear Plantilla" : "Empezar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div >
    );
  }

  // Active Session View
  return (
    <div className="px-4 pt-6 pb-20 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetailView(false)}
            className="h-8 w-8 p-0 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-display">{activeWorkout.name}</h1>
            <p className="text-xs text-muted-foreground">
              {activeWorkoutType === 'template' ? 'Creando plantilla...' : 'Entrenamiento en curso'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveAsTemplate}
            className={`rounded-xl border-primary/30 transition-all ${(isTemplateSaved || activeTemplateId)
              ? "bg-primary/20 text-primary border-primary shadow-[0_0_10px_rgba(132,204,22,0.3)]"
              : "text-primary hover:bg-primary/10"
              }`}
            title={(isTemplateSaved || activeTemplateId) ? "Plantilla guardada y sincronizada" : "Guardar como plantilla"}
          >
            <Bookmark className={`h-4 w-4 ${(isTemplateSaved || activeTemplateId) ? "fill-primary" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={cancelWorkout}
            className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleFinishWorkout}
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {activeWorkout.exercises.map((exercise, exerciseIndex) => (
          <div key={exercise.id} className="rounded-2xl bg-card p-4 glow-border animate-slide-up" style={{ animationDelay: `${exerciseIndex * 0.1} s` }}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold font-display">{exercise.exerciseName}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeExerciseFromWorkout(exerciseIndex)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-3 grid grid-cols-[1fr,1fr,auto] gap-4 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Peso (kg)</span>
              <span>Reps</span>
              <span className="w-8"></span>
            </div>

            <div className="space-y-2">
              {exercise.sets.map((set, setIndex) => (
                <div key={set.id} className="grid grid-cols-[1fr,1fr,auto] gap-4 items-center">
                  <Input
                    type="number"
                    value={set.weight || ""}
                    onChange={(e) => updateSet(exerciseIndex, setIndex, { weight: parseFloat(e.target.value) || 0 })}
                    className="h-10 rounded-xl border-border bg-secondary/50 text-center font-medium focus:ring-primary"
                  />
                  <Input
                    type="number"
                    value={set.reps || ""}
                    onChange={(e) => updateSet(exerciseIndex, setIndex, { reps: parseInt(e.target.value) || 0 })}
                    className="h-10 rounded-xl border-border bg-secondary/50 text-center font-medium focus:ring-primary"
                  />
                  <Button
                    variant={set.completed ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSet(exerciseIndex, setIndex, { completed: !set.completed })}
                    className={`h - 10 w - 10 rounded - xl transition - all ${set.completed ? "bg-primary text-primary-foreground scale-95" : "border-border text-muted-foreground hover:border-primary/50"} `}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => addSetToExercise(exerciseIndex)}
              className="mt-4 w-full rounded-xl border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
            >
              <Plus className="mr-2 h-3 w-3" />
              Añadir Serie
            </Button>
          </div>
        ))}

        <Button
          onClick={() => setShowExercisePicker(true)}
          className="w-full h-14 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all font-display font-semibold"
        >
          <Plus className="mr-2 h-5 w-5" />
          Añadir Ejercicio
        </Button>
      </div>

      <Dialog open={showExercisePicker} onOpenChange={setShowExercisePicker}>
        <DialogContent className="bg-card border-border h-[80vh] flex flex-col p-0 overflow-hidden rounded-t-3xl sm:rounded-2xl">
          <div className="p-6 pb-2">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-display text-xl">Añadir Ejercicio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar ejercicio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-secondary pl-9 h-11 rounded-xl border-border"
                />
              </div>
              <div className="mt-4 -mx-6 overflow-x-auto pb-2 no-scrollbar touch-pan-x">
                <div className="flex gap-2 px-6 whitespace-nowrap">
                  <Button
                    variant={selectedMuscle === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMuscle("all")}
                    className="rounded-xl h-8 px-4 text-xs shrink-0"
                  >
                    Todos
                  </Button>
                  {muscleGroups.map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedMuscle === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedMuscle(key)}
                      className="rounded-xl h-8 px-4 text-xs shrink-0"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-3 no-scrollbar">
            {filteredExercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => handleSelectExercise(ex.id, ex.name)}
                className="flex w-full items-center justify-between rounded-2xl bg-secondary/50 p-4 text-left transition-all hover:bg-secondary active:scale-[0.98] glow-border"
              >
                <div>
                  <h4 className="font-semibold text-sm">{ex.name}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                    {muscleGroupLabels[ex.muscleGroup]}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
              </button>
            ))}
            {filteredExercises.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No se encontraron ejercicios</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutPage;
