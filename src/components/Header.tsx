// taskpilot-frontend/src/components/Header.tsx
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
// import { GlobalView } from '../App'; // Uncomment if GlobalView is exported as a type from App.tsx

// If GlobalView is not exported as a type, define it here as a union type:
type GlobalView = 'home' | 'app';

export interface HeaderProps {
  // Change the type of 'view' parameter to GlobalView
  onNavigate: (view: GlobalView) => void;
  isLandingPage?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, isLandingPage = false }) => {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error('Header must be used within a ThemeProvider');
  }
  const { theme, toggleTheme } = themeContext;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface dark:bg-dark-surface shadow-sm border-b border-border dark:border-dark-border py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-2xl font-heading font-bold text-primary dark:text-dark-primary cursor-pointer"
            onClick={() => onNavigate('home')}> {/* 'home' is a valid GlobalView */}
          TaskPilot
        </h1>
      </div>

      <nav className="flex items-center space-x-6">
        <button
          onClick={() => onNavigate('home')} // 'home' is a valid GlobalView
          className="text-primary dark:text-dark-primary font-medium hover:text-accent dark:hover:text-dark-accent transition-colors duration-200"
        >
          Home
        </button>
        {isLandingPage && (
          <button
            onClick={() => onNavigate('app')} // 'app' is a valid GlobalView
            className="px-5 py-2 bg-accent text-white rounded-full font-semibold hover:bg-accent-dark dark:bg-dark-accent dark:hover:bg-dark-accent-dark transition-colors duration-200 shadow-md"
          >
            Get Started
          </button>
        )}
        {!isLandingPage && (
          <button
            onClick={() => { alert('Logged out (mock)'); onNavigate('home');}} // 'home' is a valid GlobalView
            className="px-5 py-2 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-colors duration-200 shadow-md"
          >
            Logout
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </nav>
    </header>
  );
};

export default Header;