import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import HomePage from './pages/HomePage';
import WorkoutSummaryPage from './pages/WorkoutSummaryPage';
import ActiveWorkoutPage from './pages/ActiveWorkoutPage';
import ProgressPage from './pages/ProgressPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import SwapExercisePage from './pages/SwapExercisePage';
import BottomNav from './components/layout/BottomNav';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('workout');
  const [currentView, setCurrentView] = useState('home');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [selectedWorkoutName, setSelectedWorkoutName] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Get user by clerkId (temporary hardcoded for demo)
  const user = useQuery(api.users.getByClerkId, { clerkId: "user_123" });
  const userId = user?._id;

  const swapExercise = useMutation(api.exercises.swapExercise);

  const handleStartWorkout = (workoutId, workoutName) => {
    setSelectedWorkoutId(workoutId);
    setSelectedWorkoutName(workoutName);
    setCurrentView('workout-summary');
  };

  const handleViewExercise = (exercise) => {
    setSelectedExercise(exercise);
    setCurrentView('exercise-detail');
  };

  const handleSwapExercise = (exercise) => {
    setSelectedExercise(exercise);
    setCurrentView('swap-exercise');
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <HomePage
              userId={userId}
              onStartWorkout={handleStartWorkout}
            />
          </motion.div>
        );
      case 'workout-summary':
        return (
          <motion.div
            key="summary"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <WorkoutSummaryPage
              workoutId={selectedWorkoutId}
              workoutName={selectedWorkoutName}
              onBack={() => setCurrentView('home')}
              onStart={() => setCurrentView('active-workout')}
              onViewExercise={handleViewExercise}
            />
          </motion.div>
        );
      case 'active-workout':
        return (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <ActiveWorkoutPage
              userId={userId}
              workoutId={selectedWorkoutId}
              workoutName={selectedWorkoutName}
              onBack={() => setCurrentView('workout-summary')}
              onFinish={() => setCurrentView('home')}
              onViewExercise={handleViewExercise}
              onSwapExercise={handleSwapExercise}
            />
          </motion.div>
        );
      case 'exercise-detail':
        return (
          <motion.div
            key="exercise-detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ExerciseDetailPage
              exercise={selectedExercise}
              userId={userId}
              onBack={() => {
                // Go back to previous view based on where we came from
                if (selectedWorkoutId) {
                  setCurrentView('active-workout');
                } else {
                  setCurrentView('home');
                }
              }}
            />
          </motion.div>
        );
      case 'swap-exercise':
        return (
          <motion.div
            key="swap-exercise"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <SwapExercisePage
              userId={userId}
              workoutExerciseToSwap={selectedExercise}
              onBack={() => setCurrentView('active-workout')}
              onSwapComplete={async (workoutExerciseId, newExerciseId) => {
                try {
                  await swapExercise({ workoutExerciseId, newExerciseId });
                  setCurrentView('active-workout');
                } catch (error) {
                  console.error('Failed to swap exercise:', error);
                }
              }}
            />
          </motion.div>
        );
      case 'progress':
        return (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ProgressPage userId={userId} />
          </motion.div>
        );
      default:
        return (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="screen flex items-center justify-center"
          >
            <h1 className="text-2xl opacity-20">Coming Soon</h1>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center overflow-x-hidden">
      <main className="flex-1 w-full max-w-[480px] px-6 pb-24 relative">
        <AnimatePresence mode="wait">
          {renderView()}
        </AnimatePresence>
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'workout') setCurrentView('home');
          else if (tab === 'progress') setCurrentView('progress');
          else setCurrentView(tab);
        }}
      />
    </div>
  );
}

export default App;
