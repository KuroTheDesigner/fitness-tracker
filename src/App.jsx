import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, LogOut } from 'lucide-react';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from '../convex/_generated/api';
import { signOut } from './shoo';
import HomePage from './pages/HomePage';
import WorkoutSummaryPage from './pages/WorkoutSummaryPage';
import ActiveWorkoutPage from './pages/ActiveWorkoutPage';
import ProgressPage from './pages/ProgressPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import SwapExercisePage from './pages/SwapExercisePage';
import AuthPage from './pages/AuthPage';
import NutritionPage from './pages/NutritionPage';
import LessonsPage from './pages/LessonsPage';
import AccountPage from './pages/AccountPage';
import DashboardPage from './pages/DashboardPage';
import BottomNav from './components/layout/BottomNav';
import './index.css';

function App() {
  const MotionDiv = motion.div;
  const [activeTab, setActiveTab] = useState('workout');
  const [currentView, setCurrentView] = useState('home');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [selectedWorkoutName, setSelectedWorkoutName] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedDayStatus, setSelectedDayStatus] = useState('current');
  const [selectedWorkoutCompleted, setSelectedWorkoutCompleted] = useState(false);

  const { isAuthenticated, isLoading } = useConvexAuth();

  // Get current active user from convex DB natively
  const user = useQuery(api.users.current);
  const userId = user?._id;

  const swapExercise = useMutation(api.exercises.swapExercise);
  const ensureUser = useMutation(api.users.ensureUser);

  // Auto-create user record on first sign-in
  useEffect(() => {
    if (isAuthenticated && user === null) {
      ensureUser();
    }
  }, [isAuthenticated, user, ensureUser]);

  const handleOpenWorkout = ({ workoutId, workoutName, dayStatus, isCompleted }) => {
    setSelectedWorkoutId(workoutId);
    setSelectedWorkoutName(workoutName);
    setSelectedDayStatus(dayStatus || 'current');
    setSelectedWorkoutCompleted(!!isCompleted);

    if (dayStatus === 'current') {
      setCurrentView('active-workout');
      return;
    }

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
    if (isLoading) return <div className="min-h-screen bg-background text-white flex items-center justify-center font-mono text-xs uppercase tracking-widest animate-pulse">Initializing System...</div>;
    if (!isAuthenticated) return <AuthPage />;

    switch (currentView) {
      case 'home':
        return (
          <MotionDiv
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <HomePage
              userId={userId}
              onOpenWorkout={handleOpenWorkout}
            />
          </MotionDiv>
        );
      case 'workout-summary':
        return (
          <MotionDiv
            key="summary"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <WorkoutSummaryPage
              workoutId={selectedWorkoutId}
              workoutName={selectedWorkoutName}
              dayStatus={selectedDayStatus}
              isCompleted={selectedWorkoutCompleted}
              onBack={() => setCurrentView('home')}
              onStart={() => setCurrentView('active-workout')}
              onViewExercise={handleViewExercise}
            />
          </MotionDiv>
        );
      case 'active-workout':
        return (
          <MotionDiv
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
              mode={selectedDayStatus === 'future' ? 'preview' : (selectedWorkoutCompleted ? 'history' : 'active')}
              onBack={() => setCurrentView(selectedDayStatus === 'current' ? 'home' : 'workout-summary')}
              onFinish={() => {
                if (selectedDayStatus === 'current') {
                  setSelectedWorkoutCompleted(true);
                  setSelectedDayStatus('past');
                }
                setCurrentView('workout-summary');
              }}
              onViewExercise={handleViewExercise}
              onSwapExercise={handleSwapExercise}
            />
          </MotionDiv>
        );
      case 'exercise-detail':
        return (
          <MotionDiv
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
          </MotionDiv>
        );
      case 'swap-exercise':
        return (
          <MotionDiv
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
          </MotionDiv>
        );
      case 'progress':
        return (
          <MotionDiv
            key="progress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ProgressPage userId={userId} />
          </MotionDiv>
        );
      case 'nutrition':
        return (
          <MotionDiv key="nutrition" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <NutritionPage />
          </MotionDiv>
        );
      case 'lessons':
        return (
          <MotionDiv key="lessons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <LessonsPage />
          </MotionDiv>
        );
      case 'account':
        return (
          <MotionDiv key="account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <AccountPage user={user} />
          </MotionDiv>
        );
      case 'dashboard':
        return (
          <MotionDiv key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <DashboardPage />
          </MotionDiv>
        );
      default:
        return (
          <MotionDiv
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="screen flex items-center justify-center"
          >
            <h1 className="text-2xl opacity-20">Coming Soon</h1>
          </MotionDiv>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center overflow-x-hidden">
      {/* Always-visible sign-out button */}
      {isAuthenticated && (
        <button
          onClick={signOut}
          className="fixed top-4 right-4 z-[100] w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-500/50 transition-all"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      )}
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
          else if (tab === 'dashboard') setCurrentView('dashboard');
          else if (tab === 'nutrition') setCurrentView('nutrition');
          else if (tab === 'account') setCurrentView('account');
          else if (tab === 'lessons') setCurrentView('lessons');
        }}
      />
    </div>
  );
}

export default App;
