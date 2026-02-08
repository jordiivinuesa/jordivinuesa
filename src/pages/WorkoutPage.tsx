import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useDbSync } from "@/hooks/useDbSync";
import { exercises, muscleGroupLabels, type MuscleGroup } from "@/data/exercises";
import { Plus, Dumbbell, Check, X, Trash2, Search, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const WorkoutPage = () => {
  const {
    activeWorkout,
    startWorkout,
    addExerciseToWorkout,
    addSetToExercise,
    updateSet,
    removeExerciseFromWorkout,
    finishWorkout,
    cancelWorkout,
  } = useAppStore();

  const { saveWorkoutToDb } = useDbSync();

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | "all">("all");
  const [workoutName, setWorkoutName] = useState("");
  const [showStartDialog, setShowStartDialog] = useState(false);

  const filteredExercises = exercises.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchMuscle = selectedMuscle === "all" || e.muscleGroup === selectedMuscle;
    return matchSearch && matchMuscle;
  });

  const muscleGroups = Object.entries(muscleGroupLabels) as [MuscleGroup, string][];

  const handleStartWorkout = () => {
    if (workoutName.trim()) {
      startWorkout(workoutName.trim());
      setShowStartDialog(false);
      setWorkoutName("");
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
    finishWorkout();
    if (workout) {
      saveWorkoutToDb(workout);
    }
  };

  if (!activeWorkout) {
    return (
      <div className="px-4 pt-6">
        <h1 className="mb-2 text-2xl font-bold font-display animate-fade-in">Entrenamiento</h1>
        <p className="mb-8 text-sm text-muted-foreground animate-fade-in">Registra tus ejercicios y pesos</p>

        <div className="flex flex-col items-center justify-center py-16 animate-slide-up">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 animate-pulse-glow">
            <Dumbbell className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mb-2 text-lg font-semibold font-display">Empieza tu entreno</h2>
          <p className="mb-8 text-center text-sm text-muted-foreground max-w-[240px]">
            Registra ejercicios, series y pesos para hacer seguimiento de tu progreso
          </p>
          <Button
            onClick={() => setShowStartDialog(true)}
            className="h-12 rounded-2xl bg-primary px-8 text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg"
            style={{ boxShadow: "0 0 20px hsl(82 85% 50% / 0.25)" }}
          >
            <Plus className="mr-2 h-5 w-5" />
            Nuevo Entrenamiento
          </Button>
        </div>

        <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
          <DialogContent className="bg-card border-border max-w-[340px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display">Nombre del entrenamiento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Ej: Pecho y tríceps, Piernas..."
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
                Empezar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6">
      <div className="mb-4 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-xl font-bold font-display">{activeWorkout.name}</h1>
          <p className="text-xs text-muted-foreground">{activeWorkout.exercises.length} ejercicios</p>
        </div>
        <div className="flex gap-2">
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
            <Check className="mr-1 h-4 w-4" />
            Terminar
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {activeWorkout.exercises.map((exercise, exIdx) => (
          <div key={exercise.id} className="rounded-2xl bg-card p-4 glow-border animate-fade-in">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{exercise.exerciseName}</h3>
              <button
                onClick={() => removeExerciseFromWorkout(exIdx)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="grid grid-cols-[32px_1fr_1fr_40px] gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">
                <span>Serie</span>
                <span>Peso (kg)</span>
                <span>Reps</span>
                <span></span>
              </div>
              {exercise.sets.map((set, setIdx) => (
                <div
                  key={set.id}
                  className={`grid grid-cols-[32px_1fr_1fr_40px] gap-2 items-center rounded-xl px-1 py-1.5 transition-colors ${
                    set.completed ? "bg-primary/10" : ""
                  }`}
                >
                  <span className="text-xs font-semibold text-muted-foreground text-center">{setIdx + 1}</span>
                  <Input
                    type="number"
                    value={set.weight || ""}
                    onChange={(e) =>
                      updateSet(exIdx, setIdx, { weight: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8 bg-secondary border-none text-center text-sm rounded-lg"
                    placeholder="0"
                  />
                  <Input
                    type="number"
                    value={set.reps || ""}
                    onChange={(e) =>
                      updateSet(exIdx, setIdx, { reps: parseInt(e.target.value) || 0 })
                    }
                    className="h-8 bg-secondary border-none text-center text-sm rounded-lg"
                    placeholder="0"
                  />
                  <button
                    onClick={() => updateSet(exIdx, setIdx, { completed: !set.completed })}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                      set.completed
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addSetToExercise(exIdx)}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Añadir serie
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowExercisePicker(true)}
        className="mt-4 mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
      >
        <Plus className="h-5 w-5" />
        Añadir ejercicio
      </button>

      <Dialog open={showExercisePicker} onOpenChange={setShowExercisePicker}>
        <DialogContent className="bg-card border-border max-w-[380px] max-h-[80vh] rounded-2xl p-0 overflow-hidden">
          <div className="p-4 pb-2">
            <DialogHeader>
              <DialogTitle className="font-display">Seleccionar ejercicio</DialogTitle>
            </DialogHeader>
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ejercicio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-secondary border-none pl-9 rounded-xl"
                autoFocus
              />
            </div>
            <div className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setSelectedMuscle("all")}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedMuscle === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                Todos
              </button>
              {muscleGroups.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMuscle(key)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedMuscle === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto px-4 pb-4 space-y-1">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => handleSelectExercise(exercise.id, exercise.name)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-secondary/70 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{exercise.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {muscleGroupLabels[exercise.muscleGroup]} · {exercise.type}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg]" />
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
