export type ActivityCategory = "deporte" | "clase_dirigida";

export interface Activity {
    id: string;
    name: string;
    category: ActivityCategory;
    icon: string;
    description: string;
}

export const activities: Activity[] = [
    // DEPORTES
    { id: "a1", name: "Pádel", category: "deporte", icon: "🎾", description: "Deporte de raqueta en pareja" },
    { id: "a2", name: "Tenis", category: "deporte", icon: "🎾", description: "Deporte de raqueta individual o dobles" },
    { id: "a3", name: "Fútbol", category: "deporte", icon: "⚽", description: "Deporte de equipo con balón" },
    { id: "a4", name: "Baloncesto", category: "deporte", icon: "🏀", description: "Deporte de equipo con canasta" },
    { id: "a5", name: "Natación", category: "deporte", icon: "🏊", description: "Deporte acuático" },
    { id: "a6", name: "Running", category: "deporte", icon: "🏃", description: "Carrera a pie" },
    { id: "a7", name: "Ciclismo", category: "deporte", icon: "🚴", description: "Deporte en bicicleta" },
    { id: "a8", name: "Yoga", category: "deporte", icon: "🧘", description: "Práctica de posturas y meditación" },
    { id: "a9", name: "Voleibol", category: "deporte", icon: "🏐", description: "Deporte de equipo con red" },
    { id: "a10", name: "Boxeo", category: "deporte", icon: "🥊", description: "Deporte de combate" },
    { id: "a11", name: "Escalada", category: "deporte", icon: "🧗", description: "Escalada deportiva o boulder" },
    { id: "a12", name: "Golf", category: "deporte", icon: "⛳", description: "Deporte de precisión con palos" },

    // CLASES DIRIGIDAS
    { id: "c1", name: "Body Pump", category: "clase_dirigida", icon: "💪", description: "Entrenamiento con barra y pesas" },
    { id: "c2", name: "Body Combat", category: "clase_dirigida", icon: "🥊", description: "Cardio inspirado en artes marciales" },
    { id: "c3", name: "Body Balance", category: "clase_dirigida", icon: "🧘", description: "Yoga, Tai Chi y Pilates combinados" },
    { id: "c4", name: "Spinning", category: "clase_dirigida", icon: "🚴", description: "Ciclismo indoor en grupo" },
    { id: "c5", name: "Zumba", category: "clase_dirigida", icon: "💃", description: "Baile fitness con ritmos latinos" },
    { id: "c6", name: "Pilates", category: "clase_dirigida", icon: "🤸", description: "Fortalecimiento del core" },
    { id: "c7", name: "CrossFit", category: "clase_dirigida", icon: "🏋️", description: "Entrenamiento funcional de alta intensidad" },
    { id: "c8", name: "GAP", category: "clase_dirigida", icon: "🍑", description: "Glúteos, Abdominales y Piernas" },
    { id: "c9", name: "Step", category: "clase_dirigida", icon: "📦", description: "Cardio con plataforma elevada" },
    { id: "c10", name: "Aerobic", category: "clase_dirigida", icon: "🎵", description: "Ejercicio cardiovascular con música" },
    { id: "c11", name: "TRX", category: "clase_dirigida", icon: "🔗", description: "Entrenamiento en suspensión" },
    { id: "c12", name: "HIIT", category: "clase_dirigida", icon: "⚡", description: "Entrenamiento de intervalos de alta intensidad" },
];

export const activityCategoryLabels: Record<ActivityCategory, string> = {
    deporte: "Deportes",
    clase_dirigida: "Clases Dirigidas",
};
