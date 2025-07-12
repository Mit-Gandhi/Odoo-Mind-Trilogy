import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import RequestsPage from './pages/RequestsPage';
import AdminPage from './pages/AdminPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSwapsPage from './pages/AdminSwapsPage';
import AdminMessagesPage from './pages/AdminMessagesPage';
import MessagesPage from './pages/MessagesPage';
import BannedPage from './pages/BannedPage';

type Page = 'home' | 'login' | 'signup' | 'profile' | 'user-profile' | 'requests' | 'admin' | 'admin-users' | 'admin-swaps' | 'admin-messages' | 'messages' | 'banned';

function App() {
  const { user, userProfile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Handle navigation after authentication changes
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Check if user is banned
        if (userProfile?.isBanned) {
          setCurrentPage('banned');
          return;
        }
        
        // User is logged in
        if (!userProfile || !userProfile.isProfileComplete) {
          // New user or incomplete profile - redirect to profile page
          if (currentPage !== 'profile') {
            setCurrentPage('profile');
          }
        } else {
          // Existing user with complete profile
          if (currentPage === 'login' || currentPage === 'signup') {
            // Just logged in - redirect to home
            setCurrentPage('home');
          }
          // If already on other pages, don't redirect
        }
      } else {
        // User is not logged in - always show home page with public profiles
        if (currentPage !== 'home' && currentPage !== 'login' && currentPage !== 'signup') {
          setCurrentPage('home');
        }
      }
    }
  }, [user, userProfile, loading, currentPage]);

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
          onNavigateProfile={() => setCurrentPage('profile')}
          onNavigateRequests={() => setCurrentPage('requests')}
          onNavigateAdmin={() => setCurrentPage('admin')}
          onNavigateMessages={() => setCurrentPage('messages')}
          onViewUserProfile={(userId: string) => {
            setSelectedUserId(userId);
            setCurrentPage('user-profile');
          }}
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
      {currentPage === 'profile' && (
        <ProfilePage 
          onNavigateHome={() => setCurrentPage('home')}
          onNavigateBack={() => setCurrentPage('home')}
          onNavigateMessages={() => setCurrentPage('messages')}
        />
      )}
      {currentPage === 'user-profile' && selectedUserId && (
        <UserProfilePage 
          userId={selectedUserId}
          onNavigateHome={() => setCurrentPage('home')}
          onNavigateBack={() => setCurrentPage('home')}
          onNavigateMessages={() => setCurrentPage('messages')}
        />
      )}
      {currentPage === 'requests' && (
        <RequestsPage 
          onNavigateHome={() => setCurrentPage('home')}
          onNavigateBack={() => setCurrentPage('home')}
        />
      )}
      {currentPage === 'admin' && (
        <AdminPage 
          onNavigateHome={() => setCurrentPage('home')}
          onNavigateUsers={() => setCurrentPage('admin-users')}
          onNavigateSwaps={() => setCurrentPage('admin-swaps')}
          onNavigateMessages={() => setCurrentPage('admin-messages')}
          onNavigateMessages={() => setCurrentPage('admin-messages')}
        />
      )}
      {currentPage === 'admin-users' && (
        <AdminUsersPage 
          onNavigateHome={() => setCurrentPage('home')}
          onNavigateBack={() => setCurrentPage('admin')}
        />
      )}
      {currentPage === 'admin-swaps' && (
        <AdminSwapsPage 
          onNavigateHome={() => setCurrentPage('home')}
          onNavigateBack={() => setCurrentPage('admin')}
        />
      )}
      {currentPage === 'admin-messages' && (
        <AdminMessagesPage 
          onNavigateHome={() => setCurrentPage('home')}
          onNavigateBack={() => setCurrentPage('admin')}
        />
      )}
      {currentPage === 'messages' && (
        <MessagesPage 
          onNavigateHome={() => setCurrentPage('home')}
          onNavigateBack={() => setCurrentPage('home')}
        />
      )}
      {currentPage === 'banned' && (
        <BannedPage />
      )}
    </>
  );
}

export default App;