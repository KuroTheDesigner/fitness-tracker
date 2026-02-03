import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Info, MoreVertical, CheckCircle2, Trophy, Clock, Plus, Zap } from 'lucide-react';

const ActiveWorkoutPage = ({ onBack, onFinish }) => {
    const [completedSets, setCompletedSets] = useState(4);
    const totalSets = 22;

    const workout = {
        name: 'Workout A',
        exercises: [
            {
                id: 1,
                name: 'Neutral Grip Dumbbell Press',
                isSuperset: true,
                supersetGroup: 'A',
                sets: [
                    { id: '1a', prevWeight: 10, prevReps: 8, completed: true },
                    { id: '1b', prevWeight: 10, prevReps: 8, completed: false },
                ]
            },
            {
                id: 2,
                name: '3 Point Dumbbell Row',
                isSuperset: true,
                supersetGroup: 'A',
                sets: [
                    { id: '2a', prevWeight: 10, prevReps: 8, completed: false },
                    { id: '2b', prevWeight: 10, prevReps: 8, completed: false },
                ]
            }
        ]
    };

    return (
        <div className="screen animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-center py-2 mb-6">
                <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                    <ChevronLeft size={24} />
                </Button>
                <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Wednesday's Workout</span>
                    <h2 className="text-xl font-display">{workout.name}</h2>
                </div>
                <Button variant="outline" size="sm" className="font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground h-8" onClick={onFinish}>
                    FINISH
                </Button>
            </header>

            <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold uppercase">{completedSets}/{totalSets} Completed</span>
                    <span className="text-2xl font-display accent-text">{Math.round((completedSets / totalSets) * 100)}%</span>
                </div>
                <Progress value={(completedSets / totalSets) * 100} className="h-2 bg-muted" />
            </div>

            <div className="space-y-8">
                <div className="bg-secondary/20 rounded-xl p-4 border border-primary/10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded">
                            <Zap size={10} fill="currentColor" />
                            SUPERSET A
                        </div>
                    </div>

                    {workout.exercises.map(ex => (
                        <div key={ex.id} className="mb-10 last:mb-0">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-base font-black uppercase leading-tight tracking-tight mb-1 accent-text">{ex.name}</h3>
                                    <Button variant="link" className="text-[10px] text-muted-foreground p-0 h-auto uppercase font-bold">Add Notes</Button>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreVertical size={16} /></Button>
                            </div>

                            <div className="space-y-2">
                                <div className="grid grid-cols-5 gap-2 px-2 text-[9px] font-black text-muted-foreground uppercase opacity-50">
                                    <div className="text-center">SET</div>
                                    <div className="col-span-1 text-center">PREVIOUS</div>
                                    <div className="text-center">KG</div>
                                    <div className="text-center">REPS</div>
                                    <div className="text-right">EFFORT</div>
                                </div>

                                {ex.sets.map((set, idx) => (
                                    <div key={set.id} className={`grid grid-cols-5 gap-2 items-center p-2 rounded-lg transition-colors ${set.completed ? 'bg-primary/10 border border-primary/20' : 'bg-background/40 border border-transparent'}`}>
                                        <div className="text-center font-display text-lg">{idx + 1}{ex.supersetGroup}</div>
                                        <div className="text-center text-[10px] font-bold text-muted-foreground leading-none">
                                            {set.prevWeight}<span className="text-[8px] opacity-60">KG</span><br />
                                            {set.prevReps}<span className="text-[8px] opacity-60">REPS</span>
                                        </div>
                                        <Input
                                            type="number"
                                            placeholder={set.prevWeight}
                                            className="h-8 text-center bg-muted/30 border-none font-bold text-xs p-0"
                                        />
                                        <Input
                                            type="number"
                                            placeholder={set.prevReps}
                                            className="h-8 text-center bg-muted/30 border-none font-bold text-xs p-0"
                                        />
                                        <div className="flex justify-end">
                                            <button className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${set.completed ? 'bg-primary border-primary text-black' : 'border-muted'}`}>
                                                {set.completed ? <CheckCircle2 size={16} /> : <div className="w-1.5 h-1.5 rounded-full bg-muted" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button variant="secondary" size="sm" className="flex-1 h-8 text-[10px] font-bold gap-2 bg-muted/50">
                                    <Clock size={12} /> REST: 2:00
                                </Button>
                                <Button variant="secondary" size="sm" className="flex-1 h-8 text-[10px] font-bold gap-2 bg-muted/50">
                                    <Plus size={12} /> ADD SET
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActiveWorkoutPage;
