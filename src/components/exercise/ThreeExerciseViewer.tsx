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
                    <defs>
                        <filter id="shadow-facet">
                            <feComponentTransfer>
                                <feFuncR type="linear" slope="0.75" intercept="0" />
                                <feFuncG type="linear" slope="0.75" intercept="0" />
                                <feFuncB type="linear" slope="0.75" intercept="0" />
                            </feComponentTransfer>
                        </filter>
                        <filter id="light-facet">
                            <feComponentTransfer>
                                <feFuncR type="linear" slope="1.1" intercept="0" />
                                <feFuncG type="linear" slope="1.1" intercept="0" />
                                <feFuncB type="linear" slope="1.1" intercept="0" />
                            </feComponentTransfer>
                        </filter>
                    </defs>

                    {view === 'front' ? (
                        <g id="front-view" stroke="none">
                            {/* Head (Faceted) */}
                            <path d="M100 20 L85 30 L85 55 L100 65 Z" fill={THEME.skin} className="transition-colors duration-300" /> {/* Left Face */}
                            <path d="M100 20 L115 30 L115 55 L100 65 Z" fill={THEME.skin} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} /> {/* Right Face */}

                            {/* Neck */}
                            <polygon points="92,63 100,63 100,75 88,75" fill={THEME.skin} />
                            <polygon points="100,63 108,63 112,75 100,75" fill={THEME.skin} filter={!minimal ? "url(#shadow-facet)" : undefined} />

                            {/* Delts (Faceted) */}
                            <polygon id="delts_front_left" points="112,75 135,80 142,95 130,105 115,100" fill={getColor('delts_front_left')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />
                            <polygon id="delts_front_right" points="88,75 65,80 58,95 70,105 85,100" fill={getColor('delts_front_right')} className="transition-colors duration-300" />

                            {/* Pecs (Split Left/Right) */}
                            <polygon id="pecs_right" points="85,100 100,100 100,120 90,120 80,95" fill={getColor('pecs')} className="transition-colors duration-300" />
                            <polygon id="pecs_left" points="100,100 115,100 120,95 110,120 100,120" fill={getColor('pecs')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />

                            {/* Obliques & Abs Connection - Simplified Grid */}
                            <g id="torso">
                                {/* Left Side (Lit) */}
                                <polygon id="obliques_right_side" points="80,95 90,120 90,150 82,145" fill={getColor('obliques')} className="transition-colors duration-300" />

                                {/* Center Abs (Lit) */}
                                <polygon points="90,120 100,120 100,135 90,135" fill={getColor('abs')} className="transition-colors duration-300" />
                                <polygon points="90,135 100,135 100,150 90,150" fill={getColor('abs')} className="transition-colors duration-300" />
                                <polygon points="90,150 100,150 100,165 92,165" fill={getColor('abs')} className="transition-colors duration-300" />

                                {/* Center Abs (Shadow) */}
                                <polygon points="100,120 110,120 110,135 100,135" fill={getColor('abs')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />
                                <polygon points="100,135 110,135 110,150 100,150" fill={getColor('abs')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />
                                <polygon points="100,150 108,165 100,165" fill={getColor('abs')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />

                                {/* Right Side (Shadow) */}
                                <polygon id="obliques_left_side" points="120,95 110,120 110,150 118,145" fill={getColor('obliques')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />
                            </g>

                            {/* Arms */}
                            {/* Left Arm (Viewer Right) -> Shadow */}
                            <polygon id="biceps_left" points="130,105 142,95 145,130 135,130" fill={getColor('biceps_left')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />
                            <polygon points="145,130 135,130 138,160 150,160" fill={THEME.skin} filter={!minimal ? "url(#shadow-facet)" : undefined} />

                            {/* Right Arm (Viewer Left) -> Lit */}
                            <polygon id="biceps_right" points="70,105 58,95 55,130 65,130" fill={getColor('biceps_right')} className="transition-colors duration-300" />
                            <polygon points="55,130 65,130 62,160 50,160" fill={THEME.skin} />

                            {/* Hips/Waist Connection */}
                            <polygon points="92,165 100,165 100,170 95,170" fill={THEME.outfit} filter="none" />
                            <polygon points="100,165 108,165 105,170 100,170" fill={THEME.outfit} filter={!minimal ? "url(#shadow-facet)" : undefined} />

                            {/* Legs */}
                            {/* Left Leg (Viewer Right) -> Shadow */}
                            <polygon id="quads_left" points="100,170 125,170 130,230 105,230" fill={getColor('quads_left')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />
                            <polygon points="105,230 130,230 128,240 107,240" fill={THEME.skin} opacity="0.8" filter={!minimal ? "url(#shadow-facet)" : undefined} /> {/* Knee */}
                            <polygon id="calves_left" points="107,240 128,240 125,300 108,300" fill={getColor('calves_left')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />

                            {/* Right Leg (Viewer Left) -> Lit */}
                            <polygon id="quads_right" points="100,170 75,170 70,230 95,230" fill={getColor('quads_right')} className="transition-colors duration-300" />
                            <polygon points="95,230 70,230 72,240 93,240" fill={THEME.skin} opacity="0.8" /> {/* Knee */}
                            <polygon id="calves_right" points="93,240 72,240 75,300 92,300" fill={getColor('calves_right')} className="transition-colors duration-300" />

                        </g>
                    ) : (
                        <g id="back-view" stroke="none">
                            {/* Head Back */}
                            <path d="M100 20 L85 30 L85 55 L100 65 Z" fill={THEME.skin} className="transition-colors duration-300" />
                            <path d="M100 20 L115 30 L115 55 L100 65 Z" fill={THEME.skin} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />

                            {/* Traps */}
                            <polygon id="traps_left" points="100,65 100,90 75,75 100,65" fill={getColor('traps')} className="transition-colors duration-300" />
                            <polygon id="traps_right" points="100,65 125,75 100,90" fill={getColor('traps')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />

                            {/* Lats */}
                            <polygon id="lats_right" points="125,75 140,90 125,125 100,130 100,90" fill={getColor('lats')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />
                            <polygon id="lats_left" points="75,75 60,90 75,125 100,130 100,90" fill={getColor('lats')} className="transition-colors duration-300" />

                            {/* Lower Back */}
                            <polygon id="lower_back_left" points="80,160 100,160 100,125 75,125" fill={getColor('lower_back')} className="transition-colors duration-300" />
                            <polygon id="lower_back_right" points="100,160 120,160 125,125 100,125" fill={getColor('lower_back')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />

                            {/* Triceps & Arms */}
                            <polygon id="triceps_left" points="140,84 150,90 150,130 138,130" fill={getColor('triceps_left')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />
                            <polygon points="138,130 150,130 148,135 140,135" fill={THEME.skin} filter={!minimal ? "url(#shadow-facet)" : undefined} /> {/* Elbow */}
                            <polygon points="148,135 140,135 142,160 155,160" fill={THEME.skin} filter={!minimal ? "url(#shadow-facet)" : undefined} /> {/* Forearm */}

                            <polygon id="triceps_right" points="60,84 50,90 50,130 62,130" fill={getColor('triceps_right')} className="transition-colors duration-300" />
                            <polygon points="62,130 50,130 52,135 60,135" fill={THEME.skin} /> {/* Elbow */}
                            <polygon points="52,135 60,135 58,160 45,160" fill={THEME.skin} /> {/* Forearm */}

                            {/* Glutes */}
                            <polygon id="glutes_left" points="80,160 100,160 100,200 75,190 70,170" fill={getColor('glutes')} className="transition-colors duration-300" />
                            <polygon id="glutes_right" points="120,160 100,160 100,200 125,190 130,170" fill={getColor('glutes')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />

                            {/* Hamstrings */}
                            <polygon id="hamstrings_left" points="100,200 125,190 130,240 105,240" fill={getColor('hamstrings_left')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />
                            <polygon id="hamstrings_right" points="100,200 75,190 70,240 95,240" fill={getColor('hamstrings_right')} className="transition-colors duration-300" />

                            {/* Calves Back */}
                            <polygon id="calves_back_left" points="105,240 130,240 125,310 108,310" fill={getColor('calves')} className="transition-colors duration-300" filter={!minimal ? "url(#shadow-facet)" : undefined} />
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
