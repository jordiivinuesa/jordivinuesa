import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAppStore, type MealEntry, type Workout, type WorkoutExercise, type WorkoutSet } from "@/store/useAppStore";
import type { FoodItem, FoodCategory } from "@/data/foods";
import { toast } from "@/hooks/use-toast";

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
            workouts: [],
          },
        },
      }));
      return;
    }

    // Load all workouts for this date
    const fullWorkouts: Workout[] = [];

    for (const workout of workouts) {
      const workoutType = (workout.type as Workout['type']) || 'ejercicios';

      // Handle activity-based workouts
      if (workoutType === 'actividad') {
        const { data: activityData } = await supabase
          .from("workout_activities")
          .select("*")
          .eq("workout_id", workout.id)
          .maybeSingle();

        fullWorkouts.push({
          id: workout.id,
          date: workout.date,
          name: workout.name,
          type: 'actividad',
          activity: activityData ? {
            id: activityData.id,
            activityId: activityData.activity_id,
            activityName: activityData.activity_name,
            duration: activityData.duration,
            intensity: activityData.intensity as 'baja' | 'media' | 'alta' | undefined,
            notes: activityData.notes,
          } : undefined,
          duration: workout.duration ?? undefined,
        });
      } else {
        // Handle exercise-based workouts
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

        fullWorkouts.push({
          id: workout.id,
          date: workout.date,
          name: workout.name,
          type: workoutType,
          exercises: workoutExercises,
          duration: workout.duration ?? undefined,
        });
      }
    }

    useAppStore.setState((state) => ({
      dayLogs: {
        ...state.dayLogs,
        [date]: {
          ...state.dayLogs[date],
          date,
          meals: state.dayLogs[date]?.meals || [],
          workouts: fullWorkouts,
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

    // Insert workout with type
    await supabase.from("workouts").insert({
      id: workout.id,
      user_id: user.id,
      date: workout.date,
      name: workout.name,
      type: workout.type || 'ejercicios',
      duration: workout.duration ?? null,
    });

    // Handle activity-based workouts
    if (workout.type === 'actividad' && workout.activity) {
      await supabase.from("workout_activities").insert({
        workout_id: workout.id,
        activity_id: workout.activity.activityId,
        activity_name: workout.activity.activityName,
        duration: workout.activity.duration,
        intensity: workout.activity.intensity ?? null,
        notes: workout.activity.notes ?? null,
      });
      return; // Don't process exercises for activity workouts
    }

    // Handle exercise-based workouts
    if (workout.exercises && workout.exercises.length > 0) {
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
    }
  }, [user]);

  // Load templates
  const loadTemplates = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Sync: Loading templates for user', user.id);
      const { data: templatesData, error: tError } = await (supabase as any)
        .from("workout_templates")
        .select("*")
        .eq("user_id", user.id);

      if (tError) throw tError;
      if (!templatesData) return;

      const fullTemplates = await Promise.all(templatesData.map(async (t) => {
        const { data: exercisesData, error: eError } = await (supabase as any)
          .from("template_exercises")
          .select("*")
          .eq("template_id", t.id)
          .order("order_index");

        if (eError) throw eError;

        const exercises = await Promise.all((exercisesData || []).map(async (ex) => {
          const { data: setsData, error: sError } = await (supabase as any)
            .from("template_sets")
            .select("*")
            .eq("template_exercise_id", ex.id)
            .order("set_index");

          if (sError) throw sError;

          return {
            id: ex.id,
            exerciseId: ex.exercise_id,
            exerciseName: ex.exercise_name,
            sets: (setsData || []).map((s) => ({
              id: s.id,
              reps: s.reps,
              weight: Number(s.weight),
            })),
          };
        }));

        return {
          id: t.id,
          name: t.name,
          description: t.description,
          exercises,
        };
      }));

      console.log(`Sync: Successfully loaded ${fullTemplates.length} templates`);

      const localTemplates = useAppStore.getState().templates;

      // If remote is empty but local has data, it's likely a first-time sync
      // We don't overwrite local data with empty remote to avoid data loss
      if (fullTemplates.length === 0 && localTemplates.length > 0) {
        console.log('Sync: Remote is empty but local has templates. Triggering automatic push to cloud...');
        // Automatically sync to cloud if remote is empty but local has data
        pushAllTemplatesToDb(true);
      } else {
        useAppStore.setState({ templates: fullTemplates });
      }
    } catch (error: any) {
      console.error('Sync: Error loading templates:', error);
      if (error?.code === 'PGRST116' || error?.message?.includes('not found') || error?.status === 404) {
        toast({
          title: "Error de Sincronización",
          description: "Las tablas de plantillas no existen. Por favor, asegúrate de aplicar las migraciones.",
          variant: "destructive",
        });
      }
    }
  }, [user]);

  // Push all local templates to DB (Migration utility)
  const pushAllTemplatesToDb = useCallback(async (isAuto = false) => {
    const localTemplates = useAppStore.getState().templates;
    if (localTemplates.length === 0) return;

    if (isAuto) {
      console.log('Sync: Starting automatic cloud migration...');
    } else {
      toast({
        title: "Sincronizando...",
        description: `Subiendo ${localTemplates.length} plantillas a la nube...`,
      });
    }

    // Use a regular loop to ensure they happen in order and we can handle errors
    for (const template of localTemplates) {
      await saveTemplateToDb(template);
    }

    if (isAuto) {
      toast({
        title: "Sincronización Automática",
        description: "Tus plantillas locales se han guardado en la nube.",
      });
    } else {
      toast({
        title: "Sincronización completada",
        description: "Todas tus plantillas locales están ahora en la nube.",
      });
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

    try {
      console.log('Sync: Saving template', template.id);
      const { error: tError } = await (supabase as any).from("workout_templates").upsert({
        id: template.id,
        user_id: user.id,
        name: template.name,
        description: template.description || null,
        updated_at: new Date().toISOString()
      });

      if (tError) throw tError;

      // To keep it simple, delete old exercises and re-insert (cascades to sets)
      const { error: dError } = await (supabase as any).from("template_exercises").delete().eq("template_id", template.id);
      if (dError) throw dError;

      // Insert exercises and sets
      for (let i = 0; i < template.exercises.length; i++) {
        const ex = template.exercises[i];
        const { error: eError } = await (supabase as any).from("template_exercises").insert({
          id: ex.id,
          template_id: template.id,
          exercise_id: ex.exerciseId,
          exercise_name: ex.exerciseName,
          order_index: i,
        });

        if (eError) throw eError;

        if (ex.sets.length > 0) {
          const { error: sError } = await (supabase as any).from("template_sets").insert(
            ex.sets.map((s: any, si: number) => ({
              id: s.id,
              template_exercise_id: ex.id,
              set_index: si,
              reps: s.reps,
              weight: s.weight,
            }))
          );
          if (sError) throw sError;
        }
      }
      console.log('Sync: Template saved successfully');
      toast({
        title: "Sincronizado",
        description: "Plantilla guardada en la nube.",
      });
    } catch (error: any) {
      console.error('Sync: Error saving template:', error);
      if (error?.code === '23505') {
        toast({
          title: "Error al guardar",
          description: "Ya existe una plantilla con este nombre.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error al guardar",
          description: "No se pudo sincronizar la plantilla con la nube.",
          variant: "destructive",
        });
      }
    }
  }, [user]);

  const updateTemplateInDb = saveTemplateToDb;

  // Delete template from DB
  const deleteTemplateFromDb = useCallback(async (templateId: string) => {
    if (!user) return;
    await (supabase as any).from("workout_templates").delete().eq("id", templateId);
  }, [user]);

  // Load custom foods
  const loadCustomFoods = useCallback(async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from("custom_foods")
      .select("*")
      .eq("user_id", user.id);

    if (data) {
      const foods: FoodItem[] = data.map((f: any) => ({
        id: f.id,
        name: f.name,
        category: "snacks", // Default category for custom foods if not stored
        calories: Number(f.calories),
        protein: Number(f.protein),
        carbs: Number(f.carbs),
        fat: Number(f.fat),
        fiber: 0, // Default if not stored
      }));
      useAppStore.setState({ customFoods: foods });
    }
  }, [user]);

  // Save custom food
  const saveCustomFoodToDb = useCallback(async (food: FoodItem) => {
    if (!user) return;

    await (supabase as any).from("custom_foods").insert({
      id: food.id,
      user_id: user.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      // Store brands/barcode if available in ID (e.g. from OpenFoodFacts)
      barcode: food.id.startsWith('off_') ? food.id.replace('off_', '') : null,
    });
  }, [user]);

  // Delete custom food
  const deleteCustomFoodFromDb = useCallback(async (foodId: string) => {
    if (!user) return;
    await (supabase as any).from("custom_foods").delete().eq("id", foodId);
  }, [user]);

  // Initialize data
  useEffect(() => {
    if (user) {
      loadProfile();
      loadCustomFoods();
    }
  }, [user, loadProfile, loadCustomFoods]);

  return {
    saveMealToDb,
    deleteMealFromDb,
    saveWorkoutToDb,
    saveTemplateToDb,
    updateTemplateInDb,
    deleteTemplateFromDb,
    pushAllTemplatesToDb,
    saveCustomFoodToDb,
    deleteCustomFoodFromDb,
    loadMeals,
    loadWorkout,
    loadTemplates,
    loadCustomFoods
  };
}
