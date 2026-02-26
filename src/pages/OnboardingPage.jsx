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

const OnboardingPage = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [days, setDays] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const canContinue = useMemo(() => {
        if (step < 2) return true;
        return days.length > 0;
    }, [step, days.length]);

    const toggleDay = (day) => {
        setDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
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
            </div>

            <Card className="p-5 bg-secondary/30 border-muted min-h-[300px] flex flex-col">
                {step === 0 && (
                    <>
                        <p className="text-sm uppercase font-black tracking-widest text-muted-foreground mb-2">Step 1/3</p>
                        <h2 className="text-2xl font-display mb-3">How this works</h2>
                        <p className="text-sm text-muted-foreground">You&apos;ll pick your workout days, then we&apos;ll take you straight into your first workout so you can set up exercises and supersets.</p>
                    </>
                )}

                {step === 1 && (
                    <>
                        <p className="text-sm uppercase font-black tracking-widest text-muted-foreground mb-2">Step 2/3</p>
                        <h2 className="text-2xl font-display mb-3">Quick goal check</h2>
                        <p className="text-sm text-muted-foreground">This starter setup is designed to get you logging quickly. You can refine volume, exercise selection, and progression after onboarding.</p>
                    </>
                )}

                {step === 2 && (
                    <>
                        <p className="text-sm uppercase font-black tracking-widest text-muted-foreground mb-2">Step 3/3</p>
                        <h2 className="text-2xl font-display mb-4">Which days do you want to train?</h2>
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
