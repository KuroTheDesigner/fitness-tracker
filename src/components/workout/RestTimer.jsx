import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Play, Pause, RotateCcw, X } from 'lucide-react';

const RestTimer = ({
    initialSeconds = 120,
    onComplete,
    onDismiss,
    autoStart = false,
    showControls = true
}) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(autoStart);
    const [isComplete, setIsComplete] = useState(false);
    const audioRef = useRef(null);

    // Create audio beep sound
    useEffect(() => {
        // Create a simple beep using Web Audio API
        audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }, []);

    const playBeep = useCallback(() => {
        if (audioRef.current) {
            const oscillator = audioRef.current.createOscillator();
            const gainNode = audioRef.current.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioRef.current.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            oscillator.start();
            oscillator.stop(audioRef.current.currentTime + 0.2);
        }

        // Also try vibration on mobile
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    }, []);

    // Timer countdown
    useEffect(() => {
        if (!isRunning || isComplete || seconds <= 0) return;

        const interval = setInterval(() => {
            setSeconds((prevSeconds) => {
                if (prevSeconds <= 1) {
                    clearInterval(interval);
                    setIsRunning(false);
                    setIsComplete(true);
                    playBeep();
                    onComplete?.();
                    return 0;
                }
                return prevSeconds - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, isComplete, seconds, playBeep, onComplete]);

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercent = ((initialSeconds - seconds) / initialSeconds) * 100;

    const handleStart = () => setIsRunning(true);
    const handlePause = () => setIsRunning(false);
    const handleReset = () => {
        setSeconds(initialSeconds);
        setIsRunning(false);
        setIsComplete(false);
    };

    return (
        <div className={`relative overflow-hidden rounded-lg transition-all ${isComplete ? 'bg-primary/20 border-primary' : 'bg-secondary'} border p-4`}>
            {/* Progress background */}
            <div
                className="absolute inset-0 bg-primary/10 transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
            />

            <div className="relative flex items-center justify-between gap-4">
                {/* Timer Display */}
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display text-lg ${isComplete ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                        {isComplete ? '✓' : formatTime(seconds)}
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase text-muted-foreground">
                            {isComplete ? 'Rest Complete!' : isRunning ? 'Resting...' : 'Rest Timer'}
                        </div>
                        {!isComplete && (
                            <div className="text-sm font-bold">{formatTime(seconds)}</div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                {showControls && (
                    <div className="flex gap-2">
                        {!isComplete && (
                            <>
                                {isRunning ? (
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={handlePause}
                                    >
                                        <Pause size={14} />
                                    </Button>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={handleStart}
                                    >
                                        <Play size={14} fill="currentColor" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground"
                                    onClick={handleReset}
                                >
                                    <RotateCcw size={14} />
                                </Button>
                            </>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={onDismiss}
                        >
                            <X size={14} />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestTimer;
