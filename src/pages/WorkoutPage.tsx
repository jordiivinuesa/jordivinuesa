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
import ActivityPicker from "@/components/workout/ActivityPicker";
import { Send, CheckCircle, XCircle, Activity } from "lucide-react";
import type { WorkoutTemplate } from "@/store/useAppStore";
import { useNotifications } from "@/hooks/useNotifications";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useNavigate } from "react-router-dom";
import ThreeExerciseViewer from "@/components/exercise/ThreeExerciseViewer";
import { RestTimer } from "@/components/workout/RestTimer";

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
    addTemplate,
    templates,
    deleteTemplate,
    activeWorkoutType,
    cancelWorkout,
    startRestTimer, // Import startRestTimer
    restTimerAutoStart, // Import restTimerAutoStart setting
    updateTemplate,
    startWorkoutFromTemplate,
    startActivity,
    updateActivity,
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
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const { pendingShares, updateShareStatus, fetchPendingShares } = useTemplateSharing();
  const [sharingTemplate, setSharingTemplate] = useState<WorkoutTemplate | null>(null);
  const [demoExercise, setDemoExercise] = useState<typeof exercises[0] | null>(null);

  const [showOverwriteConfirmation, setShowOverwriteConfirmation] = useState(false);
  const [pendingWorkoutStart, setPendingWorkoutStart] = useState<{
    name?: string;
    mode: "workout" | "template";
    template?: WorkoutTemplate;
  } | null>(null);

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

  const proceedWithWorkoutStart = (
    name?: string,
    mode: "workout" | "template" = "workout",
    template?: WorkoutTemplate
  ) => {
    // If starting from existing template
    if (template) {
      startWorkoutFromTemplate(template);
      setShowDetailView(true);
      return;
    }

    // If starting new workout/template from name
    if (name) {
      if (mode === "template") {
        // Check for duplicate name
        const isDuplicate = templates.some(
          (t) => t.name.trim().toLowerCase() === name.toLowerCase()
        );

        if (isDuplicate) {
          alert("Ya existe una plantilla con ese nombre. Por favor, elige otro nombre.");
          return;
        }

        const templateId = crypto.randomUUID();
        const newTemplate = {
          id: templateId,
          name,
          exercises: []
        };
        addTemplate(newTemplate);
        saveTemplateToDb(newTemplate);
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

  const handleStartWorkout = () => {
    const name = workoutName.trim();
    if (name) {
      if (activeWorkout) {
        setPendingWorkoutStart({ name, mode: startMode });
        setShowOverwriteConfirmation(true);
        return;
      }
      proceedWithWorkoutStart(name, startMode);
    }
  };

  const handleSelectExercise = (exerciseId: string, exerciseName: string) => {
    addExerciseToWorkout(exerciseId, exerciseName);
    setShowExercisePicker(false);
    setSearchQuery("");
    setSelectedMuscle("all");
  };

  const handleSelectActivity = (activityId: string, activityName: string) => {
    startActivity(activityId, activityName);
    setShowActivityDialog(false);
    setShowDetailView(true);
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
        updateTemplateInDb(fullTemplate, { silent: true });
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
      <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-20">
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

            <Button
              variant="outline"
              onClick={() => setShowActivityDialog(true)}
              className="h-28 flex flex-col items-center justify-center gap-2 rounded-2xl bg-card px-4 border-border glow-border hover:bg-secondary/50 transition-all"
            >
              <div className="p-2 bg-primary/10 rounded-xl">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs text-center leading-tight">Registrar Actividad</span>
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
                        onClick={(e) => {
                          e.stopPropagation();

                          if (activeWorkout) {
                            // Use a timeout to break out of the event loop and ensure state updates happen
                            // independently of the click event bubbling/capture phase
                            setTimeout(() => {
                              setPendingWorkoutStart({
                                name: template.name,
                                mode: "template",
                                template: template
                              });
                              setShowOverwriteConfirmation(true);
                            }, 10);
                            return;
                          }

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

        {/* Activity Picker Dialog */}
        <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
          <DialogContent className="bg-card border-border max-w-[500px] max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-2xl">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="font-display">Seleccionar Actividad</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <ActivityPicker onSelect={handleSelectActivity} />
            </div>
          </DialogContent>
        </Dialog>

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


        {/* Overwrite Confirmation Dialog */}
        <AlertDialog open={showOverwriteConfirmation} onOpenChange={setShowOverwriteConfirmation}>
          <AlertDialogContent className="bg-card border-border rounded-2xl max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Entrenamiento en curso</AlertDialogTitle>
              <AlertDialogDescription>
                Ya tienes un entrenamiento activo. Si empiezas uno nuevo, perderás el progreso del actual.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  cancelWorkout();
                  setShowOverwriteConfirmation(false);
                  if (pendingWorkoutStart) {
                    const { name, mode, template } = pendingWorkoutStart;

                    // Use timeout to allow state to settle after cancelWorkout
                    setTimeout(() => {
                      if (template) {
                        startWorkoutFromTemplate(template);
                      } else if (name) {
                        startWorkout(name, mode === "template" ? "template" : undefined);
                        if (mode === "template") {
                          setIsTemplateSaved(true);
                        } else {
                          setIsTemplateSaved(false);
                        }
                        setShowStartDialog(false);
                        setWorkoutName("");
                      }
                      setShowDetailView(true);
                      setPendingWorkoutStart(null);
                    }, 50);
                  }
                }}
              >
                Empezar nuevo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div >
    );
  }

  // Active Session View
  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-20 animate-fade-in">
      <div className="-mx-4">
        <RestTimer />
      </div>
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
        {/* Exercise-based workout (default for backward compatibility) */}
        {activeWorkout.type !== 'actividad' && activeWorkout.exercises && activeWorkout.exercises.map((exercise, exerciseIndex) => (
          <div key={exercise.id} className="rounded-2xl bg-card p-4 glow-border animate-slide-up" style={{ animationDelay: `${exerciseIndex * 0.1} s` }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <button
                  onClick={() => setDemoExercise(exercises.find(e => e.id === exercise.exerciseId) || null)}
                  className="h-12 w-12 rounded-lg bg-white overflow-hidden shrink-0 border border-border/50 flex items-center justify-center hover:scale-105 transition-transform"
                  title="Ver demostración"
                >
                  <ThreeExerciseViewer
                    muscleHighlight={exercises.find(e => e.id === exercise.exerciseId)?.muscleGroup}
                    equipmentType={exercises.find(e => e.id === exercise.exerciseId)?.type}
                    modelUrl={exercises.find(e => e.id === exercise.exerciseId)?.modelUrl}
                    minimal={true}
                  />
                </button>
                <h3 className="font-semibold font-display truncate">{exercise.exerciseName}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeExerciseFromWorkout(exerciseIndex)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
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
                    onClick={() => {
                      const isCompleting = !set.completed;
                      updateSet(exerciseIndex, setIndex, { completed: isCompleting });

                      // Start rest timer if completing a set and auto-start is enabled
                      if (isCompleting && restTimerAutoStart) {
                        startRestTimer(exercise.exerciseId);
                      }
                    }}
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

        {/* Activity-based workout */}
        {activeWorkout.type === 'actividad' && activeWorkout.activity && (
          <div className="rounded-2xl bg-card p-6 glow-border animate-slide-up space-y-6">
            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Duración (minutos)</label>
              <Input
                type="number"
                value={activeWorkout.activity.duration || ""}
                onChange={(e) => updateActivity({ duration: parseInt(e.target.value) || 0 })}
                placeholder="60"
                className="h-12 rounded-xl border-border bg-secondary/50 text-center text-2xl font-bold focus:ring-primary"
              />
            </div>

            {/* Intensity */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Intensidad</label>
              <div className="grid grid-cols-3 gap-3">
                {(['baja', 'media', 'alta'] as const).map((intensity) => (
                  <Button
                    key={intensity}
                    variant={activeWorkout.activity?.intensity === intensity ? "default" : "outline"}
                    onClick={() => updateActivity({ intensity })}
                    className="rounded-xl h-12 capitalize"
                  >
                    {intensity}
                  </Button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Notas (opcional)</label>
              <Input
                value={activeWorkout.activity.notes || ""}
                onChange={(e) => updateActivity({ notes: e.target.value })}
                placeholder="Ej: Partido amistoso, clase avanzada..."
                className="h-10 rounded-xl border-border bg-secondary/50 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {activeWorkout.type !== 'actividad' && (
          <Button
            onClick={() => setShowExercisePicker(true)}
            className="w-full h-14 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all font-display font-semibold"
          >
            <Plus className="mr-2 h-5 w-5" />
            Añadir Ejercicio
          </Button>
        )}
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
              <div
                className="mt-4 -mx-6 overflow-x-auto pb-2 no-scrollbar touch-pan-x"
                onWheel={(e) => {
                  if (e.deltaY !== 0) {
                    e.currentTarget.scrollLeft += e.deltaY;
                  }
                }}
              >
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
                className="group flex w-full items-center gap-4 rounded-3xl bg-secondary/30 p-4 text-left transition-all hover:bg-secondary/50 active:scale-[0.98] border border-transparent hover:border-primary/20 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setDemoExercise(ex);
                  }}
                  className="h-20 w-20 rounded-2xl bg-white overflow-hidden shrink-0 border border-border shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-500 cursor-pointer hover:ring-2 hover:ring-primary z-10"
                  title="Ver demostración"
                >
                  <ThreeExerciseViewer
                    muscleHighlight={ex.muscleGroup}
                    equipmentType={ex.type}
                    modelUrl={ex.modelUrl}
                    minimal={true}
                  />
                </div>

                <div className="min-w-0 flex-1 py-1">
                  <h4 className="font-bold text-base text-foreground leading-snug group-hover:text-primary transition-colors truncate">
                    {ex.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] uppercase font-black tracking-widest">
                      {muscleGroupLabels[ex.muscleGroup]}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-muted text-muted-foreground text-[10px] uppercase font-bold">
                      {ex.type}
                    </span>
                  </div>
                </div>
              </button>
            ))}
            {filteredExercises.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No se encontraron ejercicios</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 3D Demo Dialog */}
      <Dialog open={!!demoExercise} onOpenChange={(open) => !open && setDemoExercise(null)}>
        <DialogContent className="bg-card border-border max-w-md w-full aspect-square p-0 overflow-hidden rounded-3xl">
          <DialogHeader className="absolute top-4 left-4 z-10">
            <DialogTitle className="font-display text-lg text-black/80 bg-white/50 backdrop-blur-md px-3 py-1 rounded-full">
              {demoExercise?.name}
            </DialogTitle>
          </DialogHeader>
          {demoExercise && (
            <ThreeExerciseViewer
              muscleHighlight={demoExercise.muscleGroup}
              modelUrl={demoExercise.modelUrl}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Activity Picker Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="bg-card border-border max-w-[500px] max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="font-display">Seleccionar Actividad</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <ActivityPicker onSelect={handleSelectActivity} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Overwrite Confirmation Dialog */}
      <AlertDialog open={showOverwriteConfirmation} onOpenChange={setShowOverwriteConfirmation}>
        <AlertDialogContent className="bg-card border-border rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Entrenamiento en curso</AlertDialogTitle>
            <AlertDialogDescription>
              Ya tienes un entrenamiento activo. Si empiezas uno nuevo, perderás el progreso del actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                cancelWorkout();
                setShowOverwriteConfirmation(false);
                if (pendingWorkoutStart) {
                  proceedWithWorkoutStart(
                    pendingWorkoutStart.name,
                    pendingWorkoutStart.mode,
                    pendingWorkoutStart.template
                  );
                  setPendingWorkoutStart(null);
                }
              }}
            >
              Empezar nuevo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Overwrite Confirmation Dialog */}
      <AlertDialog open={showOverwriteConfirmation} onOpenChange={setShowOverwriteConfirmation}>
        <AlertDialogContent className="bg-card border-border rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Entrenamiento en curso</AlertDialogTitle>
            <AlertDialogDescription>
              Ya tienes un entrenamiento activo. Si empiezas uno nuevo, perderás el progreso del actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                cancelWorkout();
                setShowOverwriteConfirmation(false);
                if (pendingWorkoutStart) {
                  const { name, mode, template } = pendingWorkoutStart;

                  // Use timeout to allow state to settle after cancelWorkout
                  setTimeout(() => {
                    if (template) {
                      startWorkoutFromTemplate(template);
                    } else if (name) {
                      startWorkout(name, mode === "template" ? "template" : undefined);
                      if (mode === "template") {
                        setIsTemplateSaved(true);
                      } else {
                        setIsTemplateSaved(false);
                      }
                      setShowStartDialog(false);
                      setWorkoutName("");
                    }
                    setShowDetailView(true);
                    setPendingWorkoutStart(null);
                  }, 50);
                }
              }}
            >
              Empezar nuevo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkoutPage;
