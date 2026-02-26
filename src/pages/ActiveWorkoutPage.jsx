import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Info, MoreVertical, CheckCircle2, Trophy, Clock, Plus, Zap, Timer } from 'lucide-react';
import RestTimer from '@/components/workout/RestTimer';
import EffortRating from '@/components/workout/EffortRating';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const ActiveWorkoutPage = ({ userId, workoutId, workoutName, onBack, onFinish, onViewExercise, onSwapExercise }) => {
    // Fetch workout data
    const workout = useQuery(
        api.workouts.getWorkoutWithExercises,
        workoutId ? { workoutId } : "skip"
    );

    // Mutations
    const logSet = useMutation(api.logging.logSet);
    const finishWorkout = useMutation(api.logging.finishWorkout);

    // Timer and UI State
    const [startTime] = useState(() => Date.now());
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [activeRestTimer, setActiveRestTimer] = useState(null); // { seconds: number }
    const [showEffortRating, setShowEffortRating] = useState(null); // { we: object, setIndex: number, weight: number, reps: number }
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);

    // Elapsed timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Initialize set tracking state from workout data
    const [setsState, setSetsState] = useState({});

    const baseSetsState = useMemo(() => {
        if (!workout?.exercises) return {};
        const initialState = {};
        workout.exercises.forEach(we => {
            for (let i = 0; i < we.targetSets; i++) {
                const setKey = `${we._id}-${i}`;
                initialState[setKey] = {
                    weight: '',
                    reps: '',
                    completed: false,
                    isPR: false,
                };
            }
        });
        return initialState;
    }, [workout]);

    const resolvedSetsState = useMemo(() => ({
        ...baseSetsState,
        ...setsState,
    }), [baseSetsState, setsState]);

    // Calculate progress
    const { completedSets, totalSets } = useMemo(() => {
        const completed = Object.values(resolvedSetsState).filter(s => s.completed).length;
        const total = Object.keys(resolvedSetsState).length;
        return { completedSets: completed, totalSets: total || 1 };
    }, [resolvedSetsState]);

    // Handle set completion trigger
    const handleSetComplete = (we, setIndex) => {
        const setKey = `${we._id}-${setIndex}`;
        const currentSet = resolvedSetsState[setKey];

        if (!currentSet?.completed) {
            const weight = parseFloat(currentSet?.weight) || 0;
            const reps = parseInt(currentSet?.reps) || 0;

            if (weight > 0 && reps > 0) {
                // Show effort rating before committing
                setShowEffortRating({ we, setIndex, weight, reps });
            } else {
                // Just mark as complete locally if no valid data
                commitSetCompletion(we, setIndex, weight, reps, 'NORMAL', false);
            }
        } else {
            // Toggle off
            setSetsState(prev => ({
                ...prev,
                [setKey]: {
                    ...prev[setKey],
                    completed: false,
                    isPR: false,
                }
            }));
            // Clear rest timer if toggling off the latest set
            setActiveRestTimer(null);
        }
    };

    // Actually commit the set to database
    const commitSetCompletion = async (we, setIndex, weight, reps, effortLevel, startRest = true) => {
        const setKey = `${we._id}-${setIndex}`;
        let isPR = false;

        if (weight > 0 && reps > 0 && userId) {
            try {
                const result = await logSet({
                    userId,
                    workoutExerciseId: we._id,
                    exerciseId: we.exerciseId,
                    setNumber: setIndex + 1,
                    weight,
                    reps,
                    effortLevel,
                });
                isPR = result.isPR;
            } catch (error) {
                console.error('Failed to log set:', error);
            }
        }

        setSetsState(prev => ({
            ...prev,
            [setKey]: {
                ...prev[setKey],
                completed: true,
                isPR,
            }
        }));

        setShowEffortRating(null);

        // Start rest timer automatically
        if (startRest && we.restSeconds > 0) {
            setActiveRestTimer({ seconds: we.restSeconds });
            // Scroll to top to ensure rest timer is visible
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Handle input changes
    const handleInputChange = (weId, setIndex, field, value) => {
        const setKey = `${weId}-${setIndex}`;
        setSetsState(prev => ({
            ...prev,
            [setKey]: {
                ...prev[setKey],
                [field]: value,
            }
        }));
    };

    // Handle finish workout
    const handleFinishWorkout = async () => {
        if (userId && workoutId) {
            try {
                await finishWorkout({
                    userId,
                    workoutId,
                    duration: elapsedSeconds,
                    completedSets,
                    totalSets,
                });
            } catch (error) {
                console.error('Failed to finish workout:', error);
            }
        }
        setShowFinishConfirm(false);
        onFinish();
    };

    // Group exercises by superset
    const groupedExercises = useMemo(() => {
        if (!workout?.exercises) return [];

        const groups = [];
        let currentGroup = null;

        workout.exercises.forEach(we => {
            if (we.supersetGroup) {
                if (!currentGroup || currentGroup.group !== we.supersetGroup) {
                    currentGroup = { group: we.supersetGroup, exercises: [we] };
                    groups.push(currentGroup);
                } else {
                    currentGroup.exercises.push(we);
                }
            } else {
                groups.push({ group: null, exercises: [we] });
                currentGroup = null;
            }
        });

        return groups;
    }, [workout]);

    // Loading skeleton
    if (workout === undefined) {
        return (
            <div className="screen animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex justify-between items-center py-2 mb-6">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-8 w-20" />
                </header>
                <Skeleton className="h-20 w-full mb-8" />
                <div className="space-y-8">
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="screen animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 relative min-h-screen">
            <header className="flex justify-between items-center py-2 mb-6">
                <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                    <ChevronLeft size={24} />
                </Button>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                        <Timer size={12} className="text-primary" />
                        {formatTime(elapsedSeconds)}
                    </div>
                    <h2 className="text-xl font-display">{workout?.name || workoutName}</h2>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground h-8"
                    onClick={() => setShowFinishConfirm(true)}
                >
                    FINISH
                </Button>
            </header>

            {/* Global Rest Timer */}
            {activeRestTimer && (
                <div className="sticky top-4 z-40 mb-6 px-1">
                    <div className="shadow-lg shadow-background/80 rounded-lg">
                        <RestTimer
                            initialSeconds={activeRestTimer.seconds}
                            autoStart={true}
                            onDismiss={() => setActiveRestTimer(null)}
                            onComplete={() => {
                                // Keep it visible, it will show "Rest Complete" state
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            <div className={`mb-8 ${!activeRestTimer ? 'mt-4' : ''}`}>
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold uppercase">{completedSets}/{totalSets} Completed</span>
                    <span className="text-2xl font-display accent-text">{Math.round((completedSets / totalSets) * 100)}%</span>
                </div>
                <Progress value={(completedSets / totalSets) * 100} className="h-2 bg-muted" />
            </div>

            {/* Exercise Groups */}
            <div className="space-y-8">
                {groupedExercises.map((group, groupIndex) => (
                    <div key={groupIndex} className="bg-secondary/20 rounded-xl p-4 border border-primary/10 relative">
                        {group.group && (
                            <div className="absolute -top-3 left-4 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded shadow-md">
                                <Zap size={10} fill="currentColor" />
                                SUPERSET {group.group}
                            </div>
                        )}

                        <div className={group.group ? "pt-2" : ""}>
                            {group.exercises.map((we, index) => (
                                <div key={we._id} className={`${index !== group.exercises.length - 1 ? 'mb-12 pb-8 border-b border-primary/10' : ''}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 pr-4">
                                            <h3 className="text-base font-black uppercase leading-tight tracking-tight mb-1 accent-text">
                                                {we.exercise?.name || 'Unknown Exercise'}
                                            </h3>
                                            <div className="flex gap-2">
                                                <Button variant="link" className="text-[10px] text-muted-foreground p-0 h-auto uppercase font-bold">
                                                    Add Notes
                                                </Button>
                                                <Button
                                                    variant="link"
                                                    className="text-[10px] text-primary p-0 h-auto uppercase font-bold"
                                                    onClick={() => onViewExercise && onViewExercise(we)}
                                                >
                                                    <Info size={10} className="mr-1" /> How To
                                                </Button>
                                                <Button
                                                    variant="link"
                                                    className="text-[10px] text-primary p-0 h-auto uppercase font-bold ml-2"
                                                    onClick={() => onSwapExercise && onSwapExercise(we)}
                                                >
                                                    Swap
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sets Grid */}
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-5 gap-2 px-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-70 mb-1">
                                            <div className="text-center">SET</div>
                                            <div className="col-span-1 text-center">TARGET</div>
                                            <div className="text-center">KG</div>
                                            <div className="text-center">REPS</div>
                                            <div className="text-right pr-2">✓</div>
                                        </div>

                                        {Array.from({ length: we.targetSets }).map((_, idx) => {
                                            const setKey = `${we._id}-${idx}`;
                                            const setData = resolvedSetsState[setKey] || { weight: '', reps: '', completed: false, isPR: false };

                                            // Handle PR highlighting
                                            const isPR = setData.isPR;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`grid grid-cols-5 gap-2 items-center p-2 rounded-lg transition-all duration-300 ${setData.completed
                                                        ? isPR ? 'bg-[#ffd700]/10 border border-[#ffd700]/30 shadow-[inset_0_0_15px_rgba(255,215,0,0.1)]' : 'bg-primary/10 border border-primary/20'
                                                        : 'bg-background/60 border border-transparent shadow-sm'
                                                        }`}
                                                >
                                                    <div className="text-center font-display text-lg flex flex-col items-center justify-center">
                                                        <span className={setData.completed && !isPR ? 'text-primary' : isPR ? 'text-[#ffd700]' : ''}>
                                                            {idx + 1}{group.group || ''}
                                                        </span>
                                                        {isPR && <Trophy size={10} className="text-[#ffd700] -mt-1" />}
                                                    </div>
                                                    <div className="text-center text-[11px] font-bold text-muted-foreground leading-none">
                                                        {we.targetReps}
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        value={setData.weight}
                                                        onChange={(e) => handleInputChange(we._id, idx, 'weight', e.target.value)}
                                                        placeholder="0"
                                                        className={`h-9 text-center border-none font-bold text-sm p-0 transition-colors ${setData.completed
                                                            ? 'bg-transparent text-foreground'
                                                            : 'bg-muted/50 focus:bg-background focus:ring-1 focus:ring-primary/50'
                                                            }`}
                                                        disabled={setData.completed}
                                                    />
                                                    <Input
                                                        type="number"
                                                        value={setData.reps}
                                                        onChange={(e) => handleInputChange(we._id, idx, 'reps', e.target.value)}
                                                        placeholder="0"
                                                        className={`h-9 text-center border-none font-bold text-sm p-0 transition-colors ${setData.completed
                                                            ? 'bg-transparent text-foreground'
                                                            : 'bg-muted/50 focus:bg-background focus:ring-1 focus:ring-primary/50'
                                                            }`}
                                                        disabled={setData.completed}
                                                    />
                                                    <div className="flex justify-end pr-1">
                                                        <button
                                                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${setData.completed
                                                                ? isPR ? 'bg-[#ffd700] text-black shadow-[0_0_10px_rgba(255,215,0,0.4)]' : 'bg-primary text-black shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                                                                : 'bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95'
                                                                }`}
                                                            onClick={() => handleSetComplete(we, idx)}
                                                        >
                                                            {setData.completed ? <CheckCircle2 size={18} /> : <div className="w-2 h-2 rounded-full bg-current opacity-30" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-4">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="flex-1 h-9 text-[10px] font-bold tracking-widest uppercase gap-2 bg-background/50 border border-border/50 hover:bg-secondary"
                                            onClick={() => setActiveRestTimer({ seconds: we.restSeconds || 120 })}
                                        >
                                            <Clock size={14} className="text-primary" /> REST: {Math.floor((we.restSeconds || 120) / 60)}:{(we.restSeconds || 120) % 60 === 0 ? '00' : (we.restSeconds || 120) % 60}
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="flex-1 h-9 text-[10px] font-bold tracking-widest uppercase gap-2 bg-background/50 border border-border/50 hover:bg-secondary"
                                        >
                                            <Plus size={14} className="text-primary" /> ADD SET
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals and Overlays */}

            {showEffortRating && (
                <EffortRating
                    exerciseName={showEffortRating.we.exercise?.name}
                    onSelect={(effortLevel) => commitSetCompletion(
                        showEffortRating.we,
                        showEffortRating.setIndex,
                        showEffortRating.weight,
                        showEffortRating.reps,
                        effortLevel
                    )}
                    onSkip={() => commitSetCompletion(
                        showEffortRating.we,
                        showEffortRating.setIndex,
                        showEffortRating.weight,
                        showEffortRating.reps,
                        'NORMAL'
                    )}
                />
            )}

            <ConfirmDialog
                isOpen={showFinishConfirm}
                onClose={() => setShowFinishConfirm(false)}
                onConfirm={handleFinishWorkout}
                title="Finish Workout?"
                description={`You've completed ${completedSets} of ${totalSets} sets. Once you finish, your progress will be saved.`}
                confirmLabel="Finish"
                cancelLabel="Keep Going"
            >
                <div className="bg-secondary/50 rounded-lg p-4 flex flex-col items-center justify-center text-center mt-2 mb-2">
                    <div className="text-3xl font-display accent-text mb-1">{formatTime(elapsedSeconds)}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Time</div>
                </div>
            </ConfirmDialog>

        </div>
    );
};

export default ActiveWorkoutPage;
