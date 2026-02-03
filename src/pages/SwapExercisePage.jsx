import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ChevronLeft, ChevronRight, UserCircle2, Zap, LayoutGrid } from 'lucide-react';

const SwapExercisePage = ({ onBack, onSelectExercise }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const exercises = [
        { id: 101, name: 'Dumbbell Floor Press', isRecommended: true, image: 'https://images.unsplash.com/photo-1541534741688-6078c64b52d2?q=80&w=100&auto=format&fit=crop' },
        { id: 102, name: 'Decline Dumbbell Press', image: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=100&auto=format&fit=crop' },
        { id: 103, name: 'Push-Ups (Rest-Pause)', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=100&auto=format&fit=crop' },
    ];

    const muscleGroups = [
        { name: 'Chest', count: 31 },
        { name: 'Shoulders', count: 24 },
        { name: 'Biceps', count: 18 },
        { name: 'Triceps', count: 15 },
        { name: 'Back', count: 42 },
    ];

    return (
        <div className="screen animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pb-32">
            <header className="py-2 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                        <ChevronLeft size={24} />
                    </Button>
                    <h2 className="text-xl font-display uppercase tracking-tight">Select Exercise</h2>
                    <div className="w-10" />
                </div>
                <p className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-widest px-8">Choose the exercise you'd like to add.</p>
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
                <TabsList className="w-full bg-secondary/50 rounded-full h-12 p-1 mb-8">
                    <TabsTrigger value="all" className="flex-1 rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <LayoutGrid size={16} /> ALL
                    </TabsTrigger>
                    <TabsTrigger value="muscles" className="flex-1 rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Zap size={16} /> MUSCLE GROUPS
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="outline-none space-y-8">
                    <section>
                        <h3 className="text-[10px] font-black uppercase text-muted-foreground mb-4 tracking-widest">Recommended Alternatives</h3>
                        <div className="space-y-3">
                            {exercises.filter(ex => ex.isRecommended).map(ex => (
                                <Card key={ex.id} className="bg-secondary/40 border-muted overflow-hidden cursor-pointer hover:border-primary/50 transition-all group" onClick={() => onSelectExercise(ex)}>
                                    <div className="p-3 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                            <img src={ex.image} alt={ex.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-sm font-bold uppercase leading-tight group-hover:text-primary transition-colors">{ex.name}</span>
                                        </div>
                                        <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-[10px] font-black uppercase text-muted-foreground mb-4 tracking-widest">Other Alternatives</h3>
                        <div className="space-y-3">
                            {exercises.filter(ex => !ex.isRecommended).map(ex => (
                                <Card key={ex.id} className="bg-secondary/40 border-muted overflow-hidden cursor-pointer hover:border-primary/50 transition-all group" onClick={() => onSelectExercise(ex)}>
                                    <div className="p-3 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                            <img src={ex.image} alt={ex.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-sm font-bold uppercase leading-tight group-hover:text-primary transition-colors">{ex.name}</span>
                                        </div>
                                        <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>
                </TabsContent>

                <TabsContent value="muscles" className="outline-none space-y-3">
                    {muscleGroups.map(group => (
                        <Card key={group.name} className="bg-secondary/40 border-muted group cursor-pointer hover:border-primary/50 transition-all">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                    <Zap size={20} />
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm font-black uppercase block group-hover:text-primary transition-colors">{group.name}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{group.count} exercises</span>
                                </div>
                                <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pt-10 z-50 flex max-w-[480px] mx-auto w-full">
                <Button className="w-full h-14 font-black text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(0,255,102,0.2)]">ADD CUSTOM EXERCISE</Button>
            </div>
        </div>
    );
};

export default SwapExercisePage;
