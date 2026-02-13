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
    'shoulders': ['delts_front_left', 'delts_front_right', 'delts_back_left', 'delts_back_right'],
    'hombros': ['delts_front_left', 'delts_front_right', 'delts_back_left', 'delts_back_right'],
    'quads': ['quads_left', 'quads_right'],
    'legs': ['quads_left', 'quads_right', 'calves_left', 'calves_right', 'hamstrings_left', 'hamstrings_right', 'glutes', 'calves'],
    'piernas': ['quads_left', 'quads_right', 'calves_left', 'calves_right', 'hamstrings_left', 'hamstrings_right', 'glutes', 'calves'],

    // Back
    'back': ['traps', 'lats', 'lower_back', 'delts_back_left', 'delts_back_right'],
    'espalda': ['traps', 'lats', 'lower_back', 'delts_back_left', 'delts_back_right'],
    'lats': ['lats'],
    'traps': ['traps'],
    'trapecio': ['traps'],
    'triceps': ['triceps_left', 'triceps_right'],
    'tríceps': ['triceps_left', 'triceps_right'],
    'glutes': ['glutes'],
    'gluteos': ['glutes'],
    'glúteos': ['glutes'],
    'hamstrings': ['hamstrings_left', 'hamstrings_right'],
    'calves': ['calves', 'calves_left', 'calves_right']
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
                        <g id="front-mesh" stroke="none" strokeWidth="0">
                            {/* --- HEAD & NECK --- */}
                            <path d="M100 20 L88 35 L88 55 L100 65 Z" fill={THEME.skin} className="transition-colors duration-300" /> {/* Face Left */}
                            <path d="M100 20 L112 35 L112 55 L100 65 Z" fill={THEME.skin} fillOpacity="0.8" className="transition-colors duration-300" /> {/* Face Right (Shadow) */}
                            <polygon points="90,62 100,65 100,75 85,75" fill={THEME.skin} fillOpacity="0.9" /> {/* Neck Left */}
                            <polygon points="100,65 110,62 115,75 100,75" fill={THEME.skin} fillOpacity="0.7" /> {/* Neck Right */}

                            {/* --- TORSO (Vest) --- */}
                            {/* Traps (Vest Straps) */}
                            <polygon id="traps_left" points="85,75 100,75 100,85 75,80" fill={getColor('traps')} className="transition-colors duration-300" />
                            <polygon id="traps_right" points="100,75 115,75 125,80 100,85" fill={getColor('traps')} fillOpacity="0.8" className="transition-colors duration-300" />

                            {/* Upper Chest (Pecs Top) */}
                            <polygon id="chest_upper_left" points="75,80 100,85 100,105 70,105 68,95" fill={getColor('pecs')} className="transition-colors duration-300" />
                            <polygon id="chest_upper_right" points="100,85 125,80 132,95 130,105 100,105" fill={getColor('pecs')} fillOpacity="0.8" className="transition-colors duration-300" />

                            {/* Lower Chest (Pecs Bottom) */}
                            <polygon id="pecs_lower_left" points="70,105 100,105 100,125 80,120" fill={getColor('pecs')} fillOpacity="0.9" className="transition-colors duration-300" />
                            <polygon id="pecs_lower_right" points="100,105 130,105 120,120 100,125" fill={getColor('pecs')} fillOpacity="0.7" className="transition-colors duration-300" />

                            {/* Abs (Six Pack Grid) */}
                            {/* Row 1 */}
                            <polygon points="80,120 100,125 100,140 82,138" fill={getColor('abs')} className="transition-colors duration-300" />
                            <polygon points="100,125 120,120 118,138 100,140" fill={getColor('abs')} fillOpacity="0.8" className="transition-colors duration-300" />
                            {/* Row 2 */}
                            <polygon points="82,138 100,140 100,155 85,152" fill={getColor('abs')} fillOpacity="0.9" className="transition-colors duration-300" />
                            <polygon points="100,140 118,138 115,152 100,155" fill={getColor('abs')} fillOpacity="0.7" className="transition-colors duration-300" />
                            {/* Row 3 (Lower Abs) */}
                            <polygon points="85,152 100,155 100,170 88,165" fill={getColor('abs')} className="transition-colors duration-300" />
                            <polygon points="100,155 115,152 112,165 100,170" fill={getColor('abs')} fillOpacity="0.8" className="transition-colors duration-300" />

                            {/* Obliques (Sides of Vest) */}
                            <polygon id="obliques_left" points="68,95 70,105 80,120 82,138 85,152 88,165 92,175 65,160" fill={getColor('obliques')} fillOpacity="0.9" className="transition-colors duration-300" />
                            <polygon id="obliques_right" points="132,95 130,105 120,120 118,138 115,152 112,165 108,175 135,160" fill={getColor('obliques')} fillOpacity="0.7" className="transition-colors duration-300" />

                            {/* --- ARMS --- */}
                            {/* Shoulders (Delts) */}
                            <polygon id="delts_front_left" points="68,95 55,100 58,125 70,120 75,80" fill={getColor('delts_front_left')} className="transition-colors duration-300" />
                            <polygon id="delts_front_right" points="132,95 145,100 142,125 130,120 125,80" fill={getColor('delts_front_right')} fillOpacity="0.8" className="transition-colors duration-300" />

                            {/* Biceps/Triceps */}
                            <polygon id="biceps_left" points="58,125 55,155 68,155 70,120" fill={getColor('biceps_left')} className="transition-colors duration-300" />
                            <polygon id="biceps_right" points="142,125 145,155 132,155 130,120" fill={getColor('biceps_right')} fillOpacity="0.8" className="transition-colors duration-300" />

                            {/* Forearms */}
                            <polygon points="55,155 50,190 65,190 68,155" fill={THEME.skin} />
                            <polygon points="145,155 150,190 135,190 132,155" fill={THEME.skin} fillOpacity="0.8" />


                            {/* --- LOWER BODY (Shorts & Legs) --- */}
                            {/* Hips/Groin (Connection) */}
                            <polygon points="92,175 100,170 108,175 100,185" fill={THEME.outfit} /> {/* Center Diamond */}

                            {/* Quads (Shorts) */}
                            <polygon id="quads_left" points="92,175 65,160 62,210 95,210 100,185" fill={getColor('quads_left')} className="transition-colors duration-300" />
                            <polygon id="quads_right" points="108,175 135,160 138,210 105,210 100,185" fill={getColor('quads_right')} fillOpacity="0.8" className="transition-colors duration-300" />

                            {/* Legs (Skin) */}
                            {/* Knees */}
                            <polygon points="62,210 95,210 92,230 65,230" fill={THEME.skin} fillOpacity="0.9" />
                            <polygon points="138,210 105,210 108,230 135,230" fill={THEME.skin} fillOpacity="0.7" />

                            {/* Calves */}
                            <polygon id="calves_left" points="65,230 92,230 90,290 68,290" fill={getColor('calves_left')} className="transition-colors duration-300" />
                            <polygon id="calves_right" points="135,230 108,230 110,290 132,290" fill={getColor('calves_right')} fillOpacity="0.8" className="transition-colors duration-300" />

                            {/* Feet */}
                            <polygon points="68,290 90,290 95,305 65,305" fill={THEME.skin} />
                            <polygon points="132,290 110,290 105,305 135,305" fill={THEME.skin} fillOpacity="0.8" />
                        </g>
                    ) : (
                        <g id="back-mesh" stroke="none" strokeWidth="0">
                            {/* Head Back */}
                            <path d="M100 20 L88 35 L88 55 L100 65 Z" fill={THEME.skin} className="transition-colors duration-300" />
                            <path d="M100 20 L112 35 L112 55 L100 65 Z" fill={THEME.skin} fillOpacity="0.8" className="transition-colors duration-300" />

                            {/* Traps Back */}
                            <polygon id="traps_back_left" points="85,75 100,75 100,90 75,80" fill={getColor('traps')} className="transition-colors duration-300" />
                            <polygon id="traps_back_right" points="100,75 115,75 125,80 100,90" fill={getColor('traps')} fillOpacity="0.8" className="transition-colors duration-300" />

                            {/* Lats / Back */}
                            <polygon id="lats_left" points="75,80 100,90 100,130 80,120 70,105" fill={getColor('lats')} className="transition-colors duration-300" />
                            <polygon id="lats_right" points="125,80 100,90 100,130 120,120 130,105" fill={getColor('lats')} fillOpacity="0.8" className="transition-colors duration-300" />

                            {/* Lower Back */}
                            <polygon id="lower_back_left" points="80,120 100,130 100,160 85,160" fill={getColor('lower_back')} className="transition-colors duration-300" />
                            <polygon id="lower_back_right" points="120,120 100,130 100,160 115,160" fill={getColor('lower_back')} fillOpacity="0.8" className="transition-colors duration-300" />

                            {/* Shoulders Back */}
                            <polygon id="delts_back_left" points="75,80 70,120 58,125 55,100" fill={getColor('delts_back_left')} className="transition-colors duration-300" />
                            <polygon id="delts_back_right" points="125,80 130,120 142,125 145,100" fill={getColor('delts_back_right')} fillOpacity="0.8" className="transition-colors duration-300" />

                            {/* Triceps */}
                            <polygon id="triceps_left" points="70,120 68,155 55,155 58,125" fill={getColor('triceps_left')} className="transition-colors duration-300" />
                            <polygon id="triceps_right" points="130,120 132,155 145,155 142,125" fill={getColor('triceps_right')} fillOpacity="0.8" className="transition-colors duration-300" />

                            {/* Forearms Back */}
                            <polygon points="68,155 65,190 50,190 55,155" fill={THEME.skin} />
                            <polygon points="132,155 135,190 150,190 145,155" fill={THEME.skin} fillOpacity="0.8" />


                            {/* Glutes (Shorts) */}
                            <polygon id="glutes_left" points="85,160 100,160 100,185 95,210 62,210 65,160" fill={getColor('glutes')} className="transition-colors duration-300" />
                            <polygon id="glutes_right" points="115,160 100,160 100,185 105,210 138,210 135,160" fill={getColor('glutes')} fillOpacity="0.8" className="transition-colors duration-300" />

                            {/* Legs Back (Skin) */}
                            {/* Knees Back */}
                            <polygon points="62,210 95,210 92,230 65,230" fill={THEME.skin} fillOpacity="0.9" />
                            <polygon points="138,210 105,210 108,230 135,230" fill={THEME.skin} fillOpacity="0.7" />

                            {/* Calves Back */}
                            <polygon id="calves_back_left" points="65,230 92,230 90,290 68,290" fill={getColor('calves')} className="transition-colors duration-300" />
                            <polygon id="calves_back_right" points="135,230 108,230 110,290 132,290" fill={getColor('calves')} fillOpacity="0.8" className="transition-colors duration-300" />

                            {/* Feet Back */}
                            <polygon points="68,290 90,290 95,305 65,305" fill={THEME.skin} />
                            <polygon points="132,290 110,290 105,305 135,305" fill={THEME.skin} fillOpacity="0.8" />
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
