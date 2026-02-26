import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, MoreVertical, Zap, Info, CheckCircle2, Eye } from 'lucide-react';

const WorkoutSummaryPage = ({ workoutId, workoutName, dayStatus, isCompleted, onBack, onStart, onViewExercise }) => {
    // Fetch workout with exercises from Convex
    const workout = useQuery(
        api.workouts.getWorkoutWithExercises,
        workoutId ? { workoutId } : "skip"
    );

    // Calculate muscle group breakdown from exercises
    const getMuscleBreakdown = (exercises) => {
        if (!exercises) return [];

        const muscleCount = {};
        let total = 0;

        exercises.forEach(we => {
            if (we.exercise?.muscleGroups) {
                we.exercise.muscleGroups.forEach(muscle => {
                    muscleCount[muscle] = (muscleCount[muscle] || 0) + we.targetSets;
                    total += we.targetSets;
                });
            }
        });

        return Object.entries(muscleCount)
            .map(([name, count]) => ({
                name,
                percent: Math.round((count / total) * 100),
            }))
            .sort((a, b) => b.percent - a.percent)
            .slice(0, 4);
    };

    // Loading skeleton
    if (workout === undefined) {
        return (
            <div className="screen animate-in fade-in slide-in-from-right-4 duration-500">
                <header className="flex justify-between items-center py-2 mb-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </header>
                <div className="mb-8">
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-12 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <section className="mb-8">
                    <Skeleton className="h-4 w-24 mb-4" />
                    <div className="flex gap-3">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="min-w-[120px] h-16 rounded-lg" />
                        ))}
                    </div>
                </section>
                <section className="mb-32">
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-24 rounded-lg" />
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    if (!workout) {
        return (
            <div className="screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-display mb-2">Workout Not Found</h2>
                    <Button onClick={onBack}>Go Back</Button>
                </div>
            </div>
        );
    }

    const muscleBreakdown = getMuscleBreakdown(workout.exercises);
    const totalSets = workout.exercises?.reduce((sum, we) => sum + we.targetSets, 0) || 0;
    const estimatedTime = Math.round(totalSets * 2.5); // ~2.5 min per set average
    const isFuturePreview = dayStatus === 'future';
    const primaryCtaLabel = isFuturePreview ? 'PREVIEW WORKOUT' : isCompleted ? 'VIEW WORKOUT' : 'START WORKOUT';
    const subtitleLabel = isFuturePreview ? 'Planned Workout' : isCompleted ? 'Completed Workout' : 'Planned Workout';

    return (
        <div className="screen animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="flex justify-between items-center py-2 mb-4">
                <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                    <ChevronLeft size={24} />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical size={20} />
                </Button>
            </header>

            <div className="mb-8">
                <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-xs font-bold secondary-text uppercase tracking-widest">{subtitleLabel}</span>
                    {isCompleted && (
                        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/40">
                            <CheckCircle2 size={12} /> Completed
                        </div>
                    )}
                </div>
                <h1 className="text-5xl font-display leading-none mb-1">{workout.name || workoutName}</h1>
                <div className="text-sm secondary-text">
                    {workout.exercises?.length || 0} Exercises • ~{estimatedTime} Min
                </div>
            </div>

            {/* Target Muscles Section */}
            <section className="mb-8">
                <h3 className="text-sm font-display mb-4 text-muted-foreground">Target Muscles</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {muscleBreakdown.map(muscle => (
                        <Card key={muscle.name} className="min-w-[120px] bg-secondary border-none">
                            <CardContent className="p-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                                    <span className="text-primary text-xs font-bold">{muscle.name.slice(0, 2).toUpperCase()}</span>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase">{muscle.name}</div>
                                    <div className="text-xs font-bold accent-text">{muscle.percent}%</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Exercises Section */}
            <section className="mb-32">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-display text-muted-foreground uppercase">
                        {workout.exercises?.length || 0} Exercises
                    </h3>
                </div>

                <div className="flex flex-col gap-3">
                    {workout.exercises?.map((we, index) => (
                        <Card
                            key={we._id || index}
                            className="bg-secondary/40 border-muted overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
                            onClick={() => onViewExercise && onViewExercise(we)}
                        >
                            <CardContent className="p-3 flex gap-4 items-center">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                                    {we.exercise?.thumbnailUrl ? (
                                        <img src={we.exercise.thumbnailUrl} alt={we.exercise.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-primary text-lg font-bold">{we.exercise?.name?.slice(0, 2) || '??'}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black accent-text uppercase tracking-tighter">{we.targetSets} SETS</span>
                                        {we.supersetGroup && (
                                            <span className="flex items-center gap-1 bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                                                <Zap size={8} fill="currentColor" />
                                                Superset {we.supersetGroup}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-sm font-bold truncate leading-tight uppercase">{we.exercise?.name || 'Unknown Exercise'}</h4>
                                    <div className="text-xs text-muted-foreground uppercase">{we.targetReps} reps</div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewExercise && onViewExercise(we);
                                    }}
                                >
                                    <Info size={16} />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Fixed Bottom Buttons */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pt-10 z-50 flex gap-4 max-w-[480px] mx-auto w-full">
                <Button
                    className="flex-1 h-14 font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(0,255,102,0.3)] hover:shadow-[0_0_30px_rgba(0,255,102,0.5)] gap-2"
                    onClick={onStart}
                >
                    {(isCompleted || isFuturePreview) && <Eye size={16} />}
                    {primaryCtaLabel}
                </Button>
            </div>
        </div>
    );
};

export default WorkoutSummaryPage;
