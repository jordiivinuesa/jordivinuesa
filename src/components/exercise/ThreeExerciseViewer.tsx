import { useState } from 'react';

interface ThreeExerciseViewerProps {
    modelUrl?: string;
    muscleHighlight?: string;
    autoRotate?: boolean;
    minimal?: boolean; // New prop for thumbnail mode
}

// Map muscle identifiers to SVG internal IDs
const MUSCLE_MAP: Record<string, string[]> = {
    // Front
    'chest': ['pecs'],
    'pecho': ['pecs'],
    'abs': ['abs', 'obliques'],
    'abdominales': ['abs', 'obliques'],
    'biceps': ['biceps_left', 'biceps_right'],
    'bíceps': ['biceps_left', 'biceps_right'],
    'shoulders': ['delts_front_left', 'delts_front_right'],
    'hombros': ['delts_front_left', 'delts_front_right'],
    'quads': ['quads_left', 'quads_right'],
    'legs': ['quads_left', 'quads_right', 'calves_left', 'calves_right'],
    'piernas': ['quads_left', 'quads_right', 'calves_left', 'calves_right'],

    // Back
    'back': ['traps', 'lats', 'lower_back'],
    'espalda': ['traps', 'lats', 'lower_back'],
    'lats': ['lats'],
    'traps': ['traps'],
    'trapecio': ['traps'],
    'triceps': ['triceps_left', 'triceps_right'],
    'tríceps': ['triceps_left', 'triceps_right'],
    'glutes': ['glutes'],
    'gluteos': ['glutes'],
    'glúteos': ['glutes'],
    'hamstrings': ['hamstrings_left', 'hamstrings_right'],
    'calves': ['calves_back_left', 'calves_back_right']
};

// Aesthetic Configuration
const THEME = {
    skin: '#d1d5db',   // gray-300 (Clay skin)
    outfit: '#0d9488', // teal-600 (Primary outfit)
    highlight: '#ef4444', // red-500 (dampened red for clay look? no, user said vibrant)
    bg: '#ffffff'
};

const OUTFIT_PARTS = [
    'pecs', 'abs', 'obliques', 'traps', 'lats', 'lower_back', // Tank top
    'glutes', 'quads_left', 'quads_right', 'hamstrings_left', 'hamstrings_right' // Shorts
];

