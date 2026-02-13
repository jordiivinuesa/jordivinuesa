

import benchPressImg from '../assets/exercises/bench_press.jpg';
import benchPressDumbbellImg from '../assets/exercises/bench_press_dumbbell.jpg';
import inclineBenchPressBarbell from '../assets/exercises/incline_bench_press_barbell.jpg';
import dumbbellFlyesImg from '../assets/exercises/dumbbell_flyes.jpg';
import cableCrossoverImg from '../assets/exercises/cable_crossover.jpg';
import pushUpsImg from '../assets/exercises/push_ups.jpg';
import chestDipsImg from '../assets/exercises/chest_dips.jpg';

export type MuscleGroup =
  | "pecho" | "espalda" | "hombros" | "bíceps" | "tríceps"
  | "piernas" | "glúteos" | "abdominales" | "antebrazos" | "trapecio";

export type ExerciseType = "libre" | "máquina" | "cable" | "barra" | "mancuerna" | "peso corporal";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  type: ExerciseType;
  description: string;
  gifUrl?: string; // Mantener opcional por compatibilidad si es necesario, pero no lo usaremos
  modelUrl?: string; // Path to 3D model/image specific for this exercise
  muscleHighlight?: string; // Specific muscle to highlight in 3D model (e.g., "abs", "legs")
}

