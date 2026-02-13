import { useState } from 'react';
import { Dumbbell, User, Box, Cable, Activity } from 'lucide-react';

// Import assets to ensure they work in production builds
import bodyFrontBase from '../../assets/avatar/body_front_base.svg';
import bodyBackBase from '../../assets/avatar/body_back_base.svg';
import bodyFrontAbs from '../../assets/avatar/body_front_abs.svg';

interface ThreeExerciseViewerProps {
    modelUrl?: string; // If provided, uses this specific image (for specific exercises)
    muscleHighlight?: string;
    autoRotate?: boolean; // Keep for compatibility, though unused in static mode
    minimal?: boolean;
    equipmentType?: string;
}

export const ThreeExerciseViewer = ({ muscleHighlight, minimal = false, equipmentType, modelUrl }: ThreeExerciseViewerProps) => {
    const initialView = ['espalda', 'tríceps', 'glúteos', 'trapecio', 'lumbares', 'dorsales'].some(m => (muscleHighlight?.toLowerCase() || '').includes(m)) ? 'back' : 'front';
    const [view, setView] = useState<'front' | 'back'>(initialView);

    // Normalize highlight string
    const normalizedHighlight = muscleHighlight?.toLowerCase() || '';

    // Map muscle groups to image filenames
    // Using imports allows Vite to handle paths correctly in production
    const getMuscleImage = () => {
        if (!muscleHighlight) return view === 'front' ? bodyFrontBase : bodyBackBase;

        // Specific mappings (Expand this list as images are generated)
        if (view === 'front') {
            if (['abs', 'abdominales', 'core'].includes(normalizedHighlight)) return bodyFrontAbs;
            // Fallback for front if specific muscle image not ready -> Base
            return bodyFrontBase;
        } else {
            // Fallback for back -> Base
            return bodyBackBase;
        }
    };

    const imageSrc = modelUrl || getMuscleImage();

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


            {/* Equipment Icon Overlay */}
            {minimal && equipmentType && (
                <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg border border-gray-100 shadow-sm z-20">
                    {getEquipmentIcon(equipmentType)}
                </div>
            )}

            {!minimal && (
                <div className="absolute bottom-4 text-center px-4">
                    <h3 className="text-xl font-display font-bold text-gray-800 capitalize mb-1">
                        {muscleHighlight || 'Cuerpo Completo'}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        {equipmentType && <div className="scale-75">{getEquipmentIcon(equipmentType)}</div>}
                        <p className="text-[10px] uppercase tracking-wider">
                            {equipmentType || 'Zona Objetivo'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const getEquipmentIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('peso') || t.includes('corporal')) return <User className="w-4 h-4 text-primary" />;
    if (t.includes('mancuerna') || t.includes('barra')) return <Dumbbell className="w-4 h-4 text-primary" />;
    if (t.includes('máquina')) return <Box className="w-4 h-4 text-primary" />;
    if (t.includes('cable') || t.includes('polea')) return <Cable className="w-4 h-4 text-primary" />;
    return <Activity className="w-4 h-4 text-primary" />;
};

export default ThreeExerciseViewer;
