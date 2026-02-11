import { useAppStore } from "@/store/useAppStore";
import CalorieRing from "@/components/CalorieRing";
import MacroBar from "@/components/MacroBar";
import { Dumbbell, Flame, Target, TrendingUp, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentDate, dayLogs, calorieGoal, proteinGoal, carbsGoal, fatGoal } = useAppStore();
  const dayLog = dayLogs[currentDate];
  const meals = dayLog?.meals || [];
  const workout = dayLog?.workout;

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const totalSets = workout?.exercises?.reduce((acc, ex) => acc + (ex.sets?.filter(s => s.completed)?.length ?? 0), 0) ?? 0;
  const totalExercises = workout?.exercises?.length ?? 0;

  const dateObj = new Date(currentDate + "T12:00:00");
  const dayName = dateObj.toLocaleDateString("es-ES", { weekday: "long" });
  const dayMonth = dateObj.toLocaleDateString("es-ES", { day: "numeric", month: "long" });

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="mb-6 animate-fade-in flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground capitalize">{dayName}</p>
          <h1 className="text-2xl font-bold font-display text-foreground capitalize">{dayMonth}</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/history")}
          className="rounded-xl h-9 w-9 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="Ver historial completo"
        >
          <History className="h-5 w-5" />
        </Button>
      </div>

      {/* Calorie Ring Card */}
      <div className="mb-4 rounded-2xl bg-card p-6 glow-border animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Flame className="h-4 w-4 text-primary" />
                <span>Consumidas</span>
              </div>
              <p className="text-2xl font-bold font-display">{Math.round(totals.calories)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Target className="h-4 w-4 text-primary" />
                <span>Objetivo</span>
              </div>
              <p className="text-2xl font-bold font-display">{calorieGoal}</p>
            </div>
          </div>
          <CalorieRing current={totals.calories} goal={calorieGoal} />
        </div>
      </div>

      {/* Macros */}
      <div className="mb-4 rounded-2xl bg-card p-5 glow-border animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <h3 className="mb-3 text-sm font-semibold text-foreground font-display">Macronutrientes</h3>
        <div className="flex gap-4">
          <MacroBar label="Proteína" current={totals.protein} goal={proteinGoal} color="hsl(199, 89%, 48%)" />
          <MacroBar label="Carbos" current={totals.carbs} goal={carbsGoal} color="hsl(82, 85%, 50%)" />
          <MacroBar label="Grasas" current={totals.fat} goal={fatGoal} color="hsl(38, 92%, 50%)" />
        </div>
      </div>

      {/* Workout Summary */}
      <div className="rounded-2xl bg-card p-5 glow-border animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <h3 className="mb-3 text-sm font-semibold text-foreground font-display flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" />
          Entrenamiento de hoy
        </h3>
        {workout ? (
          <div className="space-y-2">
            <p className="text-lg font-semibold font-display">{workout.name}</p>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {totalExercises} ejercicios · {totalSets} series
                </span>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {workout.exercises.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                  <span className="text-sm text-foreground">{ex.exerciseName}</span>
                  <span className="text-xs text-muted-foreground">
                    {ex.sets.filter(s => s.completed).length}/{ex.sets.length} series
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
              <Dumbbell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No has entrenado hoy</p>
            <p className="text-xs text-muted-foreground/60">Ve a la pestaña Entreno para empezar</p>
          </div>
        )}
      </div>

      {/* Today's meals summary */}
      {meals.length > 0 && (
        <div className="mt-4 rounded-2xl bg-card p-5 glow-border animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <h3 className="mb-3 text-sm font-semibold text-foreground font-display flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            Comidas de hoy ({meals.length})
          </h3>
          <div className="space-y-1">
            {meals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                <div>
                  <span className="text-sm text-foreground">{meal.foodName}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{meal.grams}g</span>
                </div>
                <span className="text-xs font-medium text-primary">{Math.round(meal.calories)} kcal</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