export const muscleGroupLabels: Record<MuscleGroup, string> = {
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

export const exercises: Exercise[] = [
  // --- PECHO ---
  {
    id: "Barbell_Bench_Press_-_Medium_Grip",
    name: "Press de Banca con Barra",
    muscleGroup: "pecho",
    type: "barra",
    description: "El ejercicio rey para el desarrollo del pectoral. Túmbate en el banco y empuja la barra desde el pecho hasta extender los brazos.",
    modelUrl: benchPressImg // Placeholder específico
  },
  {
    id: "chest_incline_bench_press_barbell",
    name: "Press Inclinado con Barra",
    muscleGroup: "pecho",
    type: "barra",
    description: "Enfocado en la parte superior del pecho (clavicular). Banco a 30-45 grados.",
    modelUrl: inclineBenchPressBarbell
  },
  {
    id: "chest_bench_press_dumbbell",
    name: "Press de Banca con Mancuernas",
    muscleGroup: "pecho",
    type: "mancuerna",
    description: "Mayor rango de movimiento que la barra. Permite trabajar cada lado de forma independiente.",
    modelUrl: benchPressDumbbellImg
  },
  {
    id: "chest_incline_bench_press_dumbbell",
    name: "Press Inclinado con Mancuernas",
    muscleGroup: "pecho",
    type: "mancuerna",
    description: "Desarrollo del pectoral superior con mayor rango de movimiento."
  },
  {
    id: "chest_dumbbell_flyes",
    name: "Aperturas con Mancuernas",
    muscleGroup: "pecho",
    type: "mancuerna",
    description: "Ejercicio de aislamiento para eixanchar el pecho. Codos ligeramente flexionados.",
    modelUrl: dumbbellFlyesImg
  },
  {
    id: "chest_cable_crossover",
    name: "Cruce de Poleas",
    muscleGroup: "pecho",
    type: "cable",
    description: "Excelente para el bombeo y la contracción final del pectoral.",
    modelUrl: cableCrossoverImg
  },
  {
    id: "chest_push_ups",
    name: "Flexiones",
    muscleGroup: "pecho",
    type: "peso corporal",
    description: "El clásico ejercicio de empuje con peso corporal. Mantén el cuerpo recto como una tabla.",
    modelUrl: pushUpsImg
  },
  {
    id: "chest_dips",
    name: "Fondos en Paralelas (Pecho)",
    muscleGroup: "pecho",
    type: "peso corporal",
    description: "Inclina el cuerpo hacia adelante para enfatizar el pecho sobre los tríceps.",
    modelUrl: chestDipsImg
  },
  {
    id: "chest_machine_press",
    name: "Press en Máquina Sentado",
    muscleGroup: "pecho",
    type: "máquina",
    description: "Movimiento guiado y seguro para hipertrofia sin necesidad de estabilización."
  },
  {
    id: "chest_pec_deck",
    name: "Pec Deck (Contractora)",
    muscleGroup: "pecho",
    type: "máquina",
    description: "Aislamiento estricto del pectoral sin involucrar tríceps."
  },

  // --- ESPALDA ---
  {
    id: "back_deadlift",
    name: "Peso Muerto",
    muscleGroup: "espalda",
    type: "barra",
    description: "Ejercicio compuesto total. Trabaja espalda baja, glúteos, femorales y trapecios."
  },
  {
    id: "back_pull_ups",
    name: "Dominadas",
    muscleGroup: "espalda",
    type: "peso corporal",
    description: "El mejor constructor de amplitud de espalda. Sube hasta pasar la barbilla por encima de la barra."
  },
  {
    id: "back_lat_pulldown",
    name: "Jalón al Pecho",
    muscleGroup: "espalda",
    type: "cable",
    description: "Alternativa a las dominadas para desarrollar la amplitud dorsal."
  },
  {
    id: "back_barbell_row",
    name: "Remo con Barra",
    muscleGroup: "espalda",
    type: "barra",
    description: "Constructor de densidad y grosor de espalda. Mantén la espalda recta."
  },
  {
    id: "back_dumbbell_row",
    name: "Remo con Mancuerna a una mano",
    muscleGroup: "espalda",
    type: "mancuerna",
    description: "Permite un gran rango de movimiento y focalización unilateral."
  },
  {
    id: "back_seated_cable_row",
    name: "Remo en Polea Baja",
    muscleGroup: "espalda",
    type: "cable",
    description: "Remo sentado para grosor de espalda media y dorsal."
  },
  {
    id: "back_t_bar_row",
    name: "Remo T",
    muscleGroup: "espalda",
    type: "máquina",
    description: "Variante de remo muy estable que permite mover grandes cargas."
  },
  {
    id: "back_face_pull",
    name: "Face Pull",
    muscleGroup: "espalda", // También hombros
    type: "cable",
    description: "Salud del hombro y trabajo de trapecio medio/inferior y deltoides posterior."
  },
  {
    id: "back_hyperextensions",
    name: "Hiperextensiones",
    muscleGroup: "espalda",
    type: "peso corporal",
    description: "Fortalecimiento de la espalda baja (lumbares)."
  },
  {
    id: "back_pullover_cable",
    name: "Pullover en Polea Alta",
    muscleGroup: "espalda",
    type: "cable",
    description: "Aislamiento del dorsal ancho sin involucrar bíceps."
  },

  // --- HOMBROS ---
  {
    id: "shoulders_overhead_press_barbell",
    name: "Press Militar con Barra",
    muscleGroup: "hombros",
    type: "barra",
    description: "Ejercicio base de fuerza para hombros."
  },
  {
    id: "shoulders_dumbbell_press",
    name: "Press de Hombros con Mancuernas",
    muscleGroup: "hombros",
    type: "mancuerna",
    description: "Press sentado o de pie con mancuernas."
  },
  {
    id: "shoulders_lateral_raises",
    name: "Elevaciones Laterales",
    muscleGroup: "hombros",
    type: "mancuerna",
    description: "Clave para la 'anchura' del hombro (cabeza lateral)."
  },
  {
    id: "shoulders_front_raises",
    name: "Elevaciones Frontales",
    muscleGroup: "hombros",
    type: "mancuerna",
    description: "Trabajo de la cabeza anterior del deltoides."
  },
  {
    id: "shoulders_reverse_flyes",
    name: "Pájaros (Reverse Flyes)",
    muscleGroup: "hombros",
    type: "mancuerna",
    description: "Trabajo de la cabeza posterior del deltoides."
  },
  {
    id: "shoulders_arnold_press",
    name: "Press Arnold",
    muscleGroup: "hombros",
    type: "mancuerna",
    description: "Rotación durante el press para mayor activación deltoidea."
  },
  {
    id: "shoulders_upright_row",
    name: "Remo al Mentón",
    muscleGroup: "hombros",
    type: "barra",
    description: "Trabaja deltoides laterales y trapecios."
  },
  {
    id: "shoulders_cable_lateral_raise",
    name: "Elevaciones Laterales en Polea",
    muscleGroup: "hombros",
    type: "cable",
    description: "Tensión constante en todo el rango de movimiento."
  },

  // --- PIERNAS ---
  {
    id: "legs_squat_barbell",
    name: "Sentadilla con Barra",
    muscleGroup: "piernas",
    type: "barra",
    description: "El ejercicio rey de piernas."
  },
  {
    id: "legs_leg_press",
    name: "Prensa de Piernas",
    muscleGroup: "piernas",
    type: "máquina",
    description: "Mueve grandes cargas sin cargar la espalda."
  },
  {
    id: "legs_lunges",
    name: "Zancadas (Lunges)",
    muscleGroup: "piernas",
    type: "mancuerna",
    description: "Excelente ejercicio unilateral para cuádriceps y glúteo."
  },
  {
    id: "legs_leg_extension",
    name: "Extensiones de Cuádriceps",
    muscleGroup: "piernas",
    type: "máquina",
    description: "Aislamiento puro para la parte frontal del muslo."
  },
  {
    id: "legs_lying_leg_curl",
    name: "Curl Femoral Tumbado",
    muscleGroup: "piernas",
    type: "máquina",
    description: "Trabajo directo de isquios."
  },
  {
    id: "legs_seated_leg_curl",
    name: "Curl Femoral Sentado",
    muscleGroup: "piernas",
    type: "máquina",
    description: "Trabajo de isquios en posición estirada."
  },
  {
    id: "legs_goblet_squat",
    name: "Sentadilla Goblet",
    muscleGroup: "piernas",
    type: "mancuerna",
    description: "Ideal para aprender la técnica de sentadilla o calentar."
  },
  {
    id: "legs_bulgarian_split_squat",
    name: "Sentadilla Búlgara",
    muscleGroup: "piernas",
    type: "mancuerna",
    description: "Amado y odiado. Unilateral, equilibrio y fuerza."
  },
  {
    id: "legs_calf_raise_standing",
    name: "Elevación de Talones de Pie",
    muscleGroup: "piernas",
    type: "máquina",
    description: "Gemelos (Gastrocnemio)."
  },
  {
    id: "legs_calf_raise_seated",
    name: "Elevación de Talones Sentado",
    muscleGroup: "piernas",
    type: "máquina",
    description: "Sóleo (músculo bajo el gemelo)."
  },

  // --- BÍCEPS ---
  {
    id: "biceps_barbell_curl",
    name: "Curl con Barra",
    muscleGroup: "bíceps",
    type: "barra",
    description: "Constructor de masa básico para bíceps."
  },
  {
    id: "biceps_dumbbell_curl",
    name: "Curl con Mancuernas",
    muscleGroup: "bíceps",
    type: "mancuerna",
    description: "Permite supinar la muñeca."
  },
  {
    id: "biceps_hammer_curl",
    name: "Curl Martillo",
    muscleGroup: "bíceps",
    type: "mancuerna",
    description: "Enfasis en braquial y antebrazo."
  },
  {
    id: "biceps_preacher_curl",
    name: "Curl Predicador",
    muscleGroup: "bíceps",
    type: "barra",
    description: "Aislamiento total, evita balanceos."
  },
  {
    id: "biceps_cable_curl",
    name: "Curl en Polea",
    muscleGroup: "bíceps",
    type: "cable",
    description: "Tensión constante."
  },
  {
    id: "biceps_incline_curl",
    name: "Curl Inclinado",
    muscleGroup: "bíceps",
    type: "mancuerna",
    description: "Estiramiento máximo de la cabeza larga del bíceps."
  },
  {
    id: "biceps_concentration_curl",
    name: "Curl Concentrado",
    muscleGroup: "bíceps",
    type: "mancuerna",
    description: "Para el pico del bíceps."
  },

  // --- TRÍCEPS ---
  {
    id: "triceps_pushdown",
    name: "Extensiones en Polea",
    muscleGroup: "tríceps",
    type: "cable",
    description: "Básico y efectivo."
  },
  {
    id: "triceps_skullcrusher",
    name: "Press Francés",
    muscleGroup: "tríceps",
    type: "barra",
    description: "Gran constructor de masa para tríceps."
  },
  {
    id: "triceps_dips",
    name: "Fondos en Paralelas (Tríceps)",
    muscleGroup: "tríceps",
    type: "peso corporal",
    description: "Mantén el cuerpo vertical para enfatizar tríceps."
  },
  {
    id: "triceps_rope_pushdown",
    name: "Extensiones con Cuerda",
    muscleGroup: "tríceps",
    type: "cable",
    description: "Permite abrir al final para mayor contracción."
  },
  {
    id: "triceps_overhead_extension",
    name: "Extensiones Tras Nuca",
    muscleGroup: "tríceps",
    type: "mancuerna",
    description: "Trabaja la cabeza larga del tríceps."
  },
  {
    id: "triceps_close_grip_bench_press",
    name: "Press Banca Agarre Cerrado",
    muscleGroup: "tríceps",
    type: "barra",
    description: "Compuesto pesado para tríceps."
  },
  {
    id: "triceps_kickback",
    name: "Patada de Tríceps",
    muscleGroup: "tríceps",
    type: "mancuerna",
    description: "Contracción máxima."
  },

  // --- GLÚTEOS ---
  {
    id: "glutes_hip_thrust",
    name: "Hip Thrust",
    muscleGroup: "glúteos",
    type: "barra",
    description: "El mejor ejercicio para aislar y cargar el glúteo."
  },
  {
    id: "glutes_bridge",
    name: "Puente de Glúteo",
    muscleGroup: "glúteos",
    type: "peso corporal",
    description: "Versión más sencilla del Hip Thrust."
  },
  {
    id: "glutes_cable_kickback",
    name: "Patada de Glúteo en Polea",
    muscleGroup: "glúteos",
    type: "cable",
    description: "Aislamiento unilateral."
  },
  {
    id: "glutes_abductions_machine",
    name: "Máquina de Abductores",
    muscleGroup: "glúteos",
    type: "máquina",
    description: "Glúteo medio y menor."
  },
  {
    id: "glutes_sumo_deadlift",
    name: "Peso Muerto Sumo",
    muscleGroup: "glúteos",
    type: "barra",
    description: "Variante de peso muerto con mayor énfasis en cadera/glúteo."
  },
  {
    id: "glutes_romanian_deadlift",
    name: "Peso Muerto Rumano",
    muscleGroup: "glúteos",
    type: "barra",
    description: "Enfasis en la cadena posterior (isquios y glúteos)."
  },

  // --- ABDOMINALES ---
  {
    id: "abs_crunch",
    name: "Crunch Abdominal",
    muscleGroup: "abdominales",
    type: "peso corporal",
    description: "Flexión de columna básica."
  },
  {
    id: "abs_plank",
    name: "Plancha",
    muscleGroup: "abdominales",
    type: "peso corporal",
    description: "Estabilidad del core (isométrico)."
  },
  {
    id: "abs_leg_raises",
    name: "Elevación de Piernas",
    muscleGroup: "abdominales",
    type: "peso corporal",
    description: "Enfasis en la parte baja del abdomen."
  },
  {
    id: "abs_wheel",
    name: "Rueda Abdominal",
    muscleGroup: "abdominales",
    type: "libre",
    description: "Ejercicio avanzado de anti-extensión."
  },
  {
    id: "abs_russian_twist",
    name: "Russian Twist",
    muscleGroup: "abdominales",
    type: "peso corporal",
    description: "Trabajo de oblicuos."
  },
  {
    id: "abs_cable_crunch",
    name: "Crunch en Polea",
    muscleGroup: "abdominales",
    type: "cable",
    description: "Crunch con resistencia constante."
  },
  {
    id: "abs_mountain_climbers",
    name: "Escaladores",
    muscleGroup: "abdominales",
    type: "peso corporal",
    description: "Dinámico y metabólico."
  },

  // --- TRAPECIO ---
  {
    id: "traps_barbell_shrug",
    name: "Encogimientos con Barra",
    muscleGroup: "trapecio",
    type: "barra",
    description: "Trampas superiores."
  },
  {
    id: "traps_dumbbell_shrug",
    name: "Encogimientos con Mancuernas",
    muscleGroup: "trapecio",
    type: "mancuerna",
    description: "Trampas superiores."
  },

  // --- ANTEBRAZOS ---
  {
    id: "forearms_wrist_curl",
    name: "Curl de Muñeca",
    muscleGroup: "antebrazos",
    type: "mancuerna",
    description: "Flexores del antebrazo."
  },
  {
    id: "forearms_reverse_wrist_curl",
    name: "Curl de Muñeca Inverso",
    muscleGroup: "antebrazos",
    type: "mancuerna",
    description: "Extensores del antebrazo."
  },
  {
    id: "forearms_farmers_walk",
    name: "Paseo del Granjero",
    muscleGroup: "antebrazos",
    type: "mancuerna",
    description: "Fuerza de agarre y estabilidad total."
  }
];
