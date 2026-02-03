import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HomePage from './pages/HomePage';
import WorkoutSummaryPage from './pages/WorkoutSummaryPage';
import ActiveWorkoutPage from './pages/ActiveWorkoutPage';
import ProgressPage from './pages/ProgressPage';
import BottomNav from './components/layout/BottomNav';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('workout');
  const [currentView, setCurrentView] = useState('home');

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
            <HomePage onStartWorkout={() => setCurrentView('workout-summary')} />
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
              onBack={() => setCurrentView('home')}
              onStart={() => setCurrentView('active-workout')}
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
              onBack={() => setCurrentView('workout-summary')}
              onFinish={() => setCurrentView('home')}
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
            <ProgressPage />
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
