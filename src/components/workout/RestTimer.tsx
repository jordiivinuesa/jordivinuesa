import { useEffect } from 'react';
import { Timer, X, Plus, Minus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';

export function RestTimer() {
    const restTimer = useAppStore((state) => state.restTimer);
    const restTimerSound = useAppStore((state) => state.restTimerSound);
    const tickRestTimer = useAppStore((state) => state.tickRestTimer);
    const skipRestTimer = useAppStore((state) => state.skipRestTimer);
    const addRestTime = useAppStore((state) => state.addRestTime);

    // Countdown interval
    useEffect(() => {
        if (!restTimer || !restTimer.isActive) return;

        const interval = setInterval(() => {
            tickRestTimer();
        }, 1000);

        return () => clearInterval(interval);
    }, [restTimer, tickRestTimer]);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Sound/notification when timer reaches 0
    useEffect(() => {
        if (!restTimer) return;

        if (restTimer.remainingSeconds === 0 && restTimerSound) {
            // Send system notification
            if ('Notification' in window && Notification.permission === 'granted') {
                try {
                    new Notification("¡Descanso terminado!", {
                        body: "Es hora de volver a darle duro 💪",
                        vibrate: [200, 100, 200],
                        icon: '/favicon.ico'
                    } as any);
                } catch (e) {
                    console.error("Error showing notification:", e);
                }
            }

            // Play beep sound
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);

            // Vibrate if available
            if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
            }
        }
    }, [restTimer?.remainingSeconds, restTimerSound]);

    if (!restTimer) return null;

    const minutes = Math.floor(restTimer.remainingSeconds / 60);
    const seconds = restTimer.remainingSeconds % 60;
    const progress = (restTimer.remainingSeconds / restTimer.targetSeconds) * 100;
    const isFinished = restTimer.remainingSeconds === 0;

    return (
        <div className={`fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r ${isFinished
            ? 'from-green-500 to-emerald-600'
            : 'from-primary/90 to-primary'
            } text-white shadow-lg transition-all duration-300`}>
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Timer Icon & Label */}
                    <div className="flex items-center gap-2 min-w-0">
                        <Timer className={`h-5 w-5 flex-shrink-0 ${isFinished ? 'animate-bounce' : ''}`} />
                        <span className="text-sm font-medium truncate">
                            {isFinished ? '¡Descanso terminado!' : 'Descanso'}
                        </span>
                    </div>

                    {/* Countdown Display */}
                    <div className="flex items-center gap-3">
                        <div className={`text-2xl font-bold tabular-nums ${isFinished ? 'animate-pulse' : ''}`}>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => addRestTime(-30)}
                                disabled={restTimer.remainingSeconds <= 30}
                                className="h-8 w-8 p-0 text-white hover:bg-white/20 disabled:opacity-30"
                                title="Quitar 30s"
                            >
                                <Minus className="h-4 w-4" />
                            </Button>

                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => addRestTime(30)}
                                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                                title="Añadir 30s"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>

                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={skipRestTimer}
                                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                                title="Saltar descanso"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
