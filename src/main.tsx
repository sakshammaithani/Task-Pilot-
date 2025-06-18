// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// CORRECT: Import AuthProvider
import { AuthProvider } from './contexts/AuthContext'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Use AuthProvider here */}
    <AuthProvider> 
      <App />
    </AuthProvider>
  </React.StrictMode>,
);