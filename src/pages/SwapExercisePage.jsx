import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronLeft, ChevronRight, Zap, LayoutGrid, Dumbbell, Star } from 'lucide-react';
import CustomExerciseModal from '@/components/workout/CustomExerciseModal';
import { categorizeAlternatives } from '../utils/swapSorter';

const SwapExercisePage = ({ userId, workoutExerciseToSwap, onBack, onSwapComplete }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

    // Fetch all exercises from DB (or search results)
    const exercises = useQuery(api.exercises.searchExercises, { query: searchQuery });

    // Group exercises by muscle group locally
    const muscleGroups = useMemo(() => {
        if (!exercises) return [];

        const groups = {};
        exercises.forEach(ex => {
            ex.muscleGroups?.forEach(muscle => {
                if (!groups[muscle]) {
                    groups[muscle] = 0;
                }
                groups[muscle]++;
            });
        });

        return Object.entries(groups)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count); // sort by count descending
    }, [exercises]);

    // Categorize exercises via Math Engine
    const { recommended, other } = useMemo(() => {
        if (!exercises || !workoutExerciseToSwap?.exercise) return { recommended: exercises || [], other: [] };
        return categorizeAlternatives(workoutExerciseToSwap.exercise, exercises);
    }, [exercises, workoutExerciseToSwap]);

    // Handle selection
    const handleSelect = async (newExercise) => {
        if (workoutExerciseToSwap) {
            // Call onSwapComplete which should trigger the swap mutation from App.jsx or parent
            onSwapComplete(workoutExerciseToSwap._id, newExercise._id);
        }
    };

    return (
        <div className="screen animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pb-32">
            <header className="py-2 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                        <ChevronLeft size={24} />
                    </Button>
                    <div className="text-center flex-1">
                        <h2 className="text-xl font-display uppercase tracking-tight">Swap Exercise</h2>
                    </div>
                    <div className="w-10" />
                </div>
                {workoutExerciseToSwap && (
                    <div className="text-center px-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Replacing:</p>
                        <p className="text-sm font-black uppercase text-primary">
                            {workoutExerciseToSwap.exercise?.name || 'Unknown'}
                        </p>
                    </div>
                )}
            </header>

            <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="SEARCH EXERCISES (E.G. SQUATS)"
                    className="h-14 pl-12 bg-secondary/50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus-visible:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full bg-secondary/50 rounded-full h-12 p-1 mb-6">
                    <TabsTrigger value="all" className="flex-1 rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-bold">
                        <LayoutGrid size={14} /> ALL
                    </TabsTrigger>
                    <TabsTrigger value="muscles" className="flex-1 rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-bold">
                        <Zap size={14} /> MUSCLE GROUPS
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="outline-none space-y-4">
                    {exercises === undefined ? (
                        // Loading state
                        Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-xl" />
                        ))
                    ) : exercises.length === 0 ? (
                        <div className="text-center py-10">
                            <Dumbbell size={48} className="mx-auto mb-4 text-muted-foreground/30" />
                            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No matching exercises found.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {recommended.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3 px-1 text-primary">
                                        <Star size={14} className="fill-primary" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest">Recommended Alternatives</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {recommended.map(ex => (
                                            <Card
                                                key={ex._id}
                                                className="bg-primary/5 border-primary/20 overflow-hidden cursor-pointer hover:border-primary/50 transition-all group"
                                                onClick={() => handleSelect(ex)}
                                            >
                                                <div className="p-3 flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-background/50 flex-shrink-0 flex items-center justify-center relative">
                                                        {ex.thumbnailUrl ? (
                                                            <img src={ex.thumbnailUrl} alt={ex.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Dumbbell size={20} className="text-primary/50" />
                                                        )}
                                                        {ex.isCustom && <div className="absolute top-0 right-0 bg-primary w-2 h-2 rounded-bl-sm" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-sm font-bold uppercase leading-tight group-hover:text-primary transition-colors block truncate">{ex.name}</span>
                                                        <span className="text-[9px] text-primary/70 font-black tracking-widest uppercase truncate block mt-[2px]">
                                                            {ex.emphasized_focus ? `Focus: ${ex.emphasized_focus}` : ex.primary_muscle || 'General'}
                                                        </span>
                                                    </div>
                                                    <ChevronRight size={18} className="text-primary/50 flex-shrink-0 group-hover:text-primary transition-colors" />
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {other.length > 0 && (
                                <div>
                                    {(recommended.length > 0) && (
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-1">Other Alternatives</h3>
                                    )}
                                    <div className="space-y-3">
                                        {other.map(ex => (
                                            <Card
                                                key={ex._id}
                                                className="bg-secondary/40 border-muted overflow-hidden cursor-pointer hover:border-primary/50 transition-all group"
                                                onClick={() => handleSelect(ex)}
                                            >
                                                <div className="p-3 flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center relative">
                                                        {ex.thumbnailUrl ? (
                                                            <img src={ex.thumbnailUrl} alt={ex.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Dumbbell size={20} className="text-muted-foreground" />
                                                        )}
                                                        {ex.isCustom && <div className="absolute top-0 right-0 bg-primary w-2 h-2 rounded-bl-sm" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-sm font-bold uppercase leading-tight group-hover:text-primary transition-colors block truncate">{ex.name}</span>
                                                        {ex.muscleGroups && (
                                                            <span className="text-[9px] text-muted-foreground font-black tracking-widest uppercase truncate block mt-[2px]">
                                                                {ex.muscleGroups.join(' • ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <ChevronRight size={18} className="text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="muscles" className="outline-none space-y-3">
                    {exercises === undefined ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-xl" />
                        ))
                    ) : muscleGroups.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No muscle groups found.</p>
                        </div>
                    ) : (
                        muscleGroups.map(group => (
                            <Card
                                key={group.name}
                                className="bg-secondary/40 border-muted group cursor-pointer hover:border-primary/50 transition-all"
                                onClick={() => setSearchQuery(group.name)} // poor man's filter
                            >
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                        <Zap size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm font-black uppercase block group-hover:text-primary transition-colors">{group.name}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{group.count} exercises</span>
                                    </div>
                                    <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>

            {/* Custom Exercise Button - We will hook this up to a dialog later */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pt-10 z-50 flex max-w-[480px] mx-auto w-full">
                <Button
                    className="w-full h-14 font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(0,255,102,0.2)]"
                    onClick={() => setIsCustomModalOpen(true)}
                >
                    ADD CUSTOM EXERCISE
                </Button>
            </div>

            <CustomExerciseModal
                isOpen={isCustomModalOpen}
                onClose={() => setIsCustomModalOpen(false)}
                userId={userId}
                onExerciseCreated={(newExerciseId) => {
                    // Instantly select the newly created exercise to swap
                    if (workoutExerciseToSwap) {
                        onSwapComplete(workoutExerciseToSwap._id, newExerciseId);
                    }
                }}
            />
        </div>
    );
};

export default SwapExercisePage;
