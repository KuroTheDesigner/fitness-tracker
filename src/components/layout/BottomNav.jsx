import React from 'react';
import { Utensils, LayoutDashboard, Dumbbell, TrendingUp, User } from 'lucide-react';
import './BottomNav.css';

const BottomNav = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'nutrition', label: 'Nutrition', icon: Utensils },
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'workout', label: 'Workout', icon: Dumbbell },
        { id: 'progress', label: 'Progress', icon: TrendingUp },
        { id: 'account', label: 'Account', icon: User },
    ];

    return (
        <nav className="bottom-nav">
            <div className="bottom-nav-container">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => onTabChange(tab.id)}
                        >
                            <Icon size={24} className="nav-icon" />
                            <span className="nav-label">{tab.label}</span>
                            {isActive && <div className="active-indicator" />}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
