import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Play, Settings, User } from 'lucide-react';

const HomePage = ({ onStartWorkout }) => {
    const schedule = [
        { day: 'SUN', activity: 'Rest', type: 'rest' },
        { day: 'MON', activity: 'Rest', type: 'rest' },
        { day: 'TUE', activity: 'Workout C', type: 'workout', isCurrentDay: true },
        { day: 'WED', activity: 'Rest', type: 'rest' },
        { day: 'THU', activity: 'Workout A', type: 'workout' },
        { day: 'FRI', activity: 'Rest', type: 'rest' },
        { day: 'SAT', activity: 'Workout B', type: 'workout' },
    ];

    return (
        <div className="screen animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-center py-4 mb-4">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold secondary-text uppercase tracking-wider">Beginner Phase 2 • Lose Fat</span>
                    <h2 className="text-3xl font-display leading-tight">3-Day Full Body</h2>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full bg-muted/50">
                    <User size={20} />
                </Button>
            </header>

            <Card className="relative overflow-hidden h-[200px] border-none glow mb-8">
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-background/80 to-transparent p-6 flex flex-col justify-center">
                    <span className="text-sm font-bold accent-text uppercase tracking-widest mb-1">Today's Workout</span>
                    <h1 className="text-4xl font-display mb-4">Workout C</h1>
                    <Button
                        size="lg"
                        className="w-fit gap-2 font-bold"
                        onClick={() => onStartWorkout('Workout C')}
                    >
                        <Play size={18} fill="currentColor" />
                        GET STARTED
                    </Button>
                </div>
                <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop"
                    alt="Athlete"
                    className="absolute right-0 top-0 h-full w-1/2 object-cover grayscale opacity-60"
                />
            </Card>

            <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-display">This Week's Schedule</h3>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <Settings size={18} />
                    </Button>
                </div>

                <div className="flex flex-col gap-3">
                    {schedule.map((item) => (
                        <div
                            key={item.day}
                            className="flex items-center gap-4"
                        >
                            <div className={`w-10 font-display text-sm ${item.isCurrentDay ? 'accent-text' : 'text-muted-foreground'}`}>
                                {item.day}
                            </div>
                            <Card
                                className={`flex-1 flex justify-between items-center p-3 cursor-pointer transition-all hover:border-primary/50 ${item.type === 'rest' ? 'opacity-50' : ''}`}
                                onClick={item.type === 'workout' ? () => onStartWorkout(item.activity) : undefined}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'workout' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        {item.type === 'workout' ? <Play size={14} fill="currentColor" /> : <div className="w-2 h-2 rounded-full border-2 border-current" />}
                                    </div>
                                    <span className={`font-medium ${item.isCurrentDay ? 'text-foreground' : 'text-muted-foreground'}`}>{item.activity}</span>
                                </div>
                                {item.type === 'workout' && (
                                    <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] font-bold border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
                                        START
                                    </Button>
                                )}
                            </Card>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
