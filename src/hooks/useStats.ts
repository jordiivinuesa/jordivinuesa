
import { useMemo } from 'react';
import { Workout } from '@/store/useAppStore';
import { startOfWeek, format, parseISO, subWeeks, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { exercises } from '@/data/exercises';

export interface VolumeData {
    date: string;
    volume: number;
    timestamp?: number;
}

export interface MuscleData {
    name: string;
    value: number;
    fill: string;
}

export interface PRData {
    exerciseName: string;
    weight: number;
    reps: number;
    date: string;
    estimated1RM: number;
}

const MUSCLE_COLORS: Record<string, string> = {
    'Pecho': '#3b82f6', // blue-500
    'Espalda': '#8b5cf6', // violet-500
    'Piernas': '#10b981', // emerald-500
    'Hombros': '#f59e0b', // amber-500
    'Bíceps': '#ef4444', // red-500
    'Tríceps': '#ec4899', // pink-500
    'Abdominales': '#6366f1', // indigo-500
    'Glúteos': '#db2777', // pink-600
    'Antebrazos': '#64748b', // slate-500
    'Trapecio': '#a855f7', // purple-500
    'Otros': '#94a3b8', // slate-400
};

// Create a lookup map for exercise ID -> Muscle Group
const exerciseMap = new Map<string, string>();
exercises.forEach(ex => {
    // Normalize keys to handle potential inconsistencies
    exerciseMap.set(ex.id, ex.muscleGroup);
    exerciseMap.set(ex.name, ex.muscleGroup); // Fallback by name
});

const getMuscleName = (key: string): string => {
    const muscleGroups: Record<string, string> = {
        pecho: "Pecho",
        espalda: "Espalda",
        hombros: "Hombros",
        bíceps: "Bíceps",
        tríceps: "Tríceps",
        piernas: "Piernas",
        glúteos: "Glúteos",
        abdominales: "Abdominales",
        antebrazos: "Antebrazos",
        trapecio: "Trapecio",
    };
    return muscleGroups[key.toLowerCase()] || "Otros";
};

export const useStats = (workouts: Workout[]) => {
    const stats = useMemo(() => {
        // 1. Weekly Volume - Last 8 weeks
        const volumeMap = new Map<string, number>();
        const today = new Date();
        const eightWeeksAgo = subWeeks(today, 8);

        // Filter workouts to last 8 weeks for the chart
        const recentWorkouts = workouts.filter(w => isAfter(parseISO(w.date), eightWeeksAgo));

        recentWorkouts.forEach(workout => {
            if (workout.exercises) {
                const workoutVolume = workout.exercises.reduce((acc, ex) => {
                    return acc + ex.sets.reduce((sAcc, set) => {
                        if (set.completed && set.weight > 0 && set.reps > 0) {
                            return sAcc + (set.weight * set.reps);
                        }
                        return sAcc;
                    }, 0);
                }, 0);

                // Group by week start date for sorting
                const weekStart = startOfWeek(parseISO(workout.date), { weekStartsOn: 1 });
                const weekKey = weekStart.toISOString();

                volumeMap.set(weekKey, (volumeMap.get(weekKey) || 0) + workoutVolume);
            }
        });

        const volumeData: VolumeData[] = Array.from(volumeMap.entries())
            .map(([dateIso, volume]) => ({
                date: format(parseISO(dateIso), 'd MMM', { locale: es }),
                volume,
                timestamp: new Date(dateIso).getTime()
            }))
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(({ date, volume }) => ({ date, volume }));


        // 2. Muscle Distribution - All time (or maybe last 3 months?)
        // Let's keep it all time for now to see more data
        const muscleCount = new Map<string, number>();

        // Check if we have workouts, if not return empty to avoid errors
        if (workouts.length > 0) {
            workouts.forEach(workout => {
                workout.exercises?.forEach(ex => {
                    // Try to find muscle by ID first, then Name
                    let muscleKey = exerciseMap.get(ex.exerciseId) || exerciseMap.get(ex.exerciseName);

                    // Fallback heuristic if not found in DB
                    if (!muscleKey) {
                        const lowerName = ex.exerciseName.toLowerCase();
                        if (lowerName.includes('press')) muscleKey = 'pecho';
                        else if (lowerName.includes('remo') || lowerName.includes('jalón')) muscleKey = 'espalda';
                        else if (lowerName.includes('sentadilla') || lowerName.includes('prensa')) muscleKey = 'piernas';
                        else muscleKey = 'otros';
                    }

                    const muscleName = getMuscleName(muscleKey || 'otros');
                    const validSets = ex.sets.filter(s => s.completed).length;

                    if (validSets > 0) {
                        muscleCount.set(muscleName, (muscleCount.get(muscleName) || 0) + validSets);
                    }
                });
            });
        }

        const muscleData: MuscleData[] = Array.from(muscleCount.entries())
            .map(([name, value]) => ({
                name,
                value,
                fill: MUSCLE_COLORS[name] || MUSCLE_COLORS['Otros']
            }))
            .sort((a, b) => b.value - a.value);

        // 3. Personal Records
        const prMap = new Map<string, PRData>();

        workouts.forEach(workout => {
            workout.exercises?.forEach(ex => {
                ex.sets.forEach(set => {
                    if (set.completed && set.weight > 0 && set.reps > 0) {
                        const est1RM = set.weight * (1 + set.reps / 30);
                        const currentBest = prMap.get(ex.exerciseName);

                        if (!currentBest || est1RM > currentBest.estimated1RM) {
                            prMap.set(ex.exerciseName, {
                                exerciseName: ex.exerciseName,
                                weight: set.weight,
                                reps: set.reps,
                                date: workout.date,
                                estimated1RM: est1RM
                            });
                        }
                    }
                });
            });
        });

        const prData = Array.from(prMap.values())
            .sort((a, b) => b.estimated1RM - a.estimated1RM)
            .slice(0, 5);

        return {
            volumeData,
            muscleData,
            prData
        };
    }, [workouts]);

    return stats;
};
