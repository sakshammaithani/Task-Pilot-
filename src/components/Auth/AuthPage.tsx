// taskpilot-frontend/src/components/Auth/AuthPage.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import GoogleIcon from './GoogleIcon'; // We'll create this icon component next

const AuthPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-dark-background text-primary dark:text-dark-primary font-sans">
      <div className="bg-surface dark:bg-dark-surface p-8 rounded-lg shadow-xl border border-border dark:border-dark-border text-center max-w-md w-full">
        <h2 className="text-3xl font-heading font-bold mb-6">Join TaskPilot</h2>
        <p className="text-secondary mb-8">Sign in or create an account to start organizing your life.</p>

        <button
          onClick={login}
          className="w-full flex items-center justify-center px-6 py-3 bg-white text-primary rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 border border-gray-300 dark:bg-dark-card dark:text-dark-primary dark:border-dark-border dark:hover:bg-dark-border"
        >
          <GoogleIcon className="w-5 h-5 mr-3" />
          Sign in with Google
        </button>

        <p className="text-sm text-tertiary mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;