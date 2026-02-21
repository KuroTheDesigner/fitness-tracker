import React, { useState, useEffect, useMemo, useReducer } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../convex/_generated/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Info, MoreVertical, CheckCircle2, Trophy, Clock, Plus, Zap, Timer, GripVertical, ChevronUp, ChevronDown, Repeat, MessageSquare } from 'lucide-react';
import RestTimer from '@/components/workout/RestTimer';
import EffortRating from '@/components/workout/EffortRating';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { activeWorkoutReducer, ACTIONS } from '../reducers/activeWorkoutReducer';
import { calculateEfficacy, calculateChevrons } from '../utils/performanceMath';
import { DndContext, closestCenter, TouchSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function SortableExerciseContainer({ id, children }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', position: 'relative' };
    return (
        <div ref={setNodeRef} style={style}>
            <div {...attributes} {...listeners} className="absolute left-1/2 -top-3 -translate-x-1/2 p-2 cursor-grab text-muted-foreground/30 hover:text-primary z-20 touch-none">
                <GripVertical size={16} className="rotate-90" />
            </div>
            {children}
        </div>
    );
}

function ChevronIndicator({ direction, count }) {
    if (count === 0) return null;
    const isUp = direction === 'up';
    const colorClass = isUp ? 'text-primary' : 'text-red-500/80';

    return (
        <div className={`flex flex-col -space-y-[6px] items-center justify-center ${colorClass}`}>
            {[...Array(count)].map((_, i) => (
                isUp
                    ? <ChevronUp key={i} size={12} className="stroke-[4]" />
                    : <ChevronDown key={i} size={12} className="stroke-[4]" />
            ))}
        </div>
    );
}

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
    const [startTime] = useState(Date.now());
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

    useEffect(() => {
        if (workout?.exercises) {
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
            setSetsState(initialState);
        }
    }, [workout]);

    // Calculate progress
    const { completedSets, totalSets } = useMemo(() => {
        const completed = Object.values(setsState).filter(s => s.completed).length;
        const total = Object.keys(setsState).length;
        return { completedSets: completed, totalSets: total || 1 };
    }, [setsState]);

    // Handle set completion trigger
    const handleSetComplete = (we, setIndex) => {
        const setKey = `${we._id}-${setIndex}`;
        const currentSet = setsState[setKey];

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

    const previousSession = useQuery(
        api.workouts.getPreviousSessionContext,
        workout?.exercises ? { userId, exerciseIds: workout.exercises.map(we => we.exerciseId) } : "skip"
    );

    // Group exercises by superset using our robust Reducer
    const [workoutState, dispatch] = useReducer(activeWorkoutReducer, { groups: [] });

    useEffect(() => {
        if (workout?.exercises) {
            dispatch({ type: ACTIONS.INIT, payload: workout.exercises });
        }
    }, [workout?.exercises]);

    const groupedExercises = workoutState.groups;

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        // Find locations
        let sGroup, dGroup, sIdx, dIdx;
        groupedExercises.forEach(g => {
            const idxA = g.exercises.findIndex(e => e._id === active.id);
            if (idxA !== -1) { sGroup = g; sIdx = idxA; }
            const idxO = g.exercises.findIndex(e => e._id === over.id);
            if (idxO !== -1) { dGroup = g; dIdx = idxO; }
        });

        if (sGroup && dGroup) {
            dispatch({
                type: ACTIONS.MOVE_EXERCISE,
                payload: {
                    sourceGroupId: sGroup.id,
                    sourceIndex: sIdx,
                    destGroupId: dGroup.id,
                    destIndex: dIdx
                }
            });
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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="space-y-8">
                    {groupedExercises.map((group) => (
                        <div key={group.id} className={`bg-secondary/20 rounded-xl p-4 border relative ${group.isSuperset ? 'border-primary shadow-[0_0_15px_rgba(0,255,102,0.1)]' : 'border-primary/10'}`}>
                            {group.isSuperset && (
                                <div className="absolute -top-3 left-4 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded shadow-md uppercase">
                                    <Zap size={10} fill="currentColor" />
                                    {group.id.includes('superset') ? 'SUPERSET' : `SUPERSET ${group.id}`}
                                </div>
                            )}

                            <div className={group.isSuperset ? "pt-2" : ""}>
                                <SortableContext items={group.exercises.map(we => we._id)} strategy={verticalListSortingStrategy}>
                                    <AnimatePresence>
                                        {group.exercises.map((we, index) => (
                                            <SortableExerciseContainer key={we._id} id={we._id}>
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                                                    className="relative"
                                                >
                                                    {/* Red background container revealed on swipe */}
                                                    <div className="absolute inset-0 bg-red-500 rounded-lg flex items-center justify-end pr-6 -z-10 shadow-inner">
                                                        <span className="text-white font-black uppercase text-xs tracking-widest">Delete</span>
                                                    </div>

                                                    <motion.div
                                                        drag="x"
                                                        dragConstraints={{ left: 0, right: 0 }}
                                                        dragElastic={{ left: 0.5, right: 0 }}
                                                        onDragEnd={(e, info) => {
                                                            if (info.offset.x < -60) {
                                                                // Trigger delete if swiped left far enough
                                                                dispatch({ type: ACTIONS.DELETE_EXERCISE, payload: { exerciseId: we._id } });
                                                            }
                                                        }}
                                                        className={`bg-background z-10 ${index !== group.exercises.length - 1 ? 'mb-12 pb-8 border-b border-primary/10' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex-1 pr-4">
                                                                <h3 className="text-base font-black uppercase leading-tight tracking-tight mb-1 accent-text">
                                                                    {we.exercise?.name || 'Unknown Exercise'}
                                                                </h3>
                                                                <div className="flex gap-2 items-center">
                                                                    <Button
                                                                        variant="link"
                                                                        className="text-[10px] text-primary p-0 h-auto uppercase font-bold"
                                                                        onClick={() => onViewExercise && onViewExercise(we)}
                                                                    >
                                                                        <Info size={10} className="mr-1" /> How To
                                                                    </Button>

                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full opacity-50 hover:opacity-100 ml-1">
                                                                                <MoreVertical size={14} />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="bg-background border-border min-w-[150px]">
                                                                            <DropdownMenuItem onClick={() => onSwapExercise && onSwapExercise(we)} className="font-bold text-[10px] uppercase cursor-pointer py-3 text-primary focus:text-primary focus:bg-primary/10">
                                                                                <Repeat size={14} className="mr-2" /> Swap
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem className="font-bold text-[10px] uppercase cursor-pointer py-3 text-muted-foreground focus:text-muted-foreground focus:bg-secondary">
                                                                                <MessageSquare size={14} className="mr-2" /> Add Notes
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Sets Grid */}
                                                        <div className="space-y-2">
                                                            <div className="grid grid-cols-5 gap-2 px-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-70 mb-1">
                                                                <div className="text-center">SET</div>
                                                                <div className="col-span-1 text-center">PREVIOUS</div>
                                                                <div className="text-center">KG</div>
                                                                <div className="text-center">REPS</div>
                                                                <div className="text-right pr-2">✓</div>
                                                            </div>

                                                            {Array.from({ length: we.targetSets }).map((_, idx) => {
                                                                const setKey = `${we._id}-${idx}`;
                                                                const setData = setsState[setKey] || { weight: '', reps: '', completed: false, isPR: false };

                                                                const prevSet = previousSession?.[we.exerciseId]?.[idx];

                                                                // Calculate live Efficacy and display Chevrons
                                                                const currentEfficacy = calculateEfficacy(Number(setData.weight), Number(setData.reps));
                                                                const pastEfficacy = prevSet ? calculateEfficacy(Number(prevSet.weight), Number(prevSet.reps)) : 0;
                                                                const chevrons = setData.completed && pastEfficacy > 0
                                                                    ? calculateChevrons(currentEfficacy, pastEfficacy)
                                                                    : { count: 0 };

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
                                                                                {idx + 1}{group.isSuperset ? String.fromCharCode(65 + index) : ''}
                                                                            </span>
                                                                            {isPR && <Trophy size={10} className="text-[#ffd700] -mt-1" />}
                                                                        </div>
                                                                        <div className="text-center text-[10px] font-bold text-muted-foreground leading-none flex items-center justify-center gap-[2px]">
                                                                            <span>{prevSet ? `${prevSet.weight}kg x ${prevSet.reps}` : '-'}</span>
                                                                            {chevrons.count > 0 && <ChevronIndicator direction={chevrons.direction} count={chevrons.count} />}
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
                                                            {/* Only show rest button if it's an isolated exercise OR it's the last exercise in a superset */}
                                                            {(!group.isSuperset || index === group.exercises.length - 1) && (
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="flex-1 h-9 text-[10px] font-bold tracking-widest uppercase gap-2 bg-background/50 border border-border/50 hover:bg-secondary"
                                                                    onClick={() => setActiveRestTimer({ seconds: we.restSeconds || 120 })}
                                                                >
                                                                    <Clock size={14} className="text-primary" /> REST: {Math.floor((we.restSeconds || 120) / 60)}:{(we.restSeconds || 120) % 60 === 0 ? '00' : (we.restSeconds || 120) % 60}
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                className="flex-1 h-9 text-[10px] font-bold tracking-widest uppercase gap-2 bg-background/50 border border-border/50 hover:bg-secondary"
                                                            >
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                </motion.div>
                                            </SortableExerciseContainer>
                                        ))}
                                    </AnimatePresence>
                                </SortableContext>
                            </div>
                        </div>
                    ))}
                </div>
            </DndContext>

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
            )
            }

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

        </div >
    );
};

export default ActiveWorkoutPage;
