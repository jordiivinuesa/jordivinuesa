import { useEffect, useState } from 'react';

interface ThreeExerciseViewerProps {
    modelUrl?: string; // Optional path to GLB/GLTF
    muscleHighlight?: string; // Muscle group to highlight
    autoRotate?: boolean;
}

// Fallback component since dependencies (three, @react-three/fiber) could not be installed.
// Once installed, we can revert to the real 3D implementation.
export const ThreeExerciseViewer = ({ muscleHighlight }: ThreeExerciseViewerProps) => {
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(prev => (prev + 1) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full min-h-[300px] bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden relative flex flex-col items-center justify-center">

            <div className="relative w-48 h-64 perspective-1000">
                {/* Simulated Avatar Container */}
                <div
                    className="w-full h-full relative transition-transform duration-100 preserve-3d"
                    style={{ transform: `rotateY(${rotation}deg)` }}
                >
                    {/* Simple Geometric Figure Construction with CSS */}
                    {/* Head */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 z-10"></div>

                    {/* Torso */}
                    <div className={`absolute top-14 left-1/2 -translate-x-1/2 w-16 h-24 bg-white rounded-2xl shadow-md border border-gray-100 ${['abdominales', 'chest', 'pecho', 'espalda', 'back'].includes(muscleHighlight?.toLowerCase() || '') ? 'bg-red-500/20 border-red-500 shadow-red-200' : ''
                        }`}>
                        {['abdominales', 'chest', 'pecho', 'espalda', 'back'].includes(muscleHighlight?.toLowerCase() || '') && (
                            <div className="absolute inset-0 bg-red-500/30 blur-xl rounded-full animate-pulse"></div>
                        )}
                    </div>

                    {/* Arms */}
                    <div className={`absolute top-14 -left-4 w-4 h-24 bg-white rounded-full shadow-sm ${['biceps', 'bíceps', 'triceps', 'tríceps', 'hombros', 'shoulders'].includes(muscleHighlight?.toLowerCase() || '') ? 'bg-red-500/20 border border-red-500' : ''
                        }`}></div>
                    <div className={`absolute top-14 -right-4 w-4 h-24 bg-white rounded-full shadow-sm ${['biceps', 'bíceps', 'triceps', 'tríceps', 'hombros', 'shoulders'].includes(muscleHighlight?.toLowerCase() || '') ? 'bg-red-500/20 border border-red-500' : ''
                        }`}></div>

                    {/* Legs */}
                    <div className={`absolute top-40 left-2 w-5 h-24 bg-white rounded-full shadow-sm ${['legs', 'piernas', 'gluteos', 'glúteos', 'calves'].includes(muscleHighlight?.toLowerCase() || '') ? 'bg-red-500/20 border border-red-500' : ''
                        }`}></div>
                    <div className={`absolute top-40 right-2 w-5 h-24 bg-white rounded-full shadow-sm ${['legs', 'piernas', 'gluteos', 'glúteos', 'calves'].includes(muscleHighlight?.toLowerCase() || '') ? 'bg-red-500/20 border border-red-500' : ''
                        }`}></div>
                </div>
            </div>

            <div className="absolute bottom-4 text-center px-4">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Modo Visualización Simplificado</p>
                <p className="text-[10px] text-muted-foreground/70">
                    Las librerias 3D no están instaladas. <br />
                    Músculo objetivo: <span className="text-primary font-bold uppercase">{muscleHighlight || 'General'}</span>
                </p>
            </div>

            {/* Grid Floor */}
            <div className="absolute bottom-0 w-full h-1/3 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
        </div>
    );
};

export default ThreeExerciseViewer;
