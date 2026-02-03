import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, MoreVertical, Trophy, Zap } from 'lucide-react';

const WorkoutSummaryPage = ({ onBack, onStart }) => {
    const workout = {
        name: 'Workout A',
        completedStatus: '0/6 Completed',
        targetMuscles: [
            { name: 'Shoulders', percent: 30, image: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?q=80&w=100&auto=format&fit=crop' },
            { name: 'Back', percent: 20, image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=100&auto=format&fit=crop' },
            { name: 'Chest', percent: 20, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=100&auto=format&fit=crop' },
        ],
        exercises: [
            {
                id: 1,
                name: 'Neutral Grip Dumbbell Press',
                sets: 4,
                reps: '8-12',
                isSuperset: true,
                supersetGroup: 'A',
                image: 'https://images.unsplash.com/photo-1541534741688-6078c64b52d2?q=80&w=100&auto=format&fit=crop'
            },
            {
                id: 2,
                name: '3 Point Dumbbell Row',
                sets: 4,
                reps: '8-12 per side',
                isSuperset: true,
                supersetGroup: 'A',
                image: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=100&auto=format&fit=crop'
            },
            {
                id: 3,
                name: 'Dumbbell Romanian Deadlift',
                sets: 3,
                reps: '10-15',
                isSuperset: true,
                supersetGroup: 'B',
                image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=100&auto=format&fit=crop'
            },
            {
                id: 4,
                name: 'Dumbbell Lateral Raises',
                sets: 3,
                reps: '10-20',
                isSuperset: true,
                supersetGroup: 'B',
                hasPR: true,
                image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=100&auto=format&fit=crop'
            }
        ]
    };

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
                <span className="text-xs font-bold secondary-text uppercase tracking-widest">Planned Workout</span>
                <h1 className="text-5xl font-display leading-none mb-1">{workout.name}</h1>
                <div className="text-sm secondary-text">{workout.exercises.length} Exercises • 45 Min</div>
            </div>

            <section className="mb-8">
                <h3 className="text-sm font-display mb-4 text-muted-foreground">Target Muscles</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {workout.targetMuscles.map(muscle => (
                        <Card key={muscle.name} className="min-w-[120px] bg-secondary border-none">
                            <CardContent className="p-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                                    <img src={muscle.image} alt={muscle.name} className="w-full h-full object-cover" />
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

            <section className="mb-32">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-display text-muted-foreground uppercase">{workout.exercises.length} Exercises</h3>
                    <Button variant="link" size="sm" className="text-primary p-0 h-auto">EDIT PLAN</Button>
                </div>

                <div className="flex flex-col gap-3">
                    {workout.exercises.map(ex => (
                        <Card key={ex.id} className="bg-secondary/40 border-muted overflow-hidden">
                            <CardContent className="p-3 flex gap-4 items-center">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                    <img src={ex.image} alt={ex.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black accent-text uppercase tracking-tighter">{ex.sets} SETS</span>
                                        {ex.isSuperset && (
                                            <span className="flex items-center gap-1 bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                                                <Zap size={8} fill="currentColor" />
                                                Superset {ex.supersetGroup}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-sm font-bold truncate leading-tight uppercase">{ex.name}</h4>
                                    <div className="text-xs text-muted-foreground uppercase">{ex.reps} reps</div>
                                </div>
                                {ex.hasPR && (
                                    <div className="w-8 h-8 flex items-center justify-center">
                                        <Trophy size={18} className="text-[#ffd700]" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pt-10 z-50 flex gap-4 max-w-[480px] mx-auto w-full">
                <Button variant="secondary" className="flex-1 h-14 font-black text-sm tracking-widest uppercase">WARMUP</Button>
                <Button className="flex-1 h-14 font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(0,255,102,0.3)] hover:shadow-[0_0_30px_rgba(0,255,102,0.5)]" onClick={onStart}>START WORKOUT</Button>
            </div>
        </div>
    );
};

export default WorkoutSummaryPage;
