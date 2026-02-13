import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

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
        <div className={`w-full h-full ${!minimal ? 'min-h-[300px] rounded-2xl p-4' : ''} bg-white overflow-hidden relative flex flex-col items-center justify-center`}>

            {/* Mannequin SVG */}
            <div className={`relative w-full ${minimal ? 'max-w-full' : 'max-w-[200px]'} aspect-[1/2] animate-in fade-in zoom-in duration-500`}>

                {/* Toggle View Button */}
                {!minimal && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setView(v => v === 'front' ? 'back' : 'front') }}
                        className="absolute top-0 right-0 p-2 bg-secondary/50 rounded-full hover:bg-secondary transition-colors z-10"
                        title="Girar vista"
                    >
                        <RotateCcw className="w-4 h-4 text-primary" />
                    </button>
                )}

                <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-xl" style={!minimal ? { filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.1))' } : undefined}>
                    {view === 'front' ? (
                        <g id="front-view">
                            {/* Head */}
                            <path d="M100 20 C100 20 115 20 115 35 V50 C115 60 100 65 100 65 C100 65 85 60 85 50 V35 C85 20 100 20 100 20" fill={THEME.skin} />

                            {/* Neck */}
                            <path d="M92 63 L108 63 L110 75 L90 75 Z" fill={THEME.skin} />

                            {/* Delts */}
                            <path id="delts_front_left" d="M110 75 L135 78 L140 95 L128 100 L115 85 Z" fill={getColor('delts_front_left')} className="transition-colors duration-500" />
                            <path id="delts_front_right" d="M90 75 L65 78 L60 95 L72 100 L85 85 Z" fill={getColor('delts_front_right')} className="transition-colors duration-500" />

                            {/* Pecs */}
                            <path id="pecs" d="M90 85 L110 85 L115 105 C115 115 100 115 100 115 C100 115 85 115 85 105 Z" fill={getColor('pecs')} className="transition-colors duration-500" />

                            {/* Abs */}
                            <path id="abs" d="M88 115 L112 115 L110 160 L90 160 Z" fill={getColor('abs')} className="transition-colors duration-500" />
                            <path id="obliques" d="M88 115 L78 120 L80 155 L90 160 Z M112 115 L122 120 L120 155 L110 160 Z" fill={getColor('obliques')} className="transition-colors duration-500" />

                            {/* Biceps/Arms */}
                            <path id="biceps_left" d="M128 100 L140 95 L145 130 L132 130 Z" fill={getColor('biceps_left')} className="transition-colors duration-500" />
                            <path id="biceps_right" d="M72 100 L60 95 L55 130 L68 130 Z" fill={getColor('biceps_right')} className="transition-colors duration-500" />

                            {/* Forearms */}
                            <path d="M145 130 L132 130 L135 160 L148 160 Z" fill={THEME.skin} />
                            <path d="M55 130 L68 130 L65 160 L52 160 Z" fill={THEME.skin} />

                            {/* Quads */}
                            <path id="quads_left" d="M100 160 L125 160 L130 230 L105 230 Z" fill={getColor('quads_left')} className="transition-colors duration-500" />
                            <path id="quads_right" d="M100 160 L75 160 L70 230 L95 230 Z" fill={getColor('quads_right')} className="transition-colors duration-500" />

                            {/* Calves */}
                            <path id="calves_left" d="M105 230 L130 230 L125 300 L108 300 Z" fill={getColor('calves_left')} className="transition-colors duration-500" />
                            <path id="calves_right" d="M95 230 L70 230 L75 300 L92 300 Z" fill={getColor('calves_right')} className="transition-colors duration-500" />
                        </g>
                    ) : (
                        <g id="back-view">
                            {/* Head Back */}
                            <path d="M100 20 C100 20 115 20 115 35 V50 C115 60 100 65 100 65 C100 65 85 60 85 50 V35 C85 20 100 20 100 20" fill={THEME.skin} />

                            {/* Traps */}
                            <path id="traps" d="M90 65 L110 65 L130 80 L100 95 L70 80 Z" fill={getColor('traps')} className="transition-colors duration-500" />

                            {/* Lats/Back */}
                            <path id="lats" d="M70 80 L130 80 L125 125 L100 135 L75 125 Z" fill={getColor('lats')} className="transition-colors duration-500" />
                            <path id="lower_back" d="M75 125 L125 125 L120 160 L80 160 Z" fill={getColor('lower_back')} className="transition-colors duration-500" />

                            {/* Triceps */}
                            <path id="triceps_left" d="M130 80 L145 85 L145 130 L132 130 Z" fill={getColor('triceps_left')} className="transition-colors duration-500" />
                            <path id="triceps_right" d="M70 80 L55 85 L55 130 L68 130 Z" fill={getColor('triceps_right')} className="transition-colors duration-500" />

                            {/* Glutes */}
                            <path id="glutes" d="M80 160 L120 160 L125 190 L100 200 L75 190 Z" fill={getColor('glutes')} className="transition-colors duration-500" />

                            {/* Hamstrings */}
                            <path id="hamstrings_left" d="M100 200 L125 190 L130 240 L105 240 Z" fill={getColor('hamstrings_left')} className="transition-colors duration-500" />
                            <path id="hamstrings_right" d="M100 200 L75 190 L70 240 L95 240 Z" fill={getColor('hamstrings_right')} className="transition-colors duration-500" />

                            {/* Calves Back */}
                            <path id="calves_back_left" d="M105 240 L130 240 L125 310 L108 310 Z" fill={getColor('calves_back_left')} className="transition-colors duration-500" />
                            <path id="calves_back_right" d="M95 240 L70 240 L75 310 L92 310 Z" fill={getColor('calves_back_right')} className="transition-colors duration-500" />
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
