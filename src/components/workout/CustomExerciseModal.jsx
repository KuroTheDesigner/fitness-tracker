import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { X, UserCircle2, Loader2, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PREDEFINED_MUSCLE_GROUPS = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes', 'Calves'
];

const CustomExerciseModal = ({ isOpen, onClose, userId, onExerciseCreated }) => {
    const MotionDiv = motion.div;
    const createCustomExercise = useMutation(api.exercises.createCustomExercise);

    const [name, setName] = useState('');
    const [selectedMuscles, setSelectedMuscles] = useState([]);
    const [equipment, setEquipment] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const toggleMuscle = (muscle) => {
        setSelectedMuscles(prev =>
            prev.includes(muscle)
                ? prev.filter(m => m !== muscle)
                : [...prev, muscle]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Exercise name is required.');
            return;
        }

        if (selectedMuscles.length === 0) {
            setError('Please select at least one muscle group.');
            return;
        }

        setIsSubmitting(true);

        try {
            const newExerciseId = await createCustomExercise({
                userId,
                name: name.trim(),
                muscleGroups: selectedMuscles,
                equipment: equipment.trim() || undefined,
                youtubeUrl: youtubeUrl.trim() || undefined,
            });

            // Clean up form
            setName('');
            setSelectedMuscles([]);
            setEquipment('');
            setYoutubeUrl('');

            if (onExerciseCreated) {
                // optionally fetch the new exercise object or just pass ID
                onExerciseCreated(newExerciseId);
            }
            onClose();
        } catch (err) {
            console.error('Failed to create custom exercise:', err);
            setError('Failed to create exercise. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 pb-20 sm:pb-4">
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                />

                <MotionDiv
                    initial={{ opacity: 0, y: "100%", scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: "100%", scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="flex justify-between items-center p-4 border-b border-border">
                        <div className="flex items-center gap-2 text-primary">
                            <Dumbbell size={20} />
                            <h2 className="text-lg font-display uppercase tracking-tight">Create Custom Exercise</h2>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground">
                            <X size={18} />
                        </Button>
                    </div>

                    <div className="overflow-y-auto p-6 flex-1">
                        <form id="custom-exercise-form" onSubmit={handleSubmit} className="space-y-6">

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Exercise Name *</label>
                                <Input
                                    placeholder="e.g. Bulgarian Split Squat"
                                    className="bg-secondary/50 border-none font-bold placeholder:font-normal"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength={50}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Target Muscle Groups *</label>
                                <div className="flex flex-wrap gap-2">
                                    {PREDEFINED_MUSCLE_GROUPS.map(muscle => (
                                        <button
                                            key={muscle}
                                            type="button"
                                            onClick={() => toggleMuscle(muscle)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-colors border ${selectedMuscles.includes(muscle)
                                                ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                                                : 'bg-transparent border-muted-foreground/30 text-muted-foreground hover:border-primary/50'
                                                }`}
                                        >
                                            {muscle}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Equipment Required (Optional)</label>
                                <Input
                                    placeholder="e.g. Dumbbells, Bench"
                                    className="bg-secondary/50 border-none font-bold placeholder:font-normal"
                                    value={equipment}
                                    onChange={(e) => setEquipment(e.target.value)}
                                    maxLength={50}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Video URL (Optional)</label>
                                <Input
                                    placeholder="https://youtube.com/..."
                                    type="url"
                                    className="bg-secondary/50 border-none font-bold placeholder:font-normal"
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                />
                            </div>

                            {error && (
                                <p className="text-destructive text-xs font-bold">{error}</p>
                            )}
                        </form>
                    </div>

                    <div className="p-4 border-t border-border bg-secondary/20">
                        <Button
                            type="submit"
                            form="custom-exercise-form"
                            disabled={isSubmitting}
                            className="w-full font-black uppercase tracking-widest"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                            {isSubmitting ? 'CREATING...' : 'SAVE EXERCISE'}
                        </Button>
                    </div>
                </MotionDiv>
            </div>
        </AnimatePresence>
    );
};

export default CustomExerciseModal;
