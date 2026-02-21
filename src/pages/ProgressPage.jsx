import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Flame, Trophy, Calendar, TrendingUp } from 'lucide-react';
import VolumeTracker from '@/components/progress/VolumeTracker';

const MUSCLE_COLORS = [
    '#00ff66', // Primary green
    '#16a34a', // Green 600
    '#14532d', // Green 900
    '#0d9488', // Teal
    '#10b981', // Emerald
];

const ProgressPage = ({ userId }) => {
    // Fetch data from Convex
    const stats = useQuery(api.progress.getUserStats, userId ? { userId } : "skip");
    const weeklyActivity = useQuery(api.progress.getWeeklyActivity, userId ? { userId } : "skip");
    const muscleBreakdown = useQuery(api.progress.getMuscleBreakdown, userId ? { userId } : "skip");
    const recentPRs = useQuery(api.progress.getRecentPRs, userId ? { userId } : "skip");

    const isLoading = stats === undefined || weeklyActivity === undefined;

    // Format chart data
    const chartData = weeklyActivity?.map(d => ({
        day: d.day.charAt(0),
        value: d.sets || 0,
    })) || [];

    const pieData = muscleBreakdown?.slice(0, 5).map((m, i) => ({
        name: m.name,
        value: m.percent,
        color: MUSCLE_COLORS[i % MUSCLE_COLORS.length],
    })) || [];

    // Format date for PRs
    const formatDate = (timestamp) => {
        const now = Date.now();
        const diff = now - timestamp;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="screen animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
                <header className="mb-8">
                    <Skeleton className="h-12 w-48" />
                </header>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <Skeleton className="h-32 rounded-lg" />
                    <Skeleton className="h-32 rounded-lg" />
                </div>
                <Skeleton className="h-48 w-full rounded-lg mb-8" />
                <Skeleton className="h-64 w-full rounded-lg mb-8" />
            </div>
        );
    }

    return (
        <div className="screen animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-5xl font-display leading-tight tracking-tight">Analytics</h1>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="bg-secondary/40 border-none glow flex flex-col items-center justify-center p-6 text-center">
                    <Flame size={32} className="accent-text mb-2 animate-pulse" />
                    <div className="text-5xl font-display leading-none">
                        {String(stats?.currentStreak || 0).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Day Streak</div>
                </Card>
                <Card className="bg-secondary/40 border-none flex flex-col items-center justify-center p-6 text-center">
                    <Trophy size={32} className="text-[#ffd700] mb-2" />
                    <div className="text-5xl font-display leading-none">
                        {String(stats?.prCount || 0).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Total PRs</div>
                </Card>
            </div>

            {/* Weekly Activity */}
            <section className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Weekly Activity</h3>
                <Card className="bg-secondary p-4 border-none">
                    {chartData.length > 0 ? (
                        <div style={{ width: '100%', height: 180 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData}>
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 700 }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        radius={[4, 4, 0, 0]}
                                        fill="#00ff66"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.value > 0 ? '#00ff66' : '#1f2937'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                            Complete workouts to see activity
                        </div>
                    )}
                </Card>
            </section>

            {/* Interactive 3D Muscle Volume Tracker */}
            <section className="mb-8 w-full flex justify-center">
                <VolumeTracker recentSetsWithExercises={muscleBreakdown} />
            </section>

            {/* Recent PRs */}
            <section className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Recent PRs</h3>
                <div className="flex flex-col gap-2">
                    {recentPRs?.length > 0 ? (
                        recentPRs.map(pr => (
                            <Card key={pr._id} className="bg-secondary/40 border-muted p-3">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                        <Trophy size={18} className="text-[#ffd700]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-black uppercase text-muted-foreground mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                            {pr.exerciseName}
                                        </div>
                                        <div className="text-[9px] font-bold uppercase text-muted-foreground/60">
                                            {formatDate(pr.achievedAt)}
                                        </div>
                                    </div>
                                    <div className="text-2xl font-display accent-text leading-none">{pr.value}kg</div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card className="bg-secondary/40 border-muted p-6 text-center">
                            <Trophy size={32} className="text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No PRs yet. Start lifting!</p>
                        </Card>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ProgressPage;
