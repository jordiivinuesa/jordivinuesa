import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exercises, muscleGroupLabels, type MuscleGroup } from "@/data/exercises";
import { Plus, Trash2, Check, X, Search, ChevronDown, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore, type Workout, type WorkoutExercise, type WorkoutSet } from "@/store/useAppStore";
import { toast } from "@/hooks/use-toast";

interface EditWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: Workout;
  date: string;
  onSaved: () => void;
}

const EditWorkoutDialog = ({ open, onOpenChange, workout, date, onSaved }: EditWorkoutDialogProps) => {
  const { user } = useAuth();
  const [editedExercises, setEditedExercises] = useState<WorkoutExercise[]>([]);
  const [workoutName, setWorkoutName] = useState(workout.name);
  const [saving, setSaving] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | "all">("all");

  // Track deleted IDs for DB cleanup
  const [deletedExerciseIds, setDeletedExerciseIds] = useState<string[]>([]);
  const [deletedSetIds, setDeletedSetIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setEditedExercises(workout.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => ({ ...s })),
      })));
      setWorkoutName(workout.name);
      setDeletedExerciseIds([]);
      setDeletedSetIds([]);
    }
  }, [open, workout]);

  const filteredExercises = exercises.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchMuscle = selectedMuscle === "all" || e.muscleGroup === selectedMuscle;
    return matchSearch && matchMuscle;
  });

  const muscleGroups = Object.entries(muscleGroupLabels) as [MuscleGroup, string][];

  const addExercise = (exerciseId: string, exerciseName: string) => {
    setEditedExercises((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        exerciseId,
        exerciseName,
        sets: [{ id: crypto.randomUUID(), reps: 0, weight: 0, completed: false }],
      },
    ]);
    setShowExercisePicker(false);
    setSearchQuery("");
    setSelectedMuscle("all");
  };

  const removeExercise = (index: number) => {
    const ex = editedExercises[index];
    // Track for DB deletion if it was a previously saved exercise
    if (workout.exercises.find((e) => e.id === ex.id)) {
      setDeletedExerciseIds((prev) => [...prev, ex.id]);
    }
    setEditedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const addSet = (exIndex: number) => {
    setEditedExercises((prev) => {
      const updated = [...prev];
      const lastSet = updated[exIndex].sets[updated[exIndex].sets.length - 1];
      updated[exIndex] = {
        ...updated[exIndex],
        sets: [
          ...updated[exIndex].sets,
          {
            id: crypto.randomUUID(),
            reps: lastSet?.reps || 0,
            weight: lastSet?.weight || 0,
            completed: false,
          },
        ],
      };
      return updated;
    });
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    const set = editedExercises[exIndex].sets[setIndex];
    // Track for DB deletion
    const originalEx = workout.exercises.find((e) => e.id === editedExercises[exIndex].id);
    if (originalEx?.sets.find((s) => s.id === set.id)) {
      setDeletedSetIds((prev) => [...prev, set.id]);
    }
    setEditedExercises((prev) => {
      const updated = [...prev];
      updated[exIndex] = {
        ...updated[exIndex],
        sets: updated[exIndex].sets.filter((_, i) => i !== setIndex),
      };
      return updated;
    });
  };

  const updateSet = (exIndex: number, setIndex: number, data: Partial<WorkoutSet>) => {
    setEditedExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIndex].sets];
      sets[setIndex] = { ...sets[setIndex], ...data };
      updated[exIndex] = { ...updated[exIndex], sets };
      return updated;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Update workout name
      await supabase
        .from("workouts")
        .update({ name: workoutName })
        .eq("id", workout.id);

      // Delete removed sets
      if (deletedSetIds.length > 0) {
        await supabase.from("workout_sets").delete().in("id", deletedSetIds);
      }

      // Delete removed exercises (cascades to sets)
      if (deletedExerciseIds.length > 0) {
        // First delete sets for those exercises
        await supabase
          .from("workout_sets")
          .delete()
          .in("workout_exercise_id", deletedExerciseIds);
        await supabase
          .from("workout_exercises")
          .delete()
          .in("id", deletedExerciseIds);
      }

      // Upsert exercises and sets
      for (let i = 0; i < editedExercises.length; i++) {
        const ex = editedExercises[i];
        const isExisting = workout.exercises.find((e) => e.id === ex.id);

        if (isExisting) {
          // Update order
          await supabase
            .from("workout_exercises")
            .update({ order_index: i })
            .eq("id", ex.id);
        } else {
          // Insert new exercise
          await supabase.from("workout_exercises").insert({
            id: ex.id,
            workout_id: workout.id,
            exercise_id: ex.exerciseId,
            exercise_name: ex.exerciseName,
            order_index: i,
          });
        }

        // Handle sets
        for (let si = 0; si < ex.sets.length; si++) {
          const s = ex.sets[si];
          const isExistingSet = isExisting?.sets.find((ss) => ss.id === s.id);

          if (isExistingSet) {
            await supabase
              .from("workout_sets")
              .update({
                reps: s.reps,
                weight: s.weight,
                completed: s.completed,
                set_index: si,
              })
              .eq("id", s.id);
          } else {
            await supabase.from("workout_sets").insert({
              id: s.id,
              workout_exercise_id: ex.id,
              set_index: si,
              reps: s.reps,
              weight: s.weight,
              completed: s.completed,
            });
          }
        }
      }

      // Update local state
      const updatedWorkout: Workout = {
        ...workout,
        name: workoutName,
        exercises: editedExercises,
      };

      useAppStore.setState((state) => ({
        dayLogs: {
          ...state.dayLogs,
          [date]: {
            ...state.dayLogs[date],
            workout: updatedWorkout,
          },
        },
      }));

      toast({ title: "Entrenamiento actualizado ✅" });
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast({ variant: "destructive", title: "Error al guardar", description: String(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open && !showExercisePicker} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border max-w-[420px] max-h-[85vh] rounded-2xl p-0 overflow-hidden">
          <div className="p-4 pb-2">
            <DialogHeader>
              <DialogTitle className="font-display">Editar entrenamiento</DialogTitle>
            </DialogHeader>
            <Input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="mt-3 bg-secondary border-none rounded-xl"
              placeholder="Nombre del entrenamiento"
            />
          </div>

          <div className="overflow-y-auto max-h-[55vh] px-4 pb-2 space-y-3">
            {editedExercises.map((exercise, exIdx) => (
              <div key={exercise.id} className="rounded-xl bg-secondary/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">{exercise.exerciseName}</h3>
                  <button
                    onClick={() => removeExercise(exIdx)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="grid grid-cols-[28px_1fr_1fr_32px_32px] gap-1.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wider px-0.5">
                    <span>#</span>
                    <span>Peso</span>
                    <span>Reps</span>
                    <span></span>
                    <span></span>
                  </div>
                  {exercise.sets.map((set, setIdx) => (
                    <div
                      key={set.id}
                      className={`grid grid-cols-[28px_1fr_1fr_32px_32px] gap-1.5 items-center rounded-lg px-0.5 py-1 transition-colors ${
                        set.completed ? "bg-primary/10" : ""
                      }`}
                    >
                      <span className="text-xs text-muted-foreground text-center">{setIdx + 1}</span>
                      <Input
                        type="number"
                        value={set.weight || ""}
                        onChange={(e) => updateSet(exIdx, setIdx, { weight: parseFloat(e.target.value) || 0 })}
                        className="h-7 bg-background border-none text-center text-xs rounded-md"
                        placeholder="0"
                      />
                      <Input
                        type="number"
                        value={set.reps || ""}
                        onChange={(e) => updateSet(exIdx, setIdx, { reps: parseInt(e.target.value) || 0 })}
                        className="h-7 bg-background border-none text-center text-xs rounded-md"
                        placeholder="0"
                      />
                      <button
                        onClick={() => updateSet(exIdx, setIdx, { completed: !set.completed })}
                        className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
                          set.completed
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeSet(exIdx, setIdx)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addSet(exIdx)}
                  className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-primary hover:bg-primary/5 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Serie
                </button>
              </div>
            ))}

            <button
              onClick={() => setShowExercisePicker(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
            >
              <Plus className="h-4 w-4" />
              Añadir ejercicio
            </button>
          </div>

          <div className="p-4 pt-2 flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" />Guardar</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise picker dialog */}
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
                  selectedMuscle === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                Todos
              </button>
              {muscleGroups.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMuscle(key)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedMuscle === key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
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
                onClick={() => addExercise(exercise.id, exercise.name)}
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
    </>
  );
};

export default EditWorkoutDialog;
