import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FoodItem } from '@/data/foods';

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
}

export interface ActivitySession {
  id: string;
  activityId: string;
  activityName: string;
  duration: number; // minutes
  intensity?: 'baja' | 'media' | 'alta';
  notes?: string;
}

export interface Workout {
  id: string;
  date: string;
  name: string;
  type: 'ejercicios' | 'actividad'; // Type of workout
  exercises?: WorkoutExercise[]; // For traditional gym workouts
  activity?: ActivitySession; // For sports and group classes
  duration?: number; // minutes
}

export interface MealEntry {
  id: string;
  foodId: string;
  foodName: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'desayuno' | 'almuerzo' | 'comida' | 'merienda' | 'cena' | 'snack';
}

export interface DayLog {
  date: string;
  meals: MealEntry[];
  workouts: Workout[]; // Changed from workout?: Workout to support multiple workouts per day
}

export interface TemplateSet {
  id: string;
  reps: number;
  weight: number;
}

export interface TemplateExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: TemplateSet[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: TemplateExercise[];
}

export interface RestTimer {
  isActive: boolean;
  remainingSeconds: number;
  targetSeconds: number;
  exerciseId: string | null;
}

export interface AppState {
  currentDate: string;
  dayLogs: Record<string, DayLog>; // key is YYYY-MM-DD
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  onboardingCompleted: boolean | null;

  // Custom Foods
  customFoods: FoodItem[];
  addCustomFood: (food: FoodItem) => void;
  removeCustomFood: (foodId: string) => void;

  // Active Workout State
  activeWorkout: Workout | null;
  activeTemplateId: string | null;
  activeWorkoutType: 'workout' | 'template' | null;
  templates: WorkoutTemplate[];

  // Rest Timer
  restTimer: RestTimer | null;
  restTimerDuration: number; // Default duration in seconds
  restTimerSound: boolean;
  restTimerAutoStart: boolean;

  // Actions
  setCurrentDate: (date: string) => void;
  setGoals: (goals: { calorieGoal?: number; proteinGoal?: number; carbsGoal?: number; fatGoal?: number }) => void;
  setOnboardingCompleted: (completed: boolean) => void;

  // Workout actions
  addMealEntry: (entry: MealEntry) => void;
  removeMealEntry: (date: string, entryId: string) => void;
  startWorkout: (name: string, type?: 'workout' | 'template') => void;
  addExerciseToWorkout: (exerciseId: string, exerciseName: string) => void;
  addSetToExercise: (exerciseIndex: number) => void;
  updateSet: (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => void;
  removeExerciseFromWorkout: (exerciseIndex: number) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
  toggleSetCompleted: (exerciseId: string, setIndex: number) => void; // Added missing action definition

  // Activity actions
  startActivity: (activityId: string, activityName: string) => void;
  updateActivity: (updates: Partial<ActivitySession>) => void;

  // Template actions
  addTemplate: (template: WorkoutTemplate) => void;
  updateTemplate: (template: WorkoutTemplate) => void;
  deleteTemplate: (id: string) => void;
  startWorkoutFromTemplate: (template: WorkoutTemplate) => void;

  // Rest Timer actions
  startRestTimer: (exerciseId: string) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;
  skipRestTimer: () => void;
  addRestTime: (seconds: number) => void;
  setRestTimerDuration: (seconds: number) => void;
  setRestTimerSound: (enabled: boolean) => void;
  setRestTimerAutoStart: (enabled: boolean) => void;
}

const generateId = () => crypto.randomUUID();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentDate: new Date().toLocaleDateString('en-CA'), // Formato YYYY-MM-DD local
      dayLogs: {},
      activeWorkout: null,
      activeTemplateId: null,
      activeWorkoutType: null,
      templates: [],
      customFoods: [],
      calorieGoal: 2000,
      proteinGoal: 150,
      carbsGoal: 200,
      fatGoal: 65,
      onboardingCompleted: null,

