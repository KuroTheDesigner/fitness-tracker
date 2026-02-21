import React, { useState, useMemo } from 'react';
import Model from 'react-body-highlighter';
import { Card } from '@/components/ui/Card';
import { aggregateMuscleVolumes, getVolumeColorMatrix } from '../../utils/volumeMath';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';

// Utility to safely map our backend taxonomy mapping to body-highlighter's rigid SVG id strings
const mapTaxonomyToModelString = (muscleName) => {
    if (!muscleName) return '';
    const name = muscleName.toLowerCase();

    // Exact mapping matches the react-body-highlighter default shapes
    const MapDict = {
        'chest': 'chest',
        'triceps': 'triceps',
        'biceps': 'biceps',
        'shoulders': 'front-deltoids',
        'back': 'upper-back',
        'lats': 'latissimus',
        'abs': 'abs',
        'quads': 'quadriceps',
        'hamstrings': 'hamstrings',
        'calves': 'calves',
        'glutes': 'gluteal',
        'forearms': 'forearm',
        'lower back': 'lower-back',
        'neck': 'neck'
    };

    return MapDict[name] || '';
};

export default function VolumeTracker({ recentSetsWithExercises }) {
    const [isBackView, setIsBackView] = useState(false);
    const [selectedMuscle, setSelectedMuscle] = useState(null);
    const [customTargets, setCustomTargets] = useState({});

    // 1. Convert nested arrays to the math engine signature
    const MathSignatureSets = useMemo(() => {
        if (!recentSetsWithExercises) return { sets: [], exercises: [] };

        const sets = [];
        const exercisesMap = new Map();

        recentSetsWithExercises.forEach(payload => {
            sets.push({ exerciseId: payload.exerciseId });
            if (payload.exercise && !exercisesMap.has(payload.exercise._id)) {
                exercisesMap.set(payload.exercise._id, payload.exercise);
            }
        });

        return { sets, exercises: Array.from(exercisesMap.values()) };
    }, [recentSetsWithExercises]);

    // 2. Perform exact Multi-Volume Math Engine mapping
    const volumeData = useMemo(() => {
        return aggregateMuscleVolumes(MathSignatureSets.sets, MathSignatureSets.exercises, customTargets);
    }, [MathSignatureSets, customTargets]);

    // 3. Translate Volume Math payloads directly into react-body-highlighter data props
    const modelData = useMemo(() => {
        const bodyData = [];

        Object.entries(volumeData).forEach(([muscleName, data]) => {
            const mappedName = mapTaxonomyToModelString(muscleName);
            if (mappedName) {
                // If the percentage is full, keep it strictly under 100 or scale it
                bodyData.push({
                    name: mappedName,
                    intensity: data.percentage, // Body Highlighter expects intensity. Usually undefined or number. We'll use custom colors via frequency, but the library only supports default gradient scales unless forced.
                });
            }
        });

        return bodyData;
    }, [volumeData]);

    const handleTargetUpdate = (muscle, value) => {
        const parsed = parseInt(value) || 6;
        setCustomTargets(prev => ({ ...prev, [muscle]: parsed }));
    };

    return (
        <div className="w-full flex justify-center py-6 px-4">
            <Card className="bg-secondary p-4 w-full flex flex-col items-center">
                <div className="flex w-full justify-between items-center mb-6">
                    <h3 className="text-sm font-black uppercase text-primary tracking-widest">3D Muscle Model</h3>
                    <Button
                        variant="ghost"
                        className="text-xs uppercase"
                        onClick={() => setIsBackView(!isBackView)}
                    >
                        FLIP VIEW TO {isBackView ? 'FRONT' : 'BACK'}
                    </Button>
                </div>

                <div className="relative w-full max-w-[200px] aspect-square flex items-center justify-center">
                    <Model
                        data={modelData}
                        style={{ height: '300px', width: '200px', padding: '1rem' }}
                        onClick={(exerciseData) => {
                            if (exerciseData.muscle) {
                                // Find original taxonomy name based on reverse lookup or just fallback
                                const originalName = Object.keys(volumeData).find(
                                    k => mapTaxonomyToModelString(k) === exerciseData.muscle
                                ) || exerciseData.muscle;
                                setSelectedMuscle(originalName);
                            }
                        }}
                        type={isBackView ? 'posterior' : 'anterior'}
                        highlightedColors={['#252528', '#FF3333', '#FF8C00', '#FFD700', '#A3FF00', '#00FF66']}
                    />
                </div>

                {/* Edit Modal */}
                {selectedMuscle && (
                    <Dialog open={!!selectedMuscle} onOpenChange={() => setSelectedMuscle(null)}>
                        <DialogContent className="max-w-xs bg-secondary border-muted">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-display uppercase text-primary">Target: {selectedMuscle}</DialogTitle>
                            </DialogHeader>
                            <div className="p-4 flex flex-col items-center gap-4">
                                <div className="text-center">
                                    <p className="font-bold text-muted-foreground uppercase text-xs">Current Weekly Target</p>
                                    <h4 className="font-display text-4xl">{customTargets[selectedMuscle] || 6} Sets</h4>
                                </div>
                                <div className="w-full flex items-center justify-center gap-2">
                                    <Input
                                        type="number"
                                        className="h-12 w-24 text-center font-display text-lg px-2"
                                        placeholder="Goal"
                                        defaultValue={customTargets[selectedMuscle] || 6}
                                        onBlur={(e) => handleTargetUpdate(selectedMuscle, e.target.value)}
                                    />
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </Card>
        </div>
    );
}
