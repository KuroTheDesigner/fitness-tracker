import React from 'react';
import { Card } from '@/components/ui/Card';
import { Flame, HeartPulse, Target } from 'lucide-react';

const DashboardPage = () => {
    return (
        <div className="screen animate-in fade-in duration-300 pb-8">
            <h1 className="text-4xl font-display mb-6">Dashboard</h1>

            <Card className="p-5 mb-4 bg-gradient-to-br from-primary/20 to-secondary border-primary/30">
                <p className="text-[10px] uppercase tracking-widest font-black text-primary mb-1">Today</p>
                <h2 className="text-2xl font-display mb-2">Stay Relentless</h2>
                <p className="text-sm text-muted-foreground">Open Workout to start your scheduled session and lock in your volume target.</p>
            </Card>

            <div className="grid grid-cols-3 gap-3">
                <Card className="p-4 text-center bg-secondary/40 border-muted"><Flame size={20} className="mx-auto mb-2 text-primary" /><p className="text-[10px] uppercase font-black text-muted-foreground">Streak</p><p className="text-xl font-display">--</p></Card>
                <Card className="p-4 text-center bg-secondary/40 border-muted"><Target size={20} className="mx-auto mb-2 text-primary" /><p className="text-[10px] uppercase font-black text-muted-foreground">Volume</p><p className="text-xl font-display">--</p></Card>
                <Card className="p-4 text-center bg-secondary/40 border-muted"><HeartPulse size={20} className="mx-auto mb-2 text-primary" /><p className="text-[10px] uppercase font-black text-muted-foreground">Recovery</p><p className="text-xl font-display">--</p></Card>
            </div>
        </div>
    );
};

export default DashboardPage;
