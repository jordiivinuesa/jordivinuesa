import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  workout?: Workout;
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

export interface AppState {
  currentDate: string;
  dayLogs: Record<string, DayLog>;
  activeWorkout: Workout | null;
  activeTemplateId: string | null; // Track if current workout is linked to a template
  activeWorkoutType: 'workout' | 'template' | null; // Track if this is a real workout or just template building
  templates: WorkoutTemplate[];
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  onboardingCompleted: boolean | null; // null = not loaded yet

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

  // Activity actions
  startActivity: (activityId: string, activityName: string) => void;
  updateActivity: (updates: Partial<ActivitySession>) => void;

  // Template actions
  addTemplate: (template: WorkoutTemplate) => void;
  updateTemplate: (template: WorkoutTemplate) => void;
  deleteTemplate: (id: string) => void;
  startWorkoutFromTemplate: (template: WorkoutTemplate) => void;
}

const generateId = () => crypto.randomUUID();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentDate: new Date().toISOString().split('T')[0],
      dayLogs: {},
      activeWorkout: null,
      activeTemplateId: null,
      activeWorkoutType: null,
      templates: [],
      calorieGoal: 2000,
      proteinGoal: 150,
      carbsGoal: 200,
      fatGoal: 65,
      onboardingCompleted: null,

      setCurrentDate: (date) => set({ currentDate: date }),
      setGoals: (goals) => set((state) => ({ ...state, ...goals })),
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),

      addMealEntry: (entry) => {
        const { currentDate, dayLogs } = get();
        const dayLog = dayLogs[currentDate] || { date: currentDate, meals: [] };
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
          const dayLog = state.dayLogs[date] || { date, meals: [] };
          return {
            dayLogs: {
              ...state.dayLogs,
              [date]: { ...dayLog, workout: state.activeWorkout }
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
    }),
    {
      name: 'peak-app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