      // Rest Timer initial state
      restTimer: null,
      restTimerDuration: 90, // 90 seconds default
      restTimerSound: true,
      restTimerAutoStart: true,

      addCustomFood: (food) => set((state) => ({ customFoods: [...state.customFoods, food] })),
      removeCustomFood: (foodId) => set((state) => ({ customFoods: state.customFoods.filter(f => f.id !== foodId) })),

      setCurrentDate: (date) => set({ currentDate: date }),
      setGoals: (goals) => set((state) => ({ ...state, ...goals })),
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),

      addMealEntry: (entry) => {
        const { currentDate, dayLogs } = get();
        const dayLog = dayLogs[currentDate] || { date: currentDate, meals: [], workouts: [] };
        set({
          dayLogs: {
            ...dayLogs,
            [currentDate]: {
              ...dayLog,
              meals: [...dayLog.meals, entry],
            },
          },
        });
      },

      removeMealEntry: (date, entryId) => {
        const { dayLogs } = get();
        const dayLog = dayLogs[date];
        if (!dayLog) return;
        set({
          dayLogs: {
            ...dayLogs,
            [date]: {
              ...dayLog,
              meals: dayLog.meals.filter((m) => m.id !== entryId),
            },
          },
        });
      },

      startWorkout: (name, type = 'workout') => set({
        activeWorkout: {
          id: generateId(),
          date: get().currentDate,
          name,
          type: 'ejercicios', // Default to exercise-based workout
          exercises: []
        },
        activeTemplateId: null,
        activeWorkoutType: type
      }),

      addExerciseToWorkout: (exerciseId, exerciseName) => set((state) => {
        if (!state.activeWorkout) return state;
        return {
          activeWorkout: {
            ...state.activeWorkout,
            exercises: [
              ...state.activeWorkout.exercises,
              {
                id: generateId(),
                exerciseId,
                exerciseName,
                sets: []
              }
            ]
          }
        };
      }),

      addSetToExercise: (exerciseIndex) => set((state) => {
        if (!state.activeWorkout) return state;
        const exercises = [...state.activeWorkout.exercises];
        const lastSet = exercises[exerciseIndex].sets[exercises[exerciseIndex].sets.length - 1];
        exercises[exerciseIndex] = {
          ...exercises[exerciseIndex],
          sets: [
            ...exercises[exerciseIndex].sets,
            { id: generateId(), reps: lastSet?.reps || 0, weight: lastSet?.weight || 0, completed: false }
          ]
        };
        return {
          activeWorkout: { ...state.activeWorkout, exercises }
        };
      }),

      updateSet: (exerciseIndex, setIndex, updates) => set((state) => {
        if (!state.activeWorkout) return state;
        const exercises = [...state.activeWorkout.exercises];
        const sets = [...exercises[exerciseIndex].sets];
        sets[setIndex] = { ...sets[setIndex], ...updates };
        exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
        return {
          activeWorkout: { ...state.activeWorkout, exercises }
        };
      }),

      removeExerciseFromWorkout: (exerciseIndex) => set((state) => {
        if (!state.activeWorkout) return state;
        const exercises = state.activeWorkout.exercises.filter((_, i) => i !== exerciseIndex);
        return {
          activeWorkout: { ...state.activeWorkout, exercises }
        };
      }),

      finishWorkout: () => set((state) => {
        if (!state.activeWorkout) return state;

        if (state.activeWorkoutType === 'workout') {
          const date = state.activeWorkout.date;
          const dayLog = state.dayLogs[date] || { date, meals: [], workouts: [] };
          return {
            dayLogs: {
              ...state.dayLogs,
              [date]: {
                ...dayLog,
                workouts: [...dayLog.workouts, state.activeWorkout]
              }
            },
            activeWorkout: null,
            activeTemplateId: null,
            activeWorkoutType: null
          };
        }

        return {
          activeWorkout: null,
          activeTemplateId: null,
          activeWorkoutType: null
        };
      }),

      cancelWorkout: () => set({ activeWorkout: null, activeTemplateId: null, activeWorkoutType: null }),

      startActivity: (activityId, activityName) => set({
        activeWorkout: {
          id: generateId(),
          date: get().currentDate,
          name: activityName,
          type: 'actividad',
          activity: {
            id: generateId(),
            activityId,
            activityName,
            duration: 0,
          }
        },
        activeTemplateId: null,
        activeWorkoutType: 'workout'
      }),

      updateActivity: (updates) => set((state) => {
        if (!state.activeWorkout || state.activeWorkout.type !== 'actividad' || !state.activeWorkout.activity) {
          return state;
        }
        return {
          activeWorkout: {
            ...state.activeWorkout,
            activity: {
              ...state.activeWorkout.activity,
              ...updates
            }
          }
        };
      }),

      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, template]
      })),

      updateTemplate: (template) => set((state) => ({
        templates: state.templates.map(t => t.id === template.id ? template : t)
      })),

      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter(t => t.id !== id)
      })),

      startWorkoutFromTemplate: (template) => {
        set({
          activeWorkout: {
            id: generateId(),
            date: get().currentDate,
            name: template.name,
            type: 'ejercicios', // Templates are exercise-based
            exercises: template.exercises.map(te => ({
              id: generateId(),
              exerciseId: te.exerciseId,
              exerciseName: te.exerciseName,
              sets: te.sets.map((ts) => ({
                id: generateId(),
                reps: ts.reps,
                weight: ts.weight,
                completed: false
              }))
            }))
          },
          activeTemplateId: template.id,
          activeWorkoutType: 'workout'
        });
      },

      toggleSetCompleted: (exerciseId, setIndex) => set((state) => {
        if (!state.activeWorkout || !state.activeWorkout.exercises) return state;

        // Find the exercise index
        const exerciseIndex = state.activeWorkout.exercises.findIndex(e => e.id === exerciseId);
        if (exerciseIndex === -1) return state;

        const exercises = [...state.activeWorkout.exercises];
        const sets = [...exercises[exerciseIndex].sets];

        if (!sets[setIndex]) return state;

        sets[setIndex] = { ...sets[setIndex], completed: !sets[setIndex].completed };
        exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };

        return {
          activeWorkout: { ...state.activeWorkout, exercises }
        };
      }),

      // Rest Timer actions
      startRestTimer: (exerciseId) => set((state) => ({
        restTimer: {
          isActive: true,
          remainingSeconds: state.restTimerDuration,
          targetSeconds: state.restTimerDuration,
          exerciseId
        }
      })),

      stopRestTimer: () => set({ restTimer: null }),

      tickRestTimer: () => set((state) => {
        if (!state.restTimer || !state.restTimer.isActive) return state;

        const newRemaining = Math.max(0, state.restTimer.remainingSeconds - 1);

        return {
          restTimer: {
            ...state.restTimer,
            remainingSeconds: newRemaining,
            isActive: newRemaining > 0
          }
        };
      }),

      skipRestTimer: () => set({ restTimer: null }),

      addRestTime: (seconds) => set((state) => {
        if (!state.restTimer) return state;

        return {
          restTimer: {
            ...state.restTimer,
            remainingSeconds: state.restTimer.remainingSeconds + seconds,
            targetSeconds: state.restTimer.targetSeconds + seconds
          }
        };
      }),

      setRestTimerDuration: (seconds) => set({ restTimerDuration: seconds }),
      setRestTimerSound: (enabled) => set({ restTimerSound: enabled }),
      setRestTimerAutoStart: (enabled) => set({ restTimerAutoStart: enabled }),
    }),
    {
      name: 'peak-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { currentDate, ...rest } = state;
        return rest;
      },
    }
  )
);
