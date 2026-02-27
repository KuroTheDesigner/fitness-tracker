import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';

const DAYS = [
    { key: 'SUN', label: 'Sunday' },
    { key: 'MON', label: 'Monday' },
    { key: 'TUE', label: 'Tuesday' },
    { key: 'WED', label: 'Wednesday' },
    { key: 'THU', label: 'Thursday' },
    { key: 'FRI', label: 'Friday' },
    { key: 'SAT', label: 'Saturday' },
];

const PRESETS = [
    {
        key: 'starter-2',
        label: '2-Day Starter',
        description: 'Minimal schedule, easy to sustain',
        days: ['MON', 'THU'],
    },
    {
        key: 'balanced-three',
        label: '3-Day Balanced',
        description: 'Most common and recovery-friendly',
        days: ['MON', 'WED', 'FRI'],
    },
    {
        key: 'high-4',
        label: '4-Day High Frequency',
        description: 'Higher weekly volume',
        days: ['MON', 'TUE', 'THU', 'SAT'],
    },
];

const OnboardingPage = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [days, setDays] = useState(PRESETS[1].days);
    const [selectedPreset, setSelectedPreset] = useState(PRESETS[1].key);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const progressValue = ((step + 1) / 3) * 100;

    const canContinue = useMemo(() => {
        if (step < 2) return true;
        return days.length > 0;
    }, [step, days.length]);

    const toggleDay = (day) => {
        setDays((prev) => {
            const next = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day];
            const matchingPreset = PRESETS.find((preset) => preset.days.length === next.length && preset.days.every((presetDay) => next.includes(presetDay)));
            setSelectedPreset(matchingPreset?.key || null);
            return next;
        });
    };

    const applyPreset = (preset) => {
        setSelectedPreset(preset.key);
        setDays(preset.days);
    };

    const handleNext = async () => {
        if (step < 2) {
            setStep((prev) => prev + 1);
            return;
        }

        if (!onComplete || days.length === 0) return;
        setError('');
        setIsSubmitting(true);

        try {
            await onComplete(days);
        } catch (err) {
            setError(err?.message || 'Could not complete onboarding.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="screen animate-in fade-in duration-300 pb-8">
            <div className="mb-5">
                <p className="text-[10px] uppercase font-black tracking-[0.25em] text-primary">Onboarding</p>
                <h1 className="text-4xl font-display leading-tight mt-2">Let&apos;s build your first training week.</h1>
                <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground mt-2">~30 seconds to first workout</p>
            </div>

            <Card className="p-5 bg-secondary/30 border-muted min-h-[300px] flex flex-col">
                <div className="mb-5">
                    <div className="h-1.5 rounded-full bg-background/70 overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressValue}%` }} />
                    </div>
                </div>

                {step === 0 && (
                    <>
                        <p className="text-sm uppercase font-black tracking-widest text-muted-foreground mb-2">Step 1/3</p>
                        <h2 className="text-2xl font-display mb-3">Fast setup, real workout</h2>
                        <p className="text-sm text-muted-foreground">Pick your schedule, then jump directly into your first session. You&apos;ll complete a short guided checklist so there are no dead ends.</p>
                    </>
                )}

                {step === 1 && (
                    <>
                        <p className="text-sm uppercase font-black tracking-widest text-muted-foreground mb-2">Step 2/3</p>
                        <h2 className="text-2xl font-display mb-3">Pick a training rhythm</h2>
                        <p className="text-sm text-muted-foreground mb-4">Start with a preset now. You can still adjust exact days on the next step.</p>
                        <div className="space-y-2">
                            {PRESETS.map((preset) => {
                                const isSelected = selectedPreset === preset.key;
                                return (
                                    <button
                                        key={preset.key}
                                        type="button"
                                        className={`w-full rounded-lg border p-3 text-left transition ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background/40 hover:border-primary/40'}`}
                                        onClick={() => applyPreset(preset)}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-wide">{preset.label}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
                                            </div>
                                            {isSelected && <Check size={14} className="text-primary mt-0.5" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <p className="text-sm uppercase font-black tracking-widest text-muted-foreground mb-2">Step 3/3</p>
                        <h2 className="text-2xl font-display mb-4">Which days do you want to train?</h2>
                        <p className="text-xs text-muted-foreground mb-4">Selected: <span className="text-foreground font-bold">{days.length} day{days.length === 1 ? '' : 's'} / week</span></p>
                        <div className="grid grid-cols-2 gap-3">
                            {DAYS.map((day) => {
                                const selected = days.includes(day.key);
                                return (
                                    <button
                                        key={day.key}
                                        type="button"
                                        className={`rounded-lg border p-3 text-left transition ${selected ? 'border-primary bg-primary/10' : 'border-border bg-background/40 hover:border-primary/40'}`}
                                        onClick={() => toggleDay(day.key)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold uppercase tracking-wide">{day.label}</span>
                                            {selected && <Check size={14} className="text-primary" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {error && <p className="text-xs text-red-300 mt-4">{error}</p>}

                <div className="mt-auto pt-6 flex gap-3">
                    {step > 0 && (
                        <Button variant="outline" className="flex-1" onClick={() => setStep((prev) => prev - 1)} disabled={isSubmitting}>
                            Back
                        </Button>
                    )}
                    <Button className="flex-1" onClick={handleNext} disabled={!canContinue || isSubmitting}>
                        {step === 2 ? (isSubmitting ? 'Building Plan...' : 'Start First Workout') : 'Continue'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default OnboardingPage;
