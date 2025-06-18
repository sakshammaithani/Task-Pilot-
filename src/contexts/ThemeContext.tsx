// taskpilot-frontend/src/contexts/ThemeContext.tsx
import React, { createContext, useState, useEffect } from 'react';

// 1. Define the interface for the context value
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// 2. Create the context with a default value that matches the interface
// The default value should be something that TypeScript can understand,
// even if it's a placeholder. For example, an object with empty functions
// and a default theme, or null to indicate it must be provided.
// Using `null` and checking for it in consumers is a common pattern.
export const ThemeContext = createContext<ThemeContextType | null>(null);
import type { ReactNode } from 'react';
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') { // Check if window is defined (for SSR compatibility)
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });

  // Apply theme class to HTML element and save to localStorage
  useEffect(() => {
    if (typeof document !== 'undefined') { // Check if document is defined
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Provide the context value
  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};