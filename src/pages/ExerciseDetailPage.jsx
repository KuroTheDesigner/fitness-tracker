import React from 'react';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, History, BookOpen, Lightbulb, TrendingUp, Target } from 'lucide-react';

const ExerciseDetailPage = ({ exercise, onBack }) => {
    const ex = exercise || {
        name: 'Decline Push-Ups',
        youtubeId: 'W3M3pIsN_8k',
        primaryMuscles: ['Upper Chest'],
        secondaryMuscles: ['Front Delts', 'Triceps'],
        instructions: [
            'Cross the band over once and loop your arm into each hole as if you were putting on a backpack...',
            'Bring your shoulders down and away from your ears, brace your core, and flex your thighs and glutes...',
            'From here, push up and back until your arms fully straighten. Let your shoulder blades open up at the top...'
        ]
    };

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
                    <div className="rounded-2xl overflow-hidden mb-8 shadow-2xl bg-black border border-muted">
                        <iframe
                            width="100%"
                            height="200"
                            src={`https://www.youtube.com/embed/${ex.youtubeId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-[200px]"
                        ></iframe>
                    </div>

                    <section className="mb-8">
                        <h3 className="text-sm font-display mb-4 text-muted-foreground uppercase flex items-center gap-2">
                            <Target size={14} /> Muscle Groups
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {ex.primaryMuscles.map(m => (
                                <div key={m} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
                                    {m} <span className="text-[8px] opacity-60 ml-1">• PRIMARY</span>
                                </div>
                            ))}
                            {ex.secondaryMuscles.map(m => (
                                <div key={m} className="bg-secondary text-muted-foreground border border-muted px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
                                    {m} <span className="text-[8px] opacity-40 ml-1">• SECONDARY</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mb-8">
                        <h3 className="text-sm font-display mb-4 text-muted-foreground uppercase">Instructions</h3>
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6 flex gap-3">
                            <Lightbulb size={20} className="text-primary flex-shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                You can progress this by using a thicker band or you can increase the number of reps you do.
                            </p>
                        </div>
                        <div className="space-y-6">
                            {ex.instructions.map((step, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <span className="text-2xl font-display text-primary/30">{(idx + 1).toString().padStart(2, '0')}</span>
                                    <p className="text-sm text-foreground/80 leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </TabsContent>

                <TabsContent value="history" className="outline-none pt-10 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <TrendingUp size={32} className="text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">No history available yet.</p>
                    <p className="text-xs text-muted-foreground/40 mt-1">Complete this exercise to see analytics.</p>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ExerciseDetailPage;
