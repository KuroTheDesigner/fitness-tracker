import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ThumbsUp, Zap, Flame, Info, X } from 'lucide-react';

const EFFORT_LEVELS = [
    {
        id: 'easy',
        label: 'Easy',
        description: 'Could do 3+ more reps',
        icon: ThumbsUp,
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
        borderColor: 'border-green-400/30',
    },
    {
        id: 'ideal',
        label: 'Ideal',
        description: 'Could do 1-2 more reps',
        icon: Zap,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/30',
    },
    {
        id: 'max',
        label: 'Max',
        description: 'Couldn\'t do any more',
        icon: Flame,
        color: 'text-orange-400',
        bgColor: 'bg-orange-400/10',
        borderColor: 'border-orange-400/30',
    },
];

const EffortRating = ({ onSelect, onSkip, exerciseName }) => {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center">
            <div className="w-full max-w-[480px] animate-in slide-in-from-bottom-4 duration-300">
                <Card className="rounded-t-3xl rounded-b-none border-t border-x border-b-0 bg-background p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-display mb-1">How hard was that?</h3>
                            <p className="text-xs text-muted-foreground uppercase font-bold">
                                {exerciseName}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                                onClick={() => setShowInfo(!showInfo)}
                            >
                                <Info size={16} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                                onClick={onSkip}
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    </div>

                    {/* Info Panel */}
                    {showInfo && (
                        <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm">
                            <p className="text-muted-foreground mb-2">
                                <strong className="text-foreground">Progressive overload</strong> is key to muscle growth.
                            </p>
                            <p className="text-muted-foreground">
                                Aim for <strong className="text-primary">"Ideal"</strong> effort on most sets.
                                When sets become "Easy", increase the weight next time!
                            </p>
                        </div>
                    )}

                    {/* Effort Options */}
                    <div className="flex flex-col gap-3 mb-6">
                        {EFFORT_LEVELS.map(level => (
                            <button
                                key={level.id}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${level.bgColor} ${level.borderColor}`}
                                onClick={() => onSelect(level.id)}
                            >
                                <div className={`w-12 h-12 rounded-full ${level.bgColor} flex items-center justify-center`}>
                                    <level.icon size={24} className={level.color} />
                                </div>
                                <div className="text-left">
                                    <div className={`font-bold uppercase text-sm ${level.color}`}>
                                        {level.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {level.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Skip Button */}
                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground"
                        onClick={onSkip}
                    >
                        Skip for now
                    </Button>
                </Card>
            </div>
        </div>
    );
};

export default EffortRating;
