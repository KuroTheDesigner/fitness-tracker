import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Settings, User, LogOut } from 'lucide-react';
import { useWorkout } from '@/hooks/useWorkout';
import { signOut } from '@/shoo';

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const HomePage = ({ userId, onStartWorkout }) => {
    const { program, schedule, isLoading } = useWorkout(userId);


    // Get current day of week
    const today = DAYS_OF_WEEK[new Date().getDay()];

    // Build weekly schedule from backend data
    const weeklySchedule = DAYS_OF_WEEK.map(day => {
        const workout = schedule?.find(w => w.dayOfWeek === day);
        return {
            day,
            activity: workout?.name || 'Rest',
            type: workout ? 'workout' : 'rest',
            isCurrentDay: day === today,
            workoutId: workout?._id,
        };
    });

    // Find today's workout
    const todaysWorkout = weeklySchedule.find(w => w.isCurrentDay && w.type === 'workout');

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="screen animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex justify-between items-center py-4 mb-4">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                </header>

                <Skeleton className="h-[200px] w-full rounded-lg mb-8" />

                <section className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-8 w-8 rounded" />
                    </div>
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="w-10 h-4" />
                                <Skeleton className="flex-1 h-14 rounded-lg" />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="screen animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Edge-to-Edge Hero Card */}
            <div className="relative overflow-hidden h-[300px] border-none -mx-6 mb-8 bg-background shadow-[0_10px_40px_rgba(0,255,102,0.05)] border-b border-primary/20">
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-background/90 to-background/10 p-8 flex flex-col justify-end pb-10">
                    {todaysWorkout ? (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-150">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-black accent-text uppercase tracking-widest">Today's Protocol</span>
                            </div>
                            <h1 className="text-[40px] font-display leading-[0.9] tracking-tighter mb-6 uppercase drop-shadow-[0_0_10px_rgba(0,255,102,0.3)]">{todaysWorkout.activity}</h1>
                            <Button
                                size="lg"
                                className="w-fit h-12 px-6 gap-3 font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,102,0.2)]"
                                onClick={() => onStartWorkout(todaysWorkout.workoutId, todaysWorkout.activity)}
                            >
                                <Play size={16} fill="currentColor" />
                                INITIALIZE
                            </Button>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-700 delay-150">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Today</span>
                            <h1 className="text-5xl font-display mb-4 uppercase text-muted-foreground/50 tracking-tighter">Rest Day</h1>
                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">System Repair Sequence</p>
                        </div>
                    )}
                </div>
                <img
                    src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop"
                    alt="Athlete"
                    className="absolute right-0 top-0 h-full w-[80%] object-cover grayscale opacity-40 mix-blend-screen [mask-image:linear-gradient(to_left,black_20%,transparent_100%)]"
                />
            </div>

            {/* Weekly Schedule Section */}
            <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-display">This Week's Schedule</h3>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 transition-colors" onClick={signOut}>
                        <LogOut size={18} />
                    </Button>
                </div>

                <div className="flex flex-col gap-3">
                    {weeklySchedule.map((item) => (
                        <div
                            key={item.day}
                            className="flex items-center gap-4"
                        >
                            <div className={`w-10 font-display text-sm ${item.isCurrentDay ? 'accent-text' : 'text-muted-foreground'}`}>
                                {item.day}
                            </div>
                            <Card
                                className={`flex-1 flex justify-between items-center p-3 cursor-pointer transition-all hover:border-primary/50 ${item.type === 'rest' ? 'opacity-50' : ''}`}
                                onClick={item.type === 'workout' ? () => onStartWorkout(item.workoutId, item.activity) : undefined}
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
