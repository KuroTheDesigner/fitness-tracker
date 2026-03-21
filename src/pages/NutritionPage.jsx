import React from 'react';
import { Card } from '@/components/ui/Card';
import { UtensilsCrossed } from 'lucide-react';

const NutritionPage = () => {
    return (
        <div className="screen min-h-[75vh] flex items-center justify-center animate-in fade-in duration-300">
            <Card className="w-full border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-secondary/60 to-background p-8 text-center shadow-[0_20px_80px_rgba(16,185,129,0.18)]">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/15 text-emerald-300">
                    <UtensilsCrossed size={24} />
                </div>
                <p className="text-[11px] uppercase tracking-[0.25em] font-black text-emerald-300 mb-2">Coming soon</p>
                <h2 className="text-2xl font-display mb-4">Nutrition Lab</h2>
                <p className="text-sm text-muted-foreground max-w-[320px] mx-auto leading-relaxed">
                    A Good rule of thumb is swap the portion size of your protein and carbs, then double your veggies and fruit.
                </p>
            </Card>
        </div>
    );
};

export default NutritionPage;
