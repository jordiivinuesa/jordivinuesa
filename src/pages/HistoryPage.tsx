
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/store/useAppStore";
import { useDbSync } from "@/hooks/useDbSync";
import { Calendar, Dumbbell, Flame, TrendingUp, Pencil, Apple, Loader2, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

import EditWorkoutDialog from "@/components/workout/EditWorkoutDialog";
import EditMealDialog from "@/components/nutrition/EditMealDialog";
import type { Workout, WorkoutExercise, WorkoutSet, MealEntry } from "@/store/useAppStore";

const HistoryPage = () => {
  const { user } = useAuth();
  const { dayLogs } = useAppStore();
  const { loadWorkout } = useDbSync();
  const [editingWorkout, setEditingWorkout] = useState<{ workout: Workout; date: string } | null>(null);
  const [editingMeal, setEditingMeal] = useState<{ meal: MealEntry; date: string } | null>(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);
  const [historyWorkouts, setHistoryWorkouts] = useState<Workout[]>([]);
  const [historyNutrition, setHistoryNutrition] = useState<{ date: string; meals: MealEntry[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNutrition, setLoadingNutrition] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: workouts, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching history:", error);
      setLoading(false);
      return;
    }

    const formattedWorkouts: Workout[] = [];

    for (const workout of workouts || []) {
      const { data: exercises } = await supabase
        .from("workout_exercises")
        .select("*")
        .eq("workout_id", workout.id)
        .order("order_index");

      const workoutExercises: WorkoutExercise[] = [];

      if (exercises) {
        for (const ex of exercises) {
          const { data: sets } = await supabase
            .from("workout_sets")
            .select("*")
            .eq("workout_exercise_id", ex.id)
            .order("set_index");

          workoutExercises.push({
            id: ex.id,
            exerciseId: ex.exercise_id,
            exerciseName: ex.exercise_name,
            sets: (sets || []).map((s) => ({
              id: s.id,
              reps: s.reps,
              weight: Number(s.weight),
              completed: s.completed,
            })),
          });
        }
      }

      formattedWorkouts.push({
        id: workout.id,
        date: workout.date,
        name: workout.name,
        exercises: workoutExercises,
        duration: workout.duration ?? undefined,
      });
    }
    setHistoryWorkouts(formattedWorkouts);
    setLoading(false);
  }, [user]);

  const fetchNutrition = useCallback(async () => {
    if (!user) return;
    setLoadingNutrition(true);
    const { data: meals, error } = await supabase
      .from("meal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching nutrition history:", error);
      setLoadingNutrition(false);
      return;
    }

    const groupedMeals: Record<string, MealEntry[]> = {};
    meals?.forEach((m) => {
      const entry: MealEntry = {
        id: m.id,
        foodId: m.food_id,
        foodName: m.food_name,
        grams: Number(m.grams),
        calories: Number(m.calories),
        protein: Number(m.protein),
        carbs: Number(m.carbs),
        fat: Number(m.fat),
        mealType: m.meal_type as MealEntry["mealType"],
      };

      if (!groupedMeals[m.date]) {
        groupedMeals[m.date] = [];
      }
      groupedMeals[m.date].push(entry);
    });

    const sortedHistory = Object.entries(groupedMeals)
      .map(([date, meals]) => ({ date, meals }))
      .sort((a, b) => b.date.localeCompare(a.date));

    setHistoryNutrition(sortedHistory);
    setLoadingNutrition(false);
  }, [user]);

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
      if (error) throw error;

      // Update local state without refetching for faster UI
      setHistoryWorkouts(prev => prev.filter(w => w.id !== workoutId));

      // Also update dayLogs if it's currently loaded there
      const workoutDate = historyWorkouts.find(w => w.id === workoutId)?.date;
      if (workoutDate) {
        useAppStore.setState(state => ({
          dayLogs: {
            ...state.dayLogs,
            [workoutDate]: {
              ...state.dayLogs[workoutDate],
              workout: undefined
            }
          }
        }));
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
    } finally {
      setDeletingWorkoutId(null);
    }
  };

  const handleUpdateMeal = async (updatedMeal: MealEntry) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("meal_entries")
        .update({
          grams: updatedMeal.grams,
          calories: updatedMeal.calories,
          protein: updatedMeal.protein,
          carbs: updatedMeal.carbs,
          fat: updatedMeal.fat,
        })
        .eq("id", updatedMeal.id);

      if (error) throw error;

      // Update local state
      setHistoryNutrition(prev => prev.map(day => {
        if (day.date === editingMeal?.date) {
          return {
            ...day,
            meals: day.meals.map(m => m.id === updatedMeal.id ? updatedMeal : m)
          }
        }
        return day;
      }));

      // Update dayLogs if needed
      if (editingMeal?.date) {
        useAppStore.setState((state) => ({
          dayLogs: {
            ...state.dayLogs,
            [editingMeal.date]: {
              ...state.dayLogs[editingMeal.date],
              meals: state.dayLogs[editingMeal.date]?.meals.map(m => m.id === updatedMeal.id ? updatedMeal : m) || []
            },
          },
        }));
      }

    } catch (error) {
      console.error("Error updating meal:", error);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("meal_entries").delete().eq("id", mealId);
      if (error) throw error;

      // Find the date of the meal before deleting from state (optimistic update needs it? no, we can remove)
      // Actually we need the date to update dayLogs properly if we want full consistency
      let mealDate = "";

      // Update local state
      setHistoryNutrition(prev => prev.map(day => {
        const hasMeal = day.meals.some(m => m.id === mealId);
        if (hasMeal) {
          mealDate = day.date;
          return {
            ...day,
            meals: day.meals.filter(m => m.id !== mealId)
          };
        }
        return day;
      }).filter(day => day.meals.length > 0)); // Remove empty days if any

      // Update dayLogs
      if (mealDate) {
        useAppStore.setState((state) => ({
          dayLogs: {
            ...state.dayLogs,
            [mealDate]: {
              ...state.dayLogs[mealDate],
              meals: state.dayLogs[mealDate]?.meals.filter(m => m.id !== mealId) || []
            },
          },
        }));
      }

    } catch (error) {
      console.error("Error deleting meal:", error);
    } finally {
      setDeletingMealId(null);
    }
  }

  useEffect(() => {
    fetchHistory();
    fetchNutrition();
  }, [fetchHistory, fetchNutrition]);

  const sortedDays = Object.keys(dayLogs)
    .sort((a, b) => b.localeCompare(a))
    .map((date) => ({ date, log: dayLogs[date] }));

  // Removed old workoutDays derivation based on dayLogs
  // const workoutDays = sortedDays.filter(({ log }) => !!log.workout);
  // const nutritionDays = sortedDays.filter(({ log }) => (log.meals?.length ?? 0) > 0);

  const formatDate = (date: string) => {
    const dateObj = new Date(date + "T12:00:00");
    return dateObj.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  };

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-2 text-2xl font-bold font-display animate-fade-in">Historial</h1>
      <p className="mb-4 text-sm text-muted-foreground animate-fade-in">Tu progreso día a día</p>

      <Tabs defaultValue="workouts" className="animate-fade-in">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="workouts" className="flex-1 gap-1.5">
            <Dumbbell className="h-4 w-4" />
            Entrenamientos
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex-1 gap-1.5">
            <Apple className="h-4 w-4" />
            Nutrición
          </TabsTrigger>
        </TabsList>

        {/* WORKOUTS TAB */}
        <TabsContent value="workouts">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : historyWorkouts.length === 0 ? (
            <div className="flex flex-col items-center py-20 animate-slide-up">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <Dumbbell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="mb-1 text-base font-semibold font-display">Sin entrenamientos</h2>
              <p className="text-sm text-muted-foreground text-center max-w-[200px]">
                Registra tu primer entrenamiento para verlo aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyWorkouts.map((workout, idx) => {
                const date = workout.date;
                const totalSets = workout.exercises.reduce(
                  (acc, ex) => acc + ex.sets.filter((s) => s.completed).length, 0
                );
                return (
                  <div
                    key={workout.id}
                    className="rounded-2xl bg-card p-4 glow-border animate-fade-in"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold font-display capitalize">{formatDate(date)}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingWorkout({ workout, date })}
                          className="rounded-md p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Editar entrenamiento"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingWorkoutId(workout.id)}
                          className="rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Eliminar entrenamiento"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1">
                      <Dumbbell className="h-3.5 w-3.5 text-primary" />
                      <p className="text-sm font-bold">{workout.name}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">
                      {workout.exercises.length} ejercicios · {totalSets} series
                    </p>

                    {workout.exercises.length > 0 && (
                      <div className="space-y-1">
                        {workout.exercises.map((ex) => {
                          const bestSet = ex.sets
                            .filter((s) => s.completed)
                            .sort((a, b) => b.weight - a.weight)[0];
                          return (
                            <div key={ex.id} className="flex items-center justify-between px-2 py-1">
                              <span className="text-xs text-foreground">{ex.exerciseName}</span>
                              {bestSet && (
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3 text-primary" />
                                  {bestSet.weight}kg × {bestSet.reps}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* NUTRITION TAB */}
        <TabsContent value="nutrition">
          {loadingNutrition ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : historyNutrition.length === 0 ? (
            <div className="flex flex-col items-center py-20 animate-slide-up">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <Apple className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="mb-1 text-base font-semibold font-display">Sin registros</h2>
              <p className="text-sm text-muted-foreground text-center max-w-[200px]">
                Registra tus comidas para ver tu historial nutricional
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyNutrition.map(({ date, meals }, idx) => {
                const totals = meals.reduce(
                  (acc, m) => ({
                    calories: acc.calories + m.calories,
                    protein: acc.protein + m.protein,
                    carbs: acc.carbs + m.carbs,
                    fat: acc.fat + m.fat,
                  }),
                  { calories: 0, protein: 0, carbs: 0, fat: 0 }
                );

                const mealsByType: Record<string, typeof meals> = {};
                meals.forEach((m) => {
                  const type = m.mealType || "otros";
                  if (!mealsByType[type]) mealsByType[type] = [];
                  mealsByType[type].push(m);
                });

                const mealTypeLabels: Record<string, string> = {
                  desayuno: "🌅 Desayuno",
                  almuerzo: "🥪 Almuerzo",
                  comida: "🍽️ Comida",
                  merienda: "🍪 Merienda",
                  cena: "🌙 Cena",
                  snack: "🍫 Snack",
                  otros: "📦 Otros",
                };

                return (
                  <div
                    key={date}
                    className="rounded-2xl bg-card p-4 glow-border animate-fade-in"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold font-display capitalize">{formatDate(date)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1">
                      <Flame className="h-3.5 w-3.5 text-primary" />
                      <p className="text-sm font-bold">{Math.round(totals.calories)} kcal</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-3">
                      P: {Math.round(totals.protein)}g · C: {Math.round(totals.carbs)}g · G: {Math.round(totals.fat)}g
                    </p>

                    <div className="space-y-2">
                      {Object.entries(mealsByType).map(([type, meals]) => (
                        <div key={type}>
                          <p className="text-[11px] font-medium text-muted-foreground mb-1">
                            {mealTypeLabels[type] || type}
                          </p>
                          {meals.map((meal, i) => (
                            <div key={i} className="flex items-center justify-between px-2 py-0.5 hover:bg-secondary/20 rounded-lg transition-colors group">
                              <div className="flex-1 min-w-0 mr-2">
                                <div className="flex justify-between items-baseline">
                                  <span className="text-xs text-foreground truncate">{meal.foodName}</span>
                                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                    {meal.grams}g · {Math.round(meal.calories)} kcal
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditingMeal({ meal, date })}
                                  className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => setDeletingMealId(meal.id)}
                                  className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {editingWorkout && (
        <EditWorkoutDialog
          open={!!editingWorkout}
          onOpenChange={(open) => !open && setEditingWorkout(null)}
          workout={editingWorkout.workout}
          date={editingWorkout.date}
          onSaved={() => {
            loadWorkout(editingWorkout.date);
            fetchHistory(); // Refresh history list
          }}
        />
      )}

      {editingMeal && (
        <EditMealDialog
          open={!!editingMeal}
          onOpenChange={(open) => !open && setEditingMeal(null)}
          meal={editingMeal.meal}
          onSaved={handleUpdateMeal}
        />
      )}

      <AlertDialog open={!!deletingWorkoutId} onOpenChange={(open) => !open && setDeletingWorkoutId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el entrenamiento y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingWorkoutId && handleDeleteWorkout(deletingWorkoutId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingMealId} onOpenChange={(open) => !open && setDeletingMealId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comida?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente este registro de comida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingMealId && handleDeleteMeal(deletingMealId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HistoryPage;
