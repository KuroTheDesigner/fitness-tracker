import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Flame, Trophy, Calendar, TrendingUp } from 'lucide-react';

const ProgressPage = () => {
    const chartData = [
        { day: 'M', value: 1 },
        { day: 'T', value: 3 },
        { day: 'W', value: 2 },
        { day: 'T', value: 0 },
        { day: 'F', value: 4 },
        { day: 'S', value: 3 },
        { day: 'S', value: 0 },
    ];

    const pieData = [
        { name: 'Chest', value: 40, color: '#00ff66' },
        { name: 'Back', value: 30, color: '#16a34a' },
        { name: 'Legs', value: 30, color: '#14532d' },
    ];

    const prs = [
        { id: 1, exercise: 'Dumbbell Romanian Deadlift', value: '45kg', date: '2 days ago' },
        { id: 2, exercise: 'Neutral Grip Dumbbell Press', value: '25kg', date: 'Yesterday' },
    ];

    return (
        <div className="screen animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-5xl font-display leading-tight tracking-tight">Analytics</h1>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="bg-secondary/40 border-none glow flex flex-col items-center justify-center p-6 text-center">
                    <Flame size={32} className="accent-text mb-2 animate-pulse" />
                    <div className="text-5xl font-display leading-none">12</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Day Streak</div>
                </Card>
                <Card className="bg-secondary/40 border-none flex flex-col items-center justify-center p-6 text-center">
                    <Trophy size={32} className="text-[#ffd700] mb-2" />
                    <div className="text-5xl font-display leading-none">08</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">New PRs</div>
                </Card>
            </div>

            <section className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Weekly Activity</h3>
                <Card className="bg-secondary p-4 border-none">
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
                </Card>
            </section>

            <section className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Muscle Focus</h3>
                <Card className="bg-secondary p-4 border-none overflow-hidden">
                    <div className="flex flex-col items-center">
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
                    </div>
                </Card>
            </section>

            <section className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Recent PRs</h3>
                <div className="flex flex-col gap-2">
                    {prs.map(pr => (
                        <Card key={pr.id} className="bg-secondary/40 border-muted p-3">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                    <Trophy size={18} className="text-[#ffd700]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black uppercase text-muted-foreground mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{pr.exercise}</div>
                                    <div className="text-[9px] font-bold uppercase text-muted-foreground/60">{pr.date}</div>
                                </div>
                                <div className="text-2xl font-display accent-text leading-none">{pr.value}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ProgressPage;
