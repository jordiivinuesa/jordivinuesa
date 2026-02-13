
import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Workout, WorkoutExercise } from "@/store/useAppStore";

export const useWorkoutHistory = () => {
    const { user } = useAuth();

    const fetchHistory = useCallback(async () => {
        if (!user) return [];

        const { data: workouts, error } = await supabase
            .from("workouts")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false });

        if (error) {
            console.error("Error fetching history:", error);
            return [];
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
                type: (workout.type as Workout['type']) || 'ejercicios',
                exercises: workoutExercises,
                duration: workout.duration ?? undefined,
            });
        }
        return formattedWorkouts;
    }, [user]);

    return useQuery({
        queryKey: ['workout-history', user?.id],
        queryFn: fetchHistory,
        enabled: !!user,
        staleTime: 300000, // 5 minutes
    });
};
