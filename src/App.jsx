import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import OnboardingPage from './pages/OnboardingPage';
import BottomNav from './components/layout/BottomNav';
import {
  AUTH_LAST_FLOW_KEY,
  AUTH_LAST_USERNAME_KEY,
  AUTH_PENDING_INTENT_KEY,
  AUTH_SESSION_TOKEN_KEY,
} from './lib/authStorage';
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
  const [onboardingFlowActive, setOnboardingFlowActive] = useState(false);
  const [credentialSessionToken, setCredentialSessionToken] = useState(() => localStorage.getItem(AUTH_SESSION_TOKEN_KEY));

  const { isAuthenticated, isLoading } = useConvexAuth();

  const user = useQuery(api.users.current);
  const credentialUser = useQuery(
    api.users.getCurrentBySession,
    credentialSessionToken ? { sessionToken: credentialSessionToken } : 'skip'
  );

  const activeUser = isAuthenticated ? user : credentialUser;
  const userId = activeUser?._id;
  const authFlow = (() => {
    const pending = localStorage.getItem(AUTH_PENDING_INTENT_KEY);
    if (pending === 'signin' || pending === 'signup') return pending;
    return localStorage.getItem(AUTH_LAST_FLOW_KEY) || 'unknown';
  })();

  const swapExercise = useMutation(api.exercises.swapExercise);
  const ensureUser = useMutation(api.users.ensureUser);
  const signOutSession = useMutation(api.users.signOutSession);
  const bootstrapOnboardingProgram = useMutation(api.workouts.bootstrapOnboardingProgram);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  useEffect(() => {
    if (!isAuthenticated || user === undefined) return;

    const pendingIntent = localStorage.getItem(AUTH_PENDING_INTENT_KEY);

    if (user === null) {
      if (pendingIntent === 'signin') {
        localStorage.setItem(AUTH_LAST_FLOW_KEY, 'signin');
        localStorage.removeItem(AUTH_PENDING_INTENT_KEY);
        signOut();
        return;
      }

      ensureUser({ allowCreate: true });
      return;
    }

    if (pendingIntent === 'signin' || pendingIntent === 'signup') {
      localStorage.setItem(AUTH_LAST_FLOW_KEY, pendingIntent);
      localStorage.removeItem(AUTH_PENDING_INTENT_KEY);
    }
  }, [isAuthenticated, user, ensureUser]);

  const isCredentialLoading = !isAuthenticated && !!credentialSessionToken && credentialUser === undefined;
  const isAppAuthenticated = isAuthenticated || !!credentialUser;

  const handleCredentialAuth = ({ sessionToken, flow, username }) => {
    if (!sessionToken) return;
    localStorage.setItem(AUTH_SESSION_TOKEN_KEY, sessionToken);
    localStorage.setItem(AUTH_LAST_FLOW_KEY, flow);
    localStorage.setItem(AUTH_LAST_USERNAME_KEY, username);
    localStorage.removeItem(AUTH_PENDING_INTENT_KEY);
    setCredentialSessionToken(sessionToken);
  };

  const handleSignOut = async () => {
    if (credentialSessionToken) {
      try {
        await signOutSession({ sessionToken: credentialSessionToken });
      } catch {
        // no-op
      }
      localStorage.removeItem(AUTH_SESSION_TOKEN_KEY);
      setCredentialSessionToken(null);
    }

    if (isAuthenticated) {
      signOut();
    }

    localStorage.removeItem(AUTH_PENDING_INTENT_KEY);
  };

  const handleOnboardingStartWorkout = async (preferredWorkoutDays) => {
    if (!userId) throw new Error('User profile not ready. Please try again.');
    const result = await bootstrapOnboardingProgram({ userId, preferredWorkoutDays });
    if (!result?.workoutId) throw new Error('Could not create first workout.');

    setSelectedWorkoutId(result.workoutId);
    setSelectedWorkoutName(result.workoutName || 'First Workout');
    setSelectedDayStatus('current');
    setSelectedWorkoutCompleted(false);
    setActiveTab('workout');
    setCurrentView('active-workout');
    setOnboardingFlowActive(true);
  };

  const handleOnboardingGuideComplete = async () => {
    if (!userId) throw new Error('User profile not ready. Please try again.');
    await completeOnboarding({ userId });
    setOnboardingFlowActive(false);
    setActiveTab('dashboard');
    setCurrentView('dashboard');
  };

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
    if (isLoading || isCredentialLoading) return <div className="min-h-screen bg-background text-white flex items-center justify-center font-mono text-xs uppercase tracking-widest animate-pulse">Initializing System...</div>;
    if (isAuthenticated && user === undefined) return <div className="min-h-screen bg-background text-white flex items-center justify-center font-mono text-xs uppercase tracking-widest animate-pulse">Loading Profile...</div>;
    if (!isAppAuthenticated) return <AuthPage onCredentialAuth={handleCredentialAuth} />;

    const shouldShowOnboarding = !!activeUser && activeUser.onboardingCompleted !== true && !onboardingFlowActive && authFlow !== 'signin';
    if (shouldShowOnboarding) {
      return (
        <MotionDiv
          key="onboarding"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <OnboardingPage onComplete={handleOnboardingStartWorkout} />
        </MotionDiv>
      );
    }

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
              onboardingGuideEnabled={onboardingFlowActive && activeUser?.onboardingCompleted !== true}
              onOnboardingGuideComplete={handleOnboardingGuideComplete}
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
            <AccountPage user={activeUser} onSignOut={handleSignOut} />
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
      <main className="flex-1 w-full max-w-[480px] px-6 pb-24 relative">
        <AnimatePresence mode="wait">
          {renderView()}
        </AnimatePresence>
      </main>

      {(activeUser?.onboardingCompleted === true || authFlow === 'signin') && (
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
      )}
    </div>
  );
}

export default App;
