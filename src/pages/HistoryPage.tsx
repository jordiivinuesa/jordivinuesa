import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useDbSync } from "@/hooks/useDbSync";
import { Calendar, Dumbbell, Flame, TrendingUp, Pencil } from "lucide-react";
import EditWorkoutDialog from "@/components/workout/EditWorkoutDialog";
import type { Workout } from "@/store/useAppStore";

const HistoryPage = () => {
  const { dayLogs } = useAppStore();
  const { loadWorkout } = useDbSync();
  const [editingWorkout, setEditingWorkout] = useState<{ workout: Workout; date: string } | null>(null);

  const sortedDays = Object.keys(dayLogs)
    .sort((a, b) => b.localeCompare(a))
    .map((date) => ({ date, log: dayLogs[date] }));

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-2 text-2xl font-bold font-display animate-fade-in">Historial</h1>
      <p className="mb-6 text-sm text-muted-foreground animate-fade-in">Tu progreso día a día</p>

      {sortedDays.length === 0 ? (
        <div className="flex flex-col items-center py-20 animate-slide-up">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-1 text-base font-semibold font-display">Sin registros</h2>
          <p className="text-sm text-muted-foreground text-center max-w-[200px]">
            Empieza a registrar entrenamientos y comidas para ver tu historial
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDays.map(({ date, log }, idx) => {
            const dateObj = new Date(date + "T12:00:00");
            const dayStr = dateObj.toLocaleDateString("es-ES", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });

            const mealTotals = log.meals.reduce(
              (acc, m) => ({
                calories: acc.calories + m.calories,
                protein: acc.protein + m.protein,
              }),
              { calories: 0, protein: 0 }
            );

            const workout = log.workout;
            const totalSets = workout?.exercises.reduce(
              (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
              0
            ) || 0;

            return (
              <div
                key={date}
                className="rounded-2xl bg-card p-4 glow-border animate-fade-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold font-display capitalize">{dayStr}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Nutrition summary */}
                  {log.meals.length > 0 && (
                    <div className="rounded-xl bg-secondary/50 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Flame className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[11px] text-muted-foreground">Nutrición</span>
                      </div>
                      <p className="text-sm font-bold">{Math.round(mealTotals.calories)} kcal</p>
                      <p className="text-[11px] text-muted-foreground">
                        {Math.round(mealTotals.protein)}g proteína · {log.meals.length} alimentos
                      </p>
                    </div>
                  )}

                  {/* Workout summary */}
                  {workout && (
                    <div className="rounded-xl bg-secondary/50 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Dumbbell className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[11px] text-muted-foreground">Entreno</span>
                        </div>
                        <button
                          onClick={() => setEditingWorkout({ workout, date })}
                          className="rounded-md p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Editar entrenamiento"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-bold">{workout.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {workout.exercises.length} ejercicios · {totalSets} series
                      </p>
                    </div>
                  )}

                  {!workout && log.meals.length === 0 && (
                    <p className="col-span-2 text-sm text-muted-foreground text-center py-2">Sin registros</p>
                  )}
                </div>

                {/* Workout details */}
                {workout && workout.exercises.length > 0 && (
                  <div className="mt-3 space-y-1">
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

      {/* Edit workout dialog */}
      {editingWorkout && (
        <EditWorkoutDialog
          open={!!editingWorkout}
          onOpenChange={(open) => !open && setEditingWorkout(null)}
          workout={editingWorkout.workout}
          date={editingWorkout.date}
          onSaved={() => loadWorkout(editingWorkout.date)}
        />
      )}
    </div>
  );
};

export default HistoryPage;
