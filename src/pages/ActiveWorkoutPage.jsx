import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Info, MoreVertical, CheckCircle2, Trophy, Clock, Plus, Zap, Timer, Trash2, Link2, X, Check, Sparkles } from 'lucide-react';
import RestTimer from '@/components/workout/RestTimer';
import EffortRating from '@/components/workout/EffortRating';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const ActiveWorkoutPage = ({ userId, workoutId, workoutName, mode = 'active', onBack, onFinish, onViewExercise, onSwapExercise, onboardingGuideEnabled = false, onOnboardingGuideComplete }) => {
    // Fetch workout data
    const workout = useQuery(
        api.workouts.getWorkoutWithExercises,
        workoutId ? { workoutId } : "skip"
    );
    const allExercises = useQuery(api.exercises.getAllExercises);

    // Mutations
    const logSet = useMutation(api.logging.logSet);
    const finishWorkout = useMutation(api.logging.finishWorkout);
    const removeWorkoutExercise = useMutation(api.workouts.removeWorkoutExercise);
    const createSuperset = useMutation(api.workouts.createSuperset);
    const addExerciseToWorkout = useMutation(api.workouts.addExerciseToWorkout);
    const removeExerciseFromSuperset = useMutation(api.workouts.removeExerciseFromSuperset);

    // Timer and UI State
    const isReadOnly = mode === 'preview' || mode === 'history';
    const [startTime] = useState(() => Date.now());
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [activeRestTimer, setActiveRestTimer] = useState(null); // { seconds: number }
    const [showEffortRating, setShowEffortRating] = useState(null); // { we: object, setIndex: number, weight: number, reps: number }
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);
    const [menuExerciseId, setMenuExerciseId] = useState(null);
    const [pendingRemoval, setPendingRemoval] = useState(null);
    const [supersetBase, setSupersetBase] = useState(null);
    const [supersetSelections, setSupersetSelections] = useState([]);
    const [swipeOffsets, setSwipeOffsets] = useState({});
    const [activeTouch, setActiveTouch] = useState(null);
    const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
    const [exerciseSearch, setExerciseSearch] = useState('');
    const [guideState, setGuideState] = useState({
        addedExercise: false,
        createdSuperset: false,
        separatedSuperset: false,
    });

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
            if (isReadOnly) return;
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
        if (isReadOnly) return;
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
        if (isReadOnly) return;
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

    const handleRemoveExercise = async (workoutExerciseId) => {
        if (!workoutId || !workoutExerciseId || isReadOnly) return;
        try {
            await removeWorkoutExercise({ workoutId, workoutExerciseId });
        } catch (error) {
            console.error('Failed to remove exercise:', error);
        } finally {
            setPendingRemoval(null);
            setMenuExerciseId(null);
        }
    };

    const openSupersetCreator = (exercise) => {
        setMenuExerciseId(null);
        setSupersetBase(exercise);
        setSupersetSelections([]);
    };

    const handleCreateSuperset = async () => {
        if (!workoutId || !supersetBase || supersetSelections.length === 0) return;
        try {
            await createSuperset({
                workoutId,
                baseWorkoutExerciseId: supersetBase._id,
                workoutExerciseIds: supersetSelections,
            });
            if (onboardingGuideEnabled) {
                setGuideState((prev) => ({ ...prev, createdSuperset: true }));
            }
            setSupersetBase(null);
            setSupersetSelections([]);
        } catch (error) {
            console.error('Failed to create superset:', error);
        }
    };

    const startSwipe = (weId, event) => {
        if (isReadOnly) return;
        setActiveTouch({ weId, startX: event.touches[0].clientX });
    };

    const moveSwipe = (event) => {
        if (!activeTouch) return;
        const nextDelta = Math.max(-140, Math.min(140, event.touches[0].clientX - activeTouch.startX));
        setSwipeOffsets((prev) => ({ ...prev, [activeTouch.weId]: nextDelta }));
    };

    const endSwipe = (exercise) => {
        if (!activeTouch) return;
        const offset = swipeOffsets[activeTouch.weId] || 0;
        if (Math.abs(offset) >= 110) {
            setPendingRemoval(exercise);
        }
        setSwipeOffsets((prev) => ({ ...prev, [activeTouch.weId]: 0 }));
        setActiveTouch(null);
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

    const supersetCandidates = useMemo(() => {
        if (!supersetBase || !workout?.exercises) return [];
        return workout.exercises.filter((we) => we._id !== supersetBase._id && !we.supersetGroup);
    }, [supersetBase, workout]);

    const filteredExercises = useMemo(() => {
        if (!allExercises) return [];
        const lower = exerciseSearch.toLowerCase().trim();
        const inWorkout = new Set((workout?.exercises || []).map((we) => we.exerciseId));
        return allExercises
            .filter((ex) => !inWorkout.has(ex._id))
            .filter((ex) => !lower || ex.name.toLowerCase().includes(lower));
    }, [allExercises, exerciseSearch, workout]);

    const guideCompleted = guideState.addedExercise && guideState.createdSuperset && guideState.separatedSuperset;

    const handleAddExercise = async (exerciseId) => {
        if (!workoutId || isReadOnly) return;
        try {
            await addExerciseToWorkout({ workoutId, exerciseId });
            setShowAddExerciseModal(false);
            setExerciseSearch('');
            if (onboardingGuideEnabled) {
                setGuideState((prev) => ({ ...prev, addedExercise: true }));
            }
        } catch (error) {
            console.error('Failed to add exercise:', error);
        }
    };

    const handleSeparateSuperset = async (workoutExerciseId) => {
        if (isReadOnly) return;
        try {
            await removeExerciseFromSuperset({ workoutExerciseId });
            setMenuExerciseId(null);
            if (onboardingGuideEnabled) {
                setGuideState((prev) => ({ ...prev, separatedSuperset: true }));
            }
        } catch (error) {
            console.error('Failed to separate superset:', error);
        }
    };

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
                    {mode === 'preview' && <div className="text-[10px] font-black uppercase tracking-widest text-primary">Preview Mode</div>}
                    {mode === 'history' && <div className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Completed Session</div>}
                </div>
                <div className="flex items-center gap-2">
                    {!isReadOnly && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => setShowAddExerciseModal(true)}
                        >
                            <Plus size={13} />
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground h-8"
                        onClick={() => {
                            if (isReadOnly) onFinish();
                            else setShowFinishConfirm(true);
                        }}
                    >
                        {isReadOnly ? 'CLOSE' : 'FINISH'}
                    </Button>
                </div>
            </header>

            {onboardingGuideEnabled && (
                <div className="mb-6 rounded-xl border border-primary/40 bg-primary/10 p-3">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-primary">
                            <Sparkles size={14} />
                            <span className="text-xs font-black uppercase tracking-widest">First Workout Guide</span>
                        </div>
                        <span className="text-[10px] text-primary/80">3 steps</span>
                    </div>
                    <div className="space-y-2 mb-3">
                        <div className="rounded-lg border border-primary/20 bg-background/30 px-2.5 py-2">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                                {guideState.addedExercise ? <Check size={13} className="text-emerald-300" /> : <span className="w-[13px] h-[13px] rounded-full border border-primary/50" />}
                                Add a new exercise
                            </div>
                            <p className="text-[10px] uppercase tracking-wide text-primary/80 mt-1">Use the + button in the top-right corner.</p>
                        </div>
                        <div className="rounded-lg border border-primary/20 bg-background/30 px-2.5 py-2">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                                {guideState.createdSuperset ? <Check size={13} className="text-emerald-300" /> : <span className="w-[13px] h-[13px] rounded-full border border-primary/50" />}
                                Create a superset
                            </div>
                            <p className="text-[10px] uppercase tracking-wide text-primary/80 mt-1">Open an exercise menu (⋮) and tap “Create Superset”.</p>
                        </div>
                        <div className="rounded-lg border border-primary/20 bg-background/30 px-2.5 py-2">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                                {guideState.separatedSuperset ? <Check size={13} className="text-emerald-300" /> : <span className="w-[13px] h-[13px] rounded-full border border-primary/50" />}
                                Separate a superset exercise
                            </div>
                            <p className="text-[10px] uppercase tracking-wide text-primary/80 mt-1">Open the superset exercise menu (⋮) and tap “Separate Superset”.</p>
                        </div>
                    </div>
                    <Button className="w-full h-9" disabled={!guideCompleted} onClick={() => guideCompleted && onOnboardingGuideComplete && onOnboardingGuideComplete()}>
                        Finish Onboarding
                    </Button>
                </div>
            )}

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
                                    <div className="relative mb-4 overflow-hidden rounded-xl">
                                        <div className="absolute inset-y-0 left-0 w-full bg-red-600/20 border border-red-500/40 rounded-xl flex items-center px-4">
                                            <Trash2 size={14} className="text-red-300" />
                                            <span className="ml-2 text-[10px] uppercase tracking-widest font-black text-red-200">Swipe to remove</span>
                                        </div>
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
                                                    disabled={isReadOnly}
                                                >
                                                    Swap
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setMenuExerciseId((prev) => (prev === we._id ? null : we._id))}
                                            >
                                                <MoreVertical size={16} />
                                            </Button>
                                            {menuExerciseId === we._id && !isReadOnly && (
                                                <div className="absolute right-0 top-10 z-40 w-44 rounded-lg border border-border bg-background shadow-xl p-1">
                                                    {!we.supersetGroup && (
                                                        <button
                                                            className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-secondary flex items-center gap-2"
                                                            onClick={() => openSupersetCreator(we)}
                                                        >
                                                            <Link2 size={14} /> Create Superset
                                                        </button>
                                                    )}
                                                    {onboardingGuideEnabled && we.supersetGroup && (
                                                        <button
                                                            className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-secondary flex items-center gap-2"
                                                            onClick={() => handleSeparateSuperset(we._id)}
                                                        >
                                                            <X size={14} /> Separate Superset
                                                        </button>
                                                    )}
                                                    <button
                                                        className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-red-500/15 text-red-300 flex items-center gap-2"
                                                        onClick={() => setPendingRemoval(we)}
                                                    >
                                                        <Trash2 size={14} /> Remove Exercise
                                                    </button>
                                                </div>
                                            )}
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
                                                    onTouchStart={(e) => startSwipe(we._id, e)}
                                                    onTouchMove={moveSwipe}
                                                    onTouchEnd={() => endSwipe(we)}
                                                    className={`grid grid-cols-5 gap-2 items-center p-2 rounded-lg transition-all duration-300 ${setData.completed
                                                        ? isPR ? 'bg-[#ffd700]/10 border border-[#ffd700]/30 shadow-[inset_0_0_15px_rgba(255,215,0,0.1)]' : 'bg-primary/10 border border-primary/20'
                                                        : 'bg-background/60 border border-transparent shadow-sm'
                                                        }`}
                                                    style={{ transform: `translateX(${swipeOffsets[we._id] || 0}px)` }}
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
                                                        disabled={setData.completed || isReadOnly}
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
                                                        disabled={setData.completed || isReadOnly}
                                                    />
                                                    <div className="flex justify-end pr-1">
                                                        <button
                                                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${setData.completed
                                                                ? isPR ? 'bg-[#ffd700] text-black shadow-[0_0_10px_rgba(255,215,0,0.4)]' : 'bg-primary text-black shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                                                                : 'bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95'
                                                                }`}
                                                            onClick={() => handleSetComplete(we, idx)}
                                                            disabled={isReadOnly}
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
                                            disabled={isReadOnly}
                                        >
                                            <Clock size={14} className="text-primary" /> REST: {Math.floor((we.restSeconds || 120) / 60)}:{(we.restSeconds || 120) % 60 === 0 ? '00' : (we.restSeconds || 120) % 60}
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="flex-1 h-9 text-[10px] font-bold tracking-widest uppercase gap-2 bg-background/50 border border-border/50 hover:bg-secondary"
                                            disabled={isReadOnly}
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

            <ConfirmDialog
                isOpen={!!pendingRemoval}
                onClose={() => setPendingRemoval(null)}
                onConfirm={() => pendingRemoval && handleRemoveExercise(pendingRemoval._id)}
                title="Remove Exercise?"
                description="This will remove the exercise from the current workout session."
                confirmLabel="Remove"
                cancelLabel="Cancel"
                variant="danger"
            />

            {supersetBase && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-6 flex items-end sm:items-center justify-center">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest font-black text-primary">Create Superset</p>
                                <h3 className="text-lg font-display">{supersetBase.exercise?.name}</h3>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSupersetBase(null)}><X size={14} /></Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">Select one or more exercises to pair in this superset.</p>
                        <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                            {supersetCandidates.map((candidate) => {
                                const isSelected = supersetSelections.includes(candidate._id);
                                return (
                                    <button
                                        key={candidate._id}
                                        className={`w-full text-left rounded-lg border px-3 py-2 text-sm font-bold uppercase tracking-tight ${isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/30'}`}
                                        onClick={() => setSupersetSelections((prev) => isSelected ? prev.filter((id) => id !== candidate._id) : [...prev, candidate._id])}
                                    >
                                        {candidate.exercise?.name || 'Unknown Exercise'}
                                    </button>
                                );
                            })}
                            {supersetCandidates.length === 0 && (
                                <p className="text-xs text-muted-foreground py-3 text-center">No eligible exercises available.</p>
                            )}
                        </div>
                        <Button className="w-full" disabled={supersetSelections.length === 0} onClick={handleCreateSuperset}>Confirm Superset</Button>
                    </div>
                </div>
            )}

            {showAddExerciseModal && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-6 flex items-end sm:items-center justify-center">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest font-black text-primary">Workout Builder</p>
                                <h3 className="text-lg font-display">Add Exercise</h3>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAddExerciseModal(false)}><X size={14} /></Button>
                        </div>
                        <Input
                            value={exerciseSearch}
                            onChange={(e) => setExerciseSearch(e.target.value)}
                            placeholder="Search exercise"
                            className="mb-3"
                        />
                        <div className="max-h-64 overflow-y-auto space-y-2 mb-1">
                            {filteredExercises.map((exercise) => (
                                <button
                                    key={exercise._id}
                                    className="w-full text-left rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm font-bold uppercase tracking-tight hover:border-primary/40"
                                    onClick={() => handleAddExercise(exercise._id)}
                                >
                                    {exercise.name}
                                </button>
                            ))}
                            {filteredExercises.length === 0 && (
                                <p className="text-xs text-muted-foreground py-3 text-center">No exercises available.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ActiveWorkoutPage;
