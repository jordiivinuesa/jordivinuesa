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
  { id: "e9", name: "Fondos en paralelas (pecho)", muscleGroup: "pecho", type: "peso corporal", description: "Descender entre barras paralelas enfocando el pecho" },
  { id: "e10", name: "Pec deck (mariposa)", muscleGroup: "pecho", type: "máquina", description: "Cerrar brazos en máquina mariposa" },
  { id: "e100", name: "Press de banca con agarre ancho", muscleGroup: "pecho", type: "barra", description: "Press de banca con manos más separadas de lo normal" },
  { id: "e101", name: "Press con mancuernas en banco inclinado", muscleGroup: "pecho", type: "mancuerna", description: "Press superior con mancuernas" },
  { id: "e102", name: "Flexiones con manos juntas", muscleGroup: "pecho", type: "peso corporal", description: "Flexiones enfocadas en la parte interna del pecho y tríceps" },
  { id: "e103", name: "Aperturas en polea alta", muscleGroup: "pecho", type: "cable", description: "Cruce de poleas desde arriba hacia abajo" },
  { id: "e104", name: "Aperturas en polea baja", muscleGroup: "pecho", type: "cable", description: "Cruce de poleas desde abajo hacia arriba" },
  { id: "e105", name: "Svend Press", muscleGroup: "pecho", type: "libre", description: "Presionar discos entre las manos frente al pecho" },
  { id: "e106", name: "Chest Press Hammer Strength", muscleGroup: "pecho", type: "máquina", description: "Máquina de press de pecho convergente" },
  { id: "e107", name: "Flexiones declinadas", muscleGroup: "pecho", type: "peso corporal", description: "Flexiones con los pies elevados" },
  { id: "e108", name: "Pull-over con barra", muscleGroup: "pecho", type: "barra", description: "Extensión de brazos hacia atrás con barra" },

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
  { id: "e109", name: "Dominadas supinas", muscleGroup: "espalda", type: "peso corporal", description: "Dominadas con palmas hacia el cuerpo" },
  { id: "e110", name: "Jalón al pecho agarre estrecho", muscleGroup: "espalda", type: "máquina", description: "Jalón con manos juntas y palmas enfrentadas" },
  { id: "e111", name: "Remo con barra agarre supino", muscleGroup: "espalda", type: "barra", description: "Remo inclinado con palmas hacia arriba" },
  { id: "e112", name: "Remo seal", muscleGroup: "espalda", type: "barra", description: "Remo acostado boca abajo en banco elevado" },
  { id: "e113", name: "Peso muerto rack pull", muscleGroup: "espalda", type: "barra", description: "Peso muerto parcial desde los soportes" },
  { id: "e114", name: "Remo con mancuerna a dos manos", muscleGroup: "espalda", type: "mancuerna", description: "Remo inclinado con dos mancuernas" },
  { id: "e115", name: "Facepull (espalda alta)", muscleGroup: "espalda", type: "cable", description: "Tirar de la polea hacia la frente enfocando trapecio y deltoide posterior" },
  { id: "e116", name: "Remo Meadows", muscleGroup: "espalda", type: "barra", description: "Remo unilateral con barra en esquina" },
  { id: "e117", name: "Remo inclinado con cable", muscleGroup: "espalda", type: "cable", description: "Remo de pie inclinado usando polea" },
  { id: "e118", name: "Hiperextensiones", muscleGroup: "espalda", type: "peso corporal", description: "Extensión lumbar en banco romano" },
  { id: "e119", name: "Remo invertido", muscleGroup: "espalda", type: "peso corporal", description: "Remo bajo una barra usando el propio peso" },

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
  { id: "e120", name: "Press militar sentado", muscleGroup: "hombros", type: "barra", description: "Press vertical con barra apoyado en banco" },
  { id: "e121", name: "Elevaciones laterales inclinado", muscleGroup: "hombros", type: "mancuerna", description: "Elevaciones laterales con el cuerpo inclinado hacia un lado" },
  { id: "e122", name: "Elevaciones frontales con disco", muscleGroup: "hombros", type: "libre", description: "Elevar disco de pesas frontalmente" },
  { id: "e123", name: "Upright Row (Remo al cuello)", muscleGroup: "hombros", type: "barra", description: "Tirar barra hacia la barbilla" },
  { id: "e124", name: "Press Z", muscleGroup: "hombros", type: "barra", description: "Press militar sentado en el suelo sin apoyo" },
  { id: "e125", name: "Pájaros en máquina", muscleGroup: "hombros", type: "máquina", description: "Aperturas invertidas en máquina pec deck" },
  { id: "e126", name: "Press unilateral en polea", muscleGroup: "hombros", type: "cable", description: "Press de hombros con una mano en polea" },
  { id: "e127", name: "Elevaciones laterales Y", muscleGroup: "hombros", type: "mancuerna", description: "Elevaciones frontales-laterales en forma de Y" },
  { id: "e128", name: "L-Fly con mancuerna", muscleGroup: "hombros", type: "mancuerna", description: "Rotación externa del manguito rotador" },

  // BÍCEPS
  { id: "e31", name: "Curl con barra", muscleGroup: "bíceps", type: "barra", description: "Flexionar brazos con barra recta" },
  { id: "e32", name: "Curl con mancuernas", muscleGroup: "bíceps", type: "mancuerna", description: "Flexionar brazos alternando mancuernas" },
  { id: "e33", name: "Curl martillo", muscleGroup: "bíceps", type: "mancuerna", description: "Curl con agarre neutro" },
  { id: "e34", name: "Curl en banco Scott", muscleGroup: "bíceps", type: "barra", description: "Curl apoyando brazos en banco Scott" },
  { id: "e35", name: "Curl en polea", muscleGroup: "bíceps", type: "cable", description: "Curl de bíceps en polea baja" },
  { id: "e36", name: "Curl concentrado", muscleGroup: "bíceps", type: "mancuerna", description: "Curl sentado con codo en rodilla" },
  { id: "e37", name: "Curl con barra Z", muscleGroup: "bíceps", type: "barra", description: "Curl con barra en zigzag" },
  { id: "e129", name: "Curl araña (Spider Curl)", muscleGroup: "bíceps", type: "barra", description: "Curl inclinado boca abajo sobre banco" },
  { id: "e130", name: "Curl predicador unilateral", muscleGroup: "bíceps", type: "mancuerna", description: "Curl en banco predicador con una mano" },
  { id: "e131", name: "Curl martillo en polea (cuerda)", muscleGroup: "bíceps", type: "cable", description: "Curl neutro con cuerda en polea" },
  { id: "e132", name: "Curl inclinado con mancuernas", muscleGroup: "bíceps", type: "mancuerna", description: "Curl sentado en banco inclinado para mayor estiramiento" },
  { id: "e133", name: "Drag Curl", muscleGroup: "bíceps", type: "barra", description: "Curl subiendo la barra pegada al torso" },
  { id: "e134", name: "Curl Zottman", muscleGroup: "bíceps", type: "mancuerna", description: "Curl con rotación de muñecas en la bajada" },
  { id: "e135", name: "Curl en banco Scott con mancuerna", muscleGroup: "bíceps", type: "mancuerna", description: "Curl concentrado en banco Scott" },
  { id: "e136", name: "Curl 21", muscleGroup: "bíceps", type: "barra", description: "Serie de 7 medias repeticiones bajas, 7 altas y 7 completas" },

  // TRÍCEPS
  { id: "e38", name: "Press francés", muscleGroup: "tríceps", type: "barra", description: "Extensión de tríceps acostado" },
  { id: "e39", name: "Extensión de tríceps en polea", muscleGroup: "tríceps", type: "cable", description: "Empujar cable hacia abajo" },
  { id: "e40", name: "Patada de tríceps", muscleGroup: "tríceps", type: "mancuerna", description: "Extensión de brazo hacia atrás" },
  { id: "e41", name: "Fondos en banco", muscleGroup: "tríceps", type: "peso corporal", description: "Fondos apoyándose en banco" },
  { id: "e42", name: "Extensión sobre cabeza", muscleGroup: "tríceps", type: "mancuerna", description: "Extensión de tríceps sobre la cabeza" },
  { id: "e43", name: "Press cerrado", muscleGroup: "tríceps", type: "barra", description: "Press de banca con agarre cerrado" },
  { id: "e137", name: "Extensión de tríceps con cuerda", muscleGroup: "tríceps", type: "cable", description: "Empujar cuerda hacia abajo abriendo al final" },
  { id: "e138", name: "Extensión tras nuca en polea", muscleGroup: "tríceps", type: "cable", description: "Extensión vertical en polea por detrás de la cabeza" },
  { id: "e139", name: "Press francés con mancuernas", muscleGroup: "tríceps", type: "mancuerna", description: "Extensión acostada con mancuernas" },
  { id: "e140", name: "Extensión unilateral en polea (palma arriba)", muscleGroup: "tríceps", type: "cable", description: "Extensión de un brazo con agarre supino" },
  { id: "e141", name: "Fondos en paralelas (tríceps)", muscleGroup: "tríceps", type: "peso corporal", description: "Fondos manteniendo el cuerpo recto para enfocar tríceps" },
  { id: "e142", name: "Press francés inclinado", muscleGroup: "tríceps", type: "barra", description: "Press francés en banco inclinado" },
  { id: "e143", name: "JM Press", muscleGroup: "tríceps", type: "barra", description: "Híbrido entre press cerrado y press francés" },
  { id: "e144", name: "Extensión individual con mancuerna tras nuca", muscleGroup: "tríceps", type: "mancuerna", description: "Extensión vertical sentado unilateral" },

  // PIERNAS
  { id: "e44", name: "Sentadilla con barra", muscleGroup: "piernas", type: "barra", description: "Flexionar piernas con barra en espalda" },
  { id: "e45", name: "Prensa de piernas", muscleGroup: "piernas", type: "máquina", description: "Empujar plataforma con piernas" },
  { id: "e46", name: "Extensión de cuádriceps", muscleGroup: "piernas", type: "máquina", description: "Extender piernas en máquina" },
  { id: "e47", name: "Curl de piernas acostado", muscleGroup: "piernas", type: "máquina", description: "Flexionar piernas en máquina acostado" },
  { id: "e48", name: "Sentadilla hack", muscleGroup: "piernas", type: "máquina", description: "Sentadilla en máquina hack" },
  { id: "e49", name: "Zancadas con mancuernas", muscleGroup: "piernas", type: "mancuerna", description: "Dar pasos largos con mancuernas" },
  { id: "e50", name: "Peso muerto rumano", muscleGroup: "piernas", type: "barra", description: "Peso muerto con piernas casi rectas" },
  { id: "e51", name: "Sentadilla búlgara", muscleGroup: "piernas", type: "mancuerna", description: "Sentadilla con pie trasero elevado" },
  { id: "e52", name: "Elevación de gemelos de pie", muscleGroup: "piernas", type: "máquina", description: "Elevar talones en máquina vertical" },
  { id: "e53", name: "Aductores en máquina", muscleGroup: "piernas", type: "máquina", description: "Cerrar piernas en máquina" },
  { id: "e54", name: "Abductores en máquina", muscleGroup: "piernas", type: "máquina", description: "Abrir piernas en máquina" },
  { id: "e55", name: "Sentadilla goblet", muscleGroup: "piernas", type: "mancuerna", description: "Sentadilla sosteniendo mancuerna al pecho" },
  { id: "e145", name: "Sentadilla frontal", muscleGroup: "piernas", type: "barra", description: "Sentadilla con barra apoyada en los hombros delanteros" },
  { id: "e146", name: "Zancadas caminando", muscleGroup: "piernas", type: "libre", description: "Dar pasos largos avanzando" },
  { id: "e147", name: "Peso muerto sumo", muscleGroup: "piernas", type: "barra", description: "Peso muerto con piernas muy abiertas" },
  { id: "e148", name: "Curl de piernas sentado", muscleGroup: "piernas", type: "máquina", description: "Flexión femoral en posición sentada" },
  { id: "e149", name: "Prensa inclina unilateral", muscleGroup: "piernas", type: "máquina", description: "Prensa a una sola pierna" },
  { id: "e150", name: "Step-up con mancuernas", muscleGroup: "piernas", type: "mancuerna", description: "Subir a un cajón alternando piernas" },
  { id: "e151", name: "Elevación de gemelos sentado", muscleGroup: "piernas", type: "máquina", description: "Elevación de talones enfocada en el sóleo" },
  { id: "e152", name: "Sissy Squat", muscleGroup: "piernas", type: "peso corporal", description: "Sentadilla inclinando el torso hacia atrás" },
  { id: "e153", name: "Prensa de gemelos", muscleGroup: "piernas", type: "máquina", description: "Elevar talones en la máquina de prensa" },
  { id: "e154", name: "Extensiones de cadera en polea", muscleGroup: "piernas", type: "cable", description: "Tirar pierna hacia atrás de pie" },

  // GLÚTEOS
  { id: "e56", name: "Hip thrust", muscleGroup: "glúteos", type: "barra", description: "Empuje de cadera con barra" },
  { id: "e57", name: "Patada de glúteo en polea", muscleGroup: "glúteos", type: "cable", description: "Patada hacia atrás en polea" },
  { id: "e58", name: "Puente de glúteos", muscleGroup: "glúteos", type: "peso corporal", description: "Elevar cadera acostado" },
  { id: "e155", name: "Abducción de cadera en polea", muscleGroup: "glúteos", type: "cable", description: "Elevar pierna lateralmente de pie" },
  { id: "e156", name: "Frog Pumps", muscleGroup: "glúteos", type: "peso corporal", description: "Puente de glúteos con plantas de los pies juntas" },
  { id: "e157", name: "Clamshells (Almejas)", muscleGroup: "glúteos", type: "peso corporal", description: "Abrir rodillas acostado de lado" },
  { id: "e158", name: "Hip Thrust unilateral", muscleGroup: "glúteos", type: "mancuerna", description: "Empuje de cadera a una pierna" },
  { id: "e159", name: "Buenos días con barra", muscleGroup: "glúteos", type: "barra", description: "Inclinar torso con barra en espalda" },

  // ABDOMINALES
  { id: "e59", name: "Crunch abdominal", muscleGroup: "abdominales", type: "peso corporal", description: "Flexión de tronco acostado" },
  { id: "e60", name: "Plancha frontal", muscleGroup: "abdominales", type: "peso corporal", description: "Mantener posición de tabla horizontal" },
  { id: "e61", name: "Elevación de piernas colgado", muscleGroup: "abdominales", type: "peso corporal", description: "Elevar piernas suspendido de una barra" },
  { id: "e62", name: "Russian twist", muscleGroup: "abdominales", type: "libre", description: "Rotación de tronco sentado con piernas elevadas" },
  { id: "e63", name: "Ab wheel (Rueda abdominal)", muscleGroup: "abdominales", type: "libre", description: "Rodar hacia adelante y atrás" },
  { id: "e64", name: "Crunch en polea alta", muscleGroup: "abdominales", type: "cable", description: "Crunch de rodillas tirando cable" },
  { id: "e160", name: "Plancha lateral", muscleGroup: "abdominales", type: "peso corporal", description: "Sostener peso de lado apoyado en antebrazo" },
  { id: "e161", name: "V-Ups", muscleGroup: "abdominales", type: "peso corporal", description: "Cerrar cuerpo en V elevando piernas y torso" },
  { id: "e162", name: "Bicicleta abdominal", muscleGroup: "abdominales", type: "peso corporal", description: "Alternar codo a rodilla contraria acostado" },
  { id: "e163", name: "Mountain Climbers", muscleGroup: "abdominales", type: "peso corporal", description: "Correr en posición de plancha alta" },
  { id: "e164", name: "Deadbug", muscleGroup: "abdominales", type: "peso corporal", description: "Movimiento controlado de extremidades opuestas" },
  { id: "e165", name: "Deadlift (Peso muerto) como core", muscleGroup: "abdominales", type: "barra", description: "Peso muerto tradicional como estabilizador" },
  { id: "e166", name: "Dragon Flag", muscleGroup: "abdominales", type: "peso corporal", description: "Elevación de cuerpo completo desde banco" },
  { id: "e167", name: "Hollow Hold", muscleGroup: "abdominales", type: "peso corporal", description: "Mantener cuerpo en forma de barca" },
  { id: "e168", name: "Woodchopper con polea", muscleGroup: "abdominales", type: "cable", description: "Rotación diagonal de tronco con polea" },

  // ANTEBRAZOS
  { id: "e169", name: "Curl de muñeca con barra", muscleGroup: "antebrazos", type: "barra", description: "Flexión de muñecas sentado" },
  { id: "e170", name: "Curl de muñeca invertido", muscleGroup: "antebrazos", type: "barra", description: "Extensión de muñecas sentado" },
  { id: "e171", name: "Paseo del granjero", muscleGroup: "antebrazos", type: "mancuerna", description: "Caminar cargando mancuernas pesadas" },
  { id: "e172", name: "Rodillo de muñeca", muscleGroup: "antebrazos", type: "libre", description: "Enrollar cuerda con peso" },
  { id: "e173", name: "Colgado en barra (Dead Hang)", muscleGroup: "antebrazos", type: "peso corporal", description: "Mantenerse colgado por tiempo para agarre" },
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
