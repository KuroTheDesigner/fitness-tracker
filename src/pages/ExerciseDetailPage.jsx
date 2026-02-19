import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, History, BookOpen, Lightbulb, TrendingUp, Target, Dumbbell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const ExerciseDetailPage = ({ exercise: incomingExercise, userId, onBack }) => {
    // Handle both cases: passing an exercise directly, or a workoutExercise which has an exercise nested
    const actualExerciseId = incomingExercise?.exerciseId || incomingExercise?._id;
    const ex = incomingExercise?.exercise || incomingExercise || {
        name: 'Exercise Details',
        primaryMuscles: [],
        secondaryMuscles: [],
        instructions: ['No instructions available.'],
        youtubeUrl: null,
    };

    // Extract youtube ID from URL if present
    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };
    const youtubeId = incomingExercise?.youtubeId || getYoutubeId(ex.youtubeUrl);

    // Fetch history
    const history = useQuery(
        api.workouts.getExerciseHistory,
        (userId && actualExerciseId) ? { userId, exerciseId: actualExerciseId } : "skip"
    );

    // Process history data for the chart (grouped by date, taking max weight of the day)
    const chartData = useMemo(() => {
        if (!history || history.length === 0) return [];

        const groupedByDate = {};
        history.forEach(session => {
            const dateStr = format(new Date(session.completedAt), 'MMM dd');
            if (session.weight) {
                if (!groupedByDate[dateStr] || session.weight > groupedByDate[dateStr].weight) {
                    groupedByDate[dateStr] = {
                        dateStr,
                        weight: session.weight,
                        reps: session.reps
                    };
                }
            }
        });

        // Reverse to show oldest to newest on chart
        return Object.values(groupedByDate).reverse();
    }, [history]);

    return (
        <div className="screen animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto pb-10">
            <header className="flex justify-between items-center py-2 mb-6">
                <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                    <ChevronLeft size={24} />
                </Button>
                <h2 className="text-xl font-display truncate max-w-[250px]">{ex.name}</h2>
                <div className="w-10" />
            </header>

            <Tabs defaultValue="guide" className="w-full">
                <TabsList className="w-full bg-secondary/50 rounded-full h-12 p-1 mb-8">
                    <TabsTrigger value="guide" className="flex-1 rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <BookOpen size={16} /> FORM GUIDE
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex-1 rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <History size={16} /> HISTORY
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="guide" className="outline-none">
                    {youtubeId ? (
                        <div className="rounded-2xl overflow-hidden mb-8 shadow-2xl bg-black border border-muted">
                            <iframe
                                width="100%"
                                height="200"
                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-[200px]"
                            ></iframe>
                        </div>
                    ) : (
                        ex.thumbnailUrl && (
                            <div className="rounded-2xl overflow-hidden mb-8 shadow-2xl border border-muted h-[200px]">
                                <img src={ex.thumbnailUrl} alt={ex.name} className="w-full h-full object-cover" />
                            </div>
                        )
                    )}

                    <section className="mb-8">
                        <h3 className="text-sm font-display mb-4 text-muted-foreground uppercase flex items-center gap-2">
                            <Target size={14} /> Muscle Groups
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {ex.muscleGroups?.map(m => (
                                <div key={m} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
                                    {m}
                                </div>
                            )) || (
                                    ex.primaryMuscles?.map(m => (
                                        <div key={m} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
                                            {m} <span className="text-[8px] opacity-60 ml-1">• PRIMARY</span>
                                        </div>
                                    ))
                                )}
                            {ex.secondaryMuscles?.map(m => (
                                <div key={m} className="bg-secondary text-muted-foreground border border-muted px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
                                    {m} <span className="text-[8px] opacity-40 ml-1">• SECONDARY</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-sm font-display mb-4 text-muted-foreground uppercase">Instructions</h3>
                        {ex.instructions ? (
                            <div className="space-y-6">
                                {ex.instructions.map((step, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <span className="text-2xl font-display text-primary/30">{(idx + 1).toString().padStart(2, '0')}</span>
                                        <p className="text-sm text-foreground/80 leading-relaxed">{step}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6 flex gap-3">
                                <Lightbulb size={20} className="text-primary flex-shrink-0" />
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    No detailed instructions available for this exercise. Focus on maintaining proper form and controlled movements.
                                </p>
                            </div>
                        )}
                    </section>
                </TabsContent>

                <TabsContent value="history" className="outline-none pt-4">
                    {history === undefined ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Loading history...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-20">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <TrendingUp size={32} className="text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">No history available yet.</p>
                            <p className="text-xs text-muted-foreground/40 mt-1">Complete this exercise to see analytics.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in duration-500 delay-150 fill-mode-both">
                            {/* Chart */}
                            {chartData.length > 1 && (
                                <section>
                                    <div className="flex justify-between items-end mb-4">
                                        <h3 className="text-sm font-display text-muted-foreground uppercase">Weight Progression</h3>
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-sm">Max Weight</span>
                                    </div>
                                    <div className="h-[200px] w-full bg-secondary/20 rounded-xl p-4 border border-border">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                                <XAxis
                                                    dataKey="dateStr"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#888', fontSize: 10 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#888', fontSize: 10 }}
                                                />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                                                    itemStyle={{ color: '#00ff66', fontWeight: 'bold' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="weight"
                                                    stroke="#00ff66"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#00ff66', strokeWidth: 2, r: 4 }}
                                                    activeDot={{ r: 6, fill: '#fff', stroke: '#00ff66' }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </section>
                            )}

                            {/* Recent Sets List */}
                            <section>
                                <h3 className="text-sm font-display mb-4 text-muted-foreground uppercase">Recent Sets</h3>
                                <div className="space-y-3">
                                    {history.map((session) => (
                                        <div key={session._id} className="bg-secondary/40 border border-muted p-4 rounded-xl flex items-center justify-between">
                                            <div>
                                                <div className="text-xs font-bold text-muted-foreground uppercase mb-1">
                                                    {format(new Date(session.completedAt), 'MMM dd, yyyy')}
                                                </div>
                                                <div className="text-sm font-black flex items-center gap-2">
                                                    <span>Set {session.setNumber}</span>
                                                    {session.isPR && (
                                                        <span className="bg-[#ffd700]/20 text-[#ffd700] text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">PR</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-display text-primary">
                                                    {session.weight ? `${session.weight} kg` : 'Bodyweight'}
                                                </div>
                                                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    {session.reps} Reps
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ExerciseDetailPage;
