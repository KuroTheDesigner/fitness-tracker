import React from 'react';
import { Card } from '@/components/ui/Card';
import { GraduationCap } from 'lucide-react';

const LessonsPage = () => {
    return (
        <div className="screen min-h-[75vh] flex items-center justify-center animate-in fade-in duration-300">
            <Card className="w-full border border-sky-400/20 bg-gradient-to-br from-sky-500/10 via-secondary/60 to-background p-8 text-center shadow-[0_20px_80px_rgba(56,189,248,0.16)]">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/40 bg-sky-500/15 text-sky-300">
                    <GraduationCap size={24} />
                </div>
                <p className="text-[11px] uppercase tracking-[0.25em] font-black text-sky-300 mb-2">Coming soon</p>
                <h2 className="text-2xl font-display mb-4">Lessons</h2>
                <p className="text-sm text-muted-foreground max-w-[320px] mx-auto leading-relaxed">
                    Master the fundamentals: smart form, consistent effort, and tiny progress stacked daily beats intensity spikes every time.
                </p>
            </Card>
        </div>
    );
};

export default LessonsPage;
