import { create } from 'zustand';

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

export interface Workout {
  id: string;
  date: string;
  name: string;
  exercises: WorkoutExercise[];
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

interface AppState {
  currentDate: string;
  dayLogs: Record<string, DayLog>;
  activeWorkout: Workout | null;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  onboardingCompleted: boolean | null; // null = not loaded yet

  setCurrentDate: (date: string) => void;
  addMealEntry: (entry: MealEntry) => void;
  removeMealEntry: (date: string, entryId: string) => void;
  startWorkout: (name: string) => void;
  addExerciseToWorkout: (exerciseId: string, exerciseName: string) => void;
  addSetToExercise: (exerciseIndex: number) => void;
  updateSet: (exerciseIndex: number, setIndex: number, data: Partial<WorkoutSet>) => void;
  removeExerciseFromWorkout: (exerciseIndex: number) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
}

const today = new Date().toISOString().split('T')[0];

const generateId = () => crypto.randomUUID();

export const useAppStore = create<AppState>((set, get) => ({
  currentDate: today,
  dayLogs: {},
  activeWorkout: null,
  calorieGoal: 2500,
  proteinGoal: 180,
  carbsGoal: 280,
  fatGoal: 80,
  onboardingCompleted: null,

  setCurrentDate: (date) => set({ currentDate: date }),

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

  startWorkout: (name) => {
    set({
      activeWorkout: {
        id: generateId(),
        date: get().currentDate,
        name,
        exercises: [],
      },
    });
  },

  addExerciseToWorkout: (exerciseId, exerciseName) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: [
          ...activeWorkout.exercises,
          {
            id: generateId(),
            exerciseId,
            exerciseName,
            sets: [{ id: generateId(), reps: 0, weight: 0, completed: false }],
          },
        ],
      },
    });
  },

  addSetToExercise: (exerciseIndex) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    const exercises = [...activeWorkout.exercises];
    const lastSet = exercises[exerciseIndex].sets[exercises[exerciseIndex].sets.length - 1];
    exercises[exerciseIndex] = {
      ...exercises[exerciseIndex],
      sets: [
        ...exercises[exerciseIndex].sets,
        { id: generateId(), reps: lastSet?.reps || 0, weight: lastSet?.weight || 0, completed: false },
      ],
    };
    set({ activeWorkout: { ...activeWorkout, exercises } });
  },

  updateSet: (exerciseIndex, setIndex, data) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    const exercises = [...activeWorkout.exercises];
    const sets = [...exercises[exerciseIndex].sets];
    sets[setIndex] = { ...sets[setIndex], ...data };
    exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
    set({ activeWorkout: { ...activeWorkout, exercises } });
  },

  removeExerciseFromWorkout: (exerciseIndex) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    const exercises = activeWorkout.exercises.filter((_, i) => i !== exerciseIndex);
    set({ activeWorkout: { ...activeWorkout, exercises } });
  },

  finishWorkout: () => {
    const { activeWorkout, currentDate, dayLogs } = get();
    if (!activeWorkout) return;
    const dayLog = dayLogs[currentDate] || { date: currentDate, meals: [] };
    set({
      dayLogs: {
        ...dayLogs,
        [currentDate]: {
          ...dayLog,
          workout: activeWorkout,
        },
      },
      activeWorkout: null,
    });
  },

  cancelWorkout: () => set({ activeWorkout: null }),
}));
