import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Flame, Trophy } from 'lucide-react';

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

            {/* Muscle Focus */}
            <section className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Muscle Focus</h3>
                <Card className="bg-secondary p-4 border-none overflow-hidden">
                    <div className="flex flex-col items-center">
                        {pieData.length > 0 ? (
                            <>
                                <div className="relative w-full h-[180px]">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-[10px] font-black text-muted-foreground tracking-tighter uppercase">Volume</span>
                                    </div>
                                </div>
                                <div className="w-full flex flex-col gap-2 mt-4 px-4">
                                    {pieData.map(item => (
                                        <div key={item.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></div>
                                                <span className="text-xs font-bold uppercase">{item.name}</span>
                                            </div>
                                            <span className="text-xs font-black">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                                Log sets to see muscle breakdown
                            </div>
                        )}
                    </div>
                </Card>
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
