import React, { useState, useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

type Page = 'home' | 'login' | 'signup';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {currentPage === 'home' && (
        <HomePage 
          onNavigateLogin={() => setCurrentPage('login')}
          onNavigateSignup={() => setCurrentPage('signup')}
        />
      )}
      {currentPage === 'login' && (
        <LoginPage 
          onNavigateHome={() => setCurrentPage('home')}
          onNavigateSignup={() => setCurrentPage('signup')}
        />
      )}
      {currentPage === 'signup' && (
        <SignupPage 
          onNavigateHome={() => setCurrentPage('home')}
          onNavigateLogin={() => setCurrentPage('login')}
        />
      )}
    </>
  );
}

export default App;