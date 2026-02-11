import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAppStore, type MealEntry, type Workout, type WorkoutExercise, type WorkoutSet } from "@/store/useAppStore";

export function useDbSync() {
  const { user } = useAuth();
  const { currentDate } = useAppStore();

  // Load profile goals and onboarding status
  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("calorie_goal, protein_goal, carbs_goal, fat_goal, onboarding_completed")
      .eq("user_id", user.id)
      .maybeSingle() as { data: { calorie_goal: number; protein_goal: number; carbs_goal: number; fat_goal: number; onboarding_completed: boolean } | null };

    if (data) {
      useAppStore.setState({
        calorieGoal: data.calorie_goal,
        proteinGoal: data.protein_goal,
        carbsGoal: data.carbs_goal,
        fatGoal: data.fat_goal,
        onboardingCompleted: data.onboarding_completed ?? false,
      });
    } else {
      // Profile not yet created (trigger may not have fired yet)
      useAppStore.setState({ onboardingCompleted: false });
    }
  }, [user]);

  // Load meals for a date
  const loadMeals = useCallback(async (date: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("meal_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date);

    if (data) {
      const meals: MealEntry[] = data.map((m) => ({
        id: m.id,
        foodId: m.food_id,
        foodName: m.food_name,
        grams: Number(m.grams),
        calories: Number(m.calories),
        protein: Number(m.protein),
        carbs: Number(m.carbs),
        fat: Number(m.fat),
        mealType: m.meal_type as MealEntry["mealType"],
      }));

      useAppStore.setState((state) => ({
        dayLogs: {
          ...state.dayLogs,
          [date]: {
            ...state.dayLogs[date],
            date,
            meals,
          },
        },
      }));
    }
  }, [user]);

  // Load workout for a date
  const loadWorkout = useCallback(async (date: string) => {
    if (!user) return;
    const { data: workouts } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date);

    if (!workouts || workouts.length === 0) {
      useAppStore.setState((state) => ({
        dayLogs: {
          ...state.dayLogs,
          [date]: {
            ...state.dayLogs[date],
            date,
            meals: state.dayLogs[date]?.meals || [],
            workout: undefined,
          },
        },
      }));
      return;
    }

    const workout = workouts[0];
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

    const fullWorkout: Workout = {
      id: workout.id,
      date: workout.date,
      name: workout.name,
      exercises: workoutExercises,
      duration: workout.duration ?? undefined,
    };

    useAppStore.setState((state) => ({
      dayLogs: {
        ...state.dayLogs,
        [date]: {
          ...state.dayLogs[date],
          date,
          meals: state.dayLogs[date]?.meals || [],
          workout: fullWorkout,
        },
      },
    }));
  }, [user]);

  // Save meal to DB
  const saveMealToDb = useCallback(async (entry: MealEntry) => {
    if (!user) return;
    await supabase.from("meal_entries").insert({
      id: entry.id,
      user_id: user.id,
      date: useAppStore.getState().currentDate,
      food_id: entry.foodId,
      food_name: entry.foodName,
      grams: entry.grams,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      meal_type: entry.mealType,
    });
  }, [user]);

  // Delete meal from DB
  const deleteMealFromDb = useCallback(async (entryId: string) => {
    if (!user) return;
    await supabase.from("meal_entries").delete().eq("id", entryId);
  }, [user]);

  // Save finished workout to DB
  const saveWorkoutToDb = useCallback(async (workout: Workout) => {
    if (!user) return;

    // Insert workout
    await supabase.from("workouts").insert({
      id: workout.id,
      user_id: user.id,
      date: workout.date,
      name: workout.name,
      duration: workout.duration ?? null,
    });

    // Insert exercises and sets
    for (let i = 0; i < workout.exercises.length; i++) {
      const ex = workout.exercises[i];
      await supabase.from("workout_exercises").insert({
        id: ex.id,
        workout_id: workout.id,
        exercise_id: ex.exerciseId,
        exercise_name: ex.exerciseName,
        order_index: i,
      });

      if (ex.sets.length > 0) {
        await supabase.from("workout_sets").insert(
          ex.sets.map((s, si) => ({
            id: s.id,
            workout_exercise_id: ex.id,
            set_index: si,
            reps: s.reps,
            weight: s.weight,
            completed: s.completed,
          }))
        );
      }
    }
  }, [user]);

  // Load templates
  const loadTemplates = useCallback(async () => {
    if (!user) return;
    const { data: templatesData } = await (supabase as any)
      .from("workout_templates")
      .select("*")
      .eq("user_id", user.id);

    if (templatesData) {
      const fullTemplates = [];
      for (const t of templatesData) {
        const { data: exercisesData } = await (supabase as any)
          .from("template_exercises")
          .select("*")
          .eq("template_id", t.id)
          .order("order_index");

        const exercises = [];
        if (exercisesData) {
          for (const ex of exercisesData) {
            const { data: setsData } = await (supabase as any)
              .from("template_sets")
              .select("*")
              .eq("template_exercise_id", ex.id)
              .order("set_index");

            exercises.push({
              id: ex.id,
              exerciseId: ex.exercise_id,
              exerciseName: ex.exercise_name,
              sets: (setsData || []).map((s: any) => ({
                id: s.id,
                reps: s.reps,
                weight: Number(s.weight),
              })),
            });
          }
        }

        fullTemplates.push({
          id: t.id,
          name: t.name,
          description: t.description,
          exercises,
        });
      }
      useAppStore.setState({ templates: fullTemplates });
    }
  }, [user]);

  // Load data when user or date changes
  useEffect(() => {
    if (user && currentDate) {
      loadProfile();
      loadMeals(currentDate);
      loadWorkout(currentDate);
      loadTemplates();
    }
  }, [user, currentDate, loadProfile, loadMeals, loadWorkout, loadTemplates]);

  // Save or Update template in DB
  const saveTemplateToDb = useCallback(async (template: any) => {
    if (!user) return;

    // Upsert template
    const { error: tError } = await (supabase as any).from("workout_templates").upsert({
      id: template.id,
      user_id: user.id,
      name: template.name,
      description: template.description || null,
      updated_at: new Date().toISOString()
    });

    if (tError) return;

    // To keep it simple, delete old exercises and re-insert (cascades to sets)
    await (supabase as any).from("template_exercises").delete().eq("template_id", template.id);

    // Insert exercises and sets
    for (let i = 0; i < template.exercises.length; i++) {
      const ex = template.exercises[i];
      await (supabase as any).from("template_exercises").insert({
        id: ex.id,
        template_id: template.id,
        exercise_id: ex.exerciseId,
        exercise_name: ex.exerciseName,
        order_index: i,
      });

      if (ex.sets.length > 0) {
        await (supabase as any).from("template_sets").insert(
          ex.sets.map((s: any, si: number) => ({
            id: s.id,
            template_exercise_id: ex.id,
            set_index: si,
            reps: s.reps,
            weight: s.weight,
          }))
        );
      }
    }
  }, [user]);

  const updateTemplateInDb = saveTemplateToDb;

  // Delete template from DB
  const deleteTemplateFromDb = useCallback(async (templateId: string) => {
    if (!user) return;
    await (supabase as any).from("workout_templates").delete().eq("id", templateId);
  }, [user]);

  return {
    saveMealToDb,
    deleteMealFromDb,
    saveWorkoutToDb,
    saveTemplateToDb,
    updateTemplateInDb,
    deleteTemplateFromDb,
    loadMeals,
    loadWorkout,
    loadTemplates
  };
}
