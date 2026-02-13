import { useState } from 'react';

interface ThreeExerciseViewerProps {
    modelUrl?: string;
    muscleHighlight?: string;
    autoRotate?: boolean;
    minimal?: boolean; // New prop for thumbnail mode
}

export const ThreeExerciseViewer = ({ muscleHighlight, minimal = false }: ThreeExerciseViewerProps) => {
    const initialView = ['espalda', 'tríceps', 'glúteos', 'trapecio', 'lumbares', 'dorsales'].some(m => (muscleHighlight?.toLowerCase() || '').includes(m)) ? 'back' : 'front';
    const [view, setView] = useState<'front' | 'back'>(initialView);

    // Normalize highlight string
    const normalizedHighlight = muscleHighlight?.toLowerCase() || '';

    // Map muscle groups to image filenames
    // Ideally these would be imported, but using paths for now to allow dynamic loading
    const getMuscleImage = () => {
        if (!muscleHighlight) return view === 'front' ? '/src/assets/avatar/body_front_base.svg' : '/src/assets/avatar/body_back_base.svg';

        // Specific mappings (Expand this list as images are generated)
        if (view === 'front') {
            if (['abs', 'abdominales', 'core'].includes(normalizedHighlight)) return '/src/assets/avatar/body_front_abs.svg';
            // Fallback for front if specific muscle image not ready -> Base
            return '/src/assets/avatar/body_front_base.svg';
        } else {
            // Fallback for back -> Base
            return '/src/assets/avatar/body_back_base.svg';
        }
    };

    const imageSrc = getMuscleImage();

    return (
        <div className={`w-full h-full ${!minimal ? 'min-h-[300px] rounded-2xl p-4 shadow-sm border border-gray-100' : ''} bg-white overflow-hidden relative flex flex-col items-center justify-center`}>

            {/* Image Viewer */}
            <div className={`relative ${minimal ? 'h-full w-auto aspect-[1/2]' : 'w-full max-w-[200px] aspect-[1/2]'} flex items-center justify-center`}>

                {/* Toggle View Button */}
                {!minimal && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setView(v => v === 'front' ? 'back' : 'front') }}
                        className="absolute top-0 right-0 p-2 bg-secondary/50 rounded-full hover:bg-secondary transition-colors z-10"
                        title="Girar vista"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>
                    </button>
                )}

                {/* Main Image */}
                <img
                    src={imageSrc}
                    alt={`Mannequin ${view} - ${muscleHighlight || 'Base'}`}
                    className={`w-full h-full object-contain transition-opacity duration-300 ${!minimal ? 'drop-shadow-lg' : ''}`}
                    onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.src = 'https://placehold.co/200x400?text=Model+Not+Found';
                    }}
                />
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