export const ThreeExerciseViewer = ({ muscleHighlight, minimal = false }: ThreeExerciseViewerProps) => {
    const [view, setView] = useState<'front' | 'back'>('front');

    // Determine which parts to highlight
    const normalizedHighlight = muscleHighlight?.toLowerCase() || '';
    const activeParts = MUSCLE_MAP[normalizedHighlight] || [];

    const getColor = (partId: string) => {
        if (activeParts.includes(partId)) return THEME.highlight;
        if (OUTFIT_PARTS.includes(partId)) return THEME.outfit;
        return THEME.skin;
    };

    return (
        <div className={`w-full h-full ${!minimal ? 'min-h-[300px] rounded-2xl p-4 shadow-sm border border-gray-100' : ''} bg-white overflow-hidden relative flex flex-col items-center justify-center`}>

            {/* Mannequin SVG */}
            <div className={`relative ${minimal ? 'h-full w-auto aspect-[1/2]' : 'w-full max-w-[200px] aspect-[1/2]'} flex items-center justify-center`}>

                {/* Toggle View Button */}
                {!minimal && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setView(v => v === 'front' ? 'back' : 'front') }}
                        className="absolute top-0 right-0 p-2 bg-secondary/50 rounded-full hover:bg-secondary transition-colors z-10"
                        title="Girar vista"
                    >
                        {/* Simple Rotate Icon SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>
                    </button>
                )}

                <svg viewBox="0 0 200 400" className="w-full h-full" style={!minimal ? { filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.1))' } : undefined} preserveAspectRatio="xMidYMid meet">
                    {view === 'front' ? (
                        <g id="front-view" stroke="white" strokeWidth="1" strokeLinejoin="round">
                            {/* Head (Hexagon) */}
                            <polygon points="100,20 115,30 115,55 100,65 85,55 85,30" fill={THEME.skin} />

                            {/* Neck (Trapezoid) */}
                            <polygon points="92,63 108,63 112,75 88,75" fill={THEME.skin} />

                            {/* Delts (Pentagons) */}
                            <polygon id="delts_front_left" points="112,75 135,78 142,95 130,105 115,100" fill={getColor('delts_front_left')} className="transition-colors duration-300" />
                            <polygon id="delts_front_right" points="88,75 65,78 58,95 70,105 85,100" fill={getColor('delts_front_right')} className="transition-colors duration-300" />

                            {/* Pecs (Hexagons) */}
                            <polygon id="pecs" points="85,100 115,100 120,90 115,115 100,120 85,115 80,90" fill={getColor('pecs')} className="transition-colors duration-300" />

                            {/* Abs (Grid of Rectangles) */}
                            <g id="abs">
                                <polygon points="88,120 112,120 110,135 90,135" fill={getColor('abs')} className="transition-colors duration-300" /> {/* Upper Abs */}
                                <polygon points="90,135 110,135 108,150 92,150" fill={getColor('abs')} className="transition-colors duration-300" /> {/* Middle Abs */}
                                <polygon points="92,150 108,150 105,165 95,165" fill={getColor('abs')} className="transition-colors duration-300" /> {/* Lower Abs */}
                            </g>

                            {/* Obliques (Triangles/Trapezoids) */}
                            <polygon id="obliques" points="88,120 80,125 82,155 92,150" fill={getColor('obliques')} className="transition-colors duration-300" />
                            <polygon points="112,120 120,125 118,155 108,150" fill={getColor('obliques')} className="transition-colors duration-300" />

                            {/* Biceps/Upper Arm (Polygon) */}
                            <polygon id="biceps_left" points="130,105 142,95 145,130 135,130" fill={getColor('biceps_left')} className="transition-colors duration-300" />
                            <polygon id="biceps_right" points="70,105 58,95 55,130 65,130" fill={getColor('biceps_right')} className="transition-colors duration-300" />

                            {/* Forearms (Polygon) */}
                            <polygon points="145,130 135,130 138,160 150,160" fill={THEME.skin} />
                            <polygon points="55,130 65,130 62,160 50,160" fill={THEME.skin} />

                            {/* Hips/Waist (Inverted Trapezoid) */}
                            {/* Using Quads/Glutes color for shorts continuity, or skin if low rise? Let's use outfit color for waist band if needed, but abs cover it. */}

                            {/* Quads (Large Polygons) */}
                            <polygon id="quads_left" points="100,165 125,165 130,230 105,230" fill={getColor('quads_left')} className="transition-colors duration-300" />
                            <polygon id="quads_right" points="100,165 75,165 70,230 95,230" fill={getColor('quads_right')} className="transition-colors duration-300" />

                            {/* Knees (Small Diamonds) - Optional connecting detail */}
                            <polygon points="105,230 130,230 128,240 107,240" fill={THEME.skin} opacity="0.8" />
                            <polygon points="95,230 70,230 72,240 93,240" fill={THEME.skin} opacity="0.8" />

                            {/* Calves (Polygons) */}
                            <polygon id="calves_left" points="107,240 128,240 125,300 108,300" fill={getColor('calves_left')} className="transition-colors duration-300" />
                            <polygon id="calves_right" points="93,240 72,240 75,300 92,300" fill={getColor('calves_right')} className="transition-colors duration-300" />
                        </g>
                    ) : (
                        <g id="back-view" stroke="white" strokeWidth="1" strokeLinejoin="round">
                            {/* Head Back (Hexagon) */}
                            <polygon points="100,20 115,30 115,55 100,65 85,55 85,30" fill={THEME.skin} />

                            {/* Traps (Diamond/Kite) */}
                            <polygon id="traps" points="100,65 125,75 100,90 75,75" fill={getColor('traps')} className="transition-colors duration-300" />

                            {/* Lats (Wing shapes) */}
                            <polygon id="lats" points="125,75 140,90 125,125 100,130 100,90" fill={getColor('lats')} className="transition-colors duration-300" />
                            <polygon points="75,75 60,90 75,125 100,130 100,90" fill={getColor('lats')} className="transition-colors duration-300" /> {/* Mirror Lat manually if needed distinct ID, usually same */}

                            {/* Lower Back (Trapezoid) */}
                            <polygon id="lower_back" points="75,125 125,125 120,160 80,160" fill={getColor('lower_back')} className="transition-colors duration-300" />

                            {/* Triceps (Polygon) */}
                            <polygon id="triceps_left" points="140,84 150,90 150,130 138,130" fill={getColor('triceps_left')} className="transition-colors duration-300" />
                            <polygon id="triceps_right" points="60,84 50,90 50,130 62,130" fill={getColor('triceps_right')} className="transition-colors duration-300" />

                            {/* Elbows */}
                            <polygon points="138,130 150,130 148,135 140,135" fill={THEME.skin} />
                            <polygon points="62,130 50,130 52,135 60,135" fill={THEME.skin} />

                            {/* Forearms Back */}
                            <polygon points="148,135 140,135 142,160 155,160" fill={THEME.skin} />
                            <polygon points="52,135 60,135 58,160 45,160" fill={THEME.skin} />

                            {/* Glutes (Two Pentagons) */}
                            <polygon id="glutes" points="80,160 100,160 100,200 75,190 70,170" fill={getColor('glutes')} className="transition-colors duration-300" />
                            <polygon points="120,160 100,160 100,200 125,190 130,170" fill={getColor('glutes')} className="transition-colors duration-300" />

                            {/* Hamstrings (Polygons) */}
                            <polygon id="hamstrings_left" points="100,200 125,190 130,240 105,240" fill={getColor('hamstrings_left')} className="transition-colors duration-300" />
                            <polygon id="hamstrings_right" points="100,200 75,190 70,240 95,240" fill={getColor('hamstrings_right')} className="transition-colors duration-300" />

                            {/* Calves Back (Diamond-like) */}
                            <polygon id="calves_back_left" points="105,240 130,240 125,310 108,310" fill={getColor('calves')} className="transition-colors duration-300" />
                            <polygon id="calves_back_right" points="95,240 70,240 75,310 92,310" fill={getColor('calves')} className="transition-colors duration-300" />
                        </g>
                    )}
                </svg>
            </div>

            {!minimal && (
                <div className="absolute bottom-4 text-center px-4">
                    <h3 className="text-xl font-display font-bold text-gray-800 capitalize mb-1">
                        {muscleHighlight || 'Cuerpo Completo'}
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Zona Objetivo
                    </p>
                </div>
            )}
        </div>
    );
};

export default ThreeExerciseViewer;
