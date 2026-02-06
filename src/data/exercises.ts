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
}

export const exercises: Exercise[] = [
  // PECHO
  { id: "e1", name: "Press de banca", muscleGroup: "pecho", type: "barra", description: "Acostado en banco plano, empujar barra hacia arriba" },
  { id: "e2", name: "Press de banca inclinado", muscleGroup: "pecho", type: "barra", description: "En banco inclinado, empujar barra hacia arriba" },
  { id: "e3", name: "Press de banca declinado", muscleGroup: "pecho", type: "barra", description: "En banco declinado, empujar barra hacia arriba" },
  { id: "e4", name: "Aperturas con mancuernas", muscleGroup: "pecho", type: "mancuerna", description: "Abrir brazos lateralmente con mancuernas" },
  { id: "e5", name: "Press con mancuernas", muscleGroup: "pecho", type: "mancuerna", description: "Empujar mancuernas desde el pecho" },
  { id: "e6", name: "Máquina de press de pecho", muscleGroup: "pecho", type: "máquina", description: "Press de pecho en máquina guiada" },
  { id: "e7", name: "Cruce de cables", muscleGroup: "pecho", type: "cable", description: "Cruzar cables frente al cuerpo" },
  { id: "e8", name: "Flexiones", muscleGroup: "pecho", type: "peso corporal", description: "Flexiones de brazos en el suelo" },
  { id: "e9", name: "Fondos en paralelas", muscleGroup: "pecho", type: "peso corporal", description: "Descender entre barras paralelas" },
  { id: "e10", name: "Pec deck (mariposa)", muscleGroup: "pecho", type: "máquina", description: "Cerrar brazos en máquina mariposa" },

  // ESPALDA
  { id: "e11", name: "Dominadas", muscleGroup: "espalda", type: "peso corporal", description: "Colgarse de barra y subir el cuerpo" },
  { id: "e12", name: "Remo con barra", muscleGroup: "espalda", type: "barra", description: "Tirar barra hacia el abdomen inclinado" },
  { id: "e13", name: "Remo con mancuerna", muscleGroup: "espalda", type: "mancuerna", description: "Tirar mancuerna con un brazo apoyado" },
  { id: "e14", name: "Jalón al pecho", muscleGroup: "espalda", type: "máquina", description: "Tirar polea hacia el pecho" },
  { id: "e15", name: "Jalón tras nuca", muscleGroup: "espalda", type: "máquina", description: "Tirar polea detrás de la cabeza" },
  { id: "e16", name: "Remo en máquina", muscleGroup: "espalda", type: "máquina", description: "Tirar peso en máquina de remo" },
  { id: "e17", name: "Peso muerto", muscleGroup: "espalda", type: "barra", description: "Levantar barra del suelo con espalda recta" },
  { id: "e18", name: "Remo en polea baja", muscleGroup: "espalda", type: "cable", description: "Tirar cable sentado hacia el abdomen" },
  { id: "e19", name: "Pullover con mancuerna", muscleGroup: "espalda", type: "mancuerna", description: "Extensión de brazos por detrás de la cabeza" },
  { id: "e20", name: "Remo T-bar", muscleGroup: "espalda", type: "barra", description: "Remo con barra en soporte T" },

  // HOMBROS
  { id: "e21", name: "Press militar", muscleGroup: "hombros", type: "barra", description: "Empujar barra sobre la cabeza de pie" },
  { id: "e22", name: "Press con mancuernas (hombro)", muscleGroup: "hombros", type: "mancuerna", description: "Empujar mancuernas sobre la cabeza sentado" },
  { id: "e23", name: "Elevaciones laterales", muscleGroup: "hombros", type: "mancuerna", description: "Elevar mancuernas lateralmente" },
  { id: "e24", name: "Elevaciones frontales", muscleGroup: "hombros", type: "mancuerna", description: "Elevar mancuernas al frente" },
  { id: "e25", name: "Pájaros (posterior)", muscleGroup: "hombros", type: "mancuerna", description: "Elevar mancuernas inclinado hacia atrás" },
  { id: "e26", name: "Press Arnold", muscleGroup: "hombros", type: "mancuerna", description: "Press con rotación de muñecas" },
  { id: "e27", name: "Elevaciones laterales en cable", muscleGroup: "hombros", type: "cable", description: "Elevar cable lateralmente" },
  { id: "e28", name: "Press de hombros en máquina", muscleGroup: "hombros", type: "máquina", description: "Press de hombros guiado" },
  { id: "e29", name: "Face pull", muscleGroup: "hombros", type: "cable", description: "Tirar cable hacia la cara" },
  { id: "e30", name: "Encogimientos con barra", muscleGroup: "trapecio", type: "barra", description: "Encoger hombros con barra" },

  // BÍCEPS
  { id: "e31", name: "Curl con barra", muscleGroup: "bíceps", type: "barra", description: "Flexionar brazos con barra recta" },
  { id: "e32", name: "Curl con mancuernas", muscleGroup: "bíceps", type: "mancuerna", description: "Flexionar brazos alternando mancuernas" },
  { id: "e33", name: "Curl martillo", muscleGroup: "bíceps", type: "mancuerna", description: "Curl con agarre neutro" },
  { id: "e34", name: "Curl en banco Scott", muscleGroup: "bíceps", type: "barra", description: "Curl apoyando brazos en banco Scott" },
  { id: "e35", name: "Curl en polea", muscleGroup: "bíceps", type: "cable", description: "Curl de bíceps en polea baja" },
  { id: "e36", name: "Curl concentrado", muscleGroup: "bíceps", type: "mancuerna", description: "Curl sentado con codo en rodilla" },
  { id: "e37", name: "Curl con barra Z", muscleGroup: "bíceps", type: "barra", description: "Curl con barra en zigzag" },

  // TRÍCEPS
  { id: "e38", name: "Press francés", muscleGroup: "tríceps", type: "barra", description: "Extensión de tríceps acostado" },
  { id: "e39", name: "Extensión de tríceps en polea", muscleGroup: "tríceps", type: "cable", description: "Empujar cable hacia abajo" },
  { id: "e40", name: "Patada de tríceps", muscleGroup: "tríceps", type: "mancuerna", description: "Extensión de brazo hacia atrás" },
  { id: "e41", name: "Fondos en banco", muscleGroup: "tríceps", type: "peso corporal", description: "Fondos apoyándose en banco" },
  { id: "e42", name: "Extensión sobre cabeza", muscleGroup: "tríceps", type: "mancuerna", description: "Extensión de tríceps sobre la cabeza" },
  { id: "e43", name: "Press cerrado", muscleGroup: "tríceps", type: "barra", description: "Press de banca con agarre cerrado" },

  // PIERNAS
  { id: "e44", name: "Sentadilla con barra", muscleGroup: "piernas", type: "barra", description: "Flexionar piernas con barra en espalda" },
  { id: "e45", name: "Prensa de piernas", muscleGroup: "piernas", type: "máquina", description: "Empujar plataforma con piernas" },
  { id: "e46", name: "Extensión de cuádriceps", muscleGroup: "piernas", type: "máquina", description: "Extender piernas en máquina" },
  { id: "e47", name: "Curl de piernas", muscleGroup: "piernas", type: "máquina", description: "Flexionar piernas en máquina" },
  { id: "e48", name: "Sentadilla hack", muscleGroup: "piernas", type: "máquina", description: "Sentadilla en máquina hack" },
  { id: "e49", name: "Zancadas con mancuernas", muscleGroup: "piernas", type: "mancuerna", description: "Dar pasos largos con mancuernas" },
  { id: "e50", name: "Peso muerto rumano", muscleGroup: "piernas", type: "barra", description: "Peso muerto con piernas casi rectas" },
  { id: "e51", name: "Sentadilla búlgara", muscleGroup: "piernas", type: "mancuerna", description: "Sentadilla con pie trasero elevado" },
  { id: "e52", name: "Elevación de gemelos", muscleGroup: "piernas", type: "máquina", description: "Elevar talones en máquina" },
  { id: "e53", name: "Aductores en máquina", muscleGroup: "piernas", type: "máquina", description: "Cerrar piernas en máquina" },
  { id: "e54", name: "Abductores en máquina", muscleGroup: "piernas", type: "máquina", description: "Abrir piernas en máquina" },
  { id: "e55", name: "Sentadilla goblet", muscleGroup: "piernas", type: "mancuerna", description: "Sentadilla sosteniendo mancuerna al pecho" },

  // GLÚTEOS
  { id: "e56", name: "Hip thrust", muscleGroup: "glúteos", type: "barra", description: "Empuje de cadera con barra" },
  { id: "e57", name: "Patada de glúteo en polea", muscleGroup: "glúteos", type: "cable", description: "Patada hacia atrás en polea" },
  { id: "e58", name: "Puente de glúteos", muscleGroup: "glúteos", type: "peso corporal", description: "Elevar cadera acostado" },

  // ABDOMINALES
  { id: "e59", name: "Crunch abdominal", muscleGroup: "abdominales", type: "peso corporal", description: "Flexión de tronco acostado" },
  { id: "e60", name: "Plancha", muscleGroup: "abdominales", type: "peso corporal", description: "Mantener posición de tabla" },
  { id: "e61", name: "Elevación de piernas", muscleGroup: "abdominales", type: "peso corporal", description: "Elevar piernas colgado" },
  { id: "e62", name: "Russian twist", muscleGroup: "abdominales", type: "libre", description: "Rotación de tronco con peso" },
  { id: "e63", name: "Ab wheel", muscleGroup: "abdominales", type: "libre", description: "Rueda abdominal" },
  { id: "e64", name: "Crunch en polea", muscleGroup: "abdominales", type: "cable", description: "Crunch de rodillas tirando cable" },
];

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

export const muscleGroupIcons: Record<MuscleGroup, string> = {
  pecho: "💪",
  espalda: "🔙",
  hombros: "🏋️",
  bíceps: "💪",
  tríceps: "💪",
  piernas: "🦵",
  glúteos: "🍑",
  abdominales: "🎯",
  antebrazos: "✊",
  trapecio: "🏋️",
};
