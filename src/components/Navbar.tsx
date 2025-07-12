import React from 'react';
import { User, LogIn, Home, LogOut, ArrowLeft, Bell, CheckCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRequests } from '../hooks/useRequests';
import { useMessages } from '../hooks/useMessages';
import { useState, useEffect } from 'react';

interface NavbarProps {
  onAuthAction?: () => void;
  showHomeButton?: boolean;
  onHomeClick?: () => void;
  onProfileClick?: () => void;
  onRequestsClick?: () => void;
  onAdminClick?: () => void;
  onMessagesClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  currentPage?: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onAuthAction, 
  showHomeButton, 
  onHomeClick, 
  onProfileClick,
  onRequestsClick,
  onAdminClick,
  onMessagesClick,
  showBackButton,
  onBackClick,
  currentPage
}) => {
  const { user, userProfile, logout } = useAuth();
  const { unreadCount } = useRequests();
  const { unreadCount: unreadMessagesCount } = useMessages();
  const [showBellNotification, setShowBellNotification] = useState(false);

  // Show bell notification when there are new unread requests
  useEffect(() => {
    if (unreadCount > 0) {
      setShowBellNotification(true);
      const timer = setTimeout(() => {
        setShowBellNotification(false);
      }, 3000); // Show for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by App.tsx useEffect
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Back button and Logo */}
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            {showBackButton && onBackClick && (
              <button
                onClick={onBackClick}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            {/* Logo */}
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <button
              onClick={onHomeClick}
              className="text-xl font-bold text-white hover:text-gray-200 transition-colors duration-200"
            >
              Skill Swap Platform
            </button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Admin Button */}
                {onAdminClick && (
                  <button
                    onClick={onAdminClick}
                    className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 font-medium text-sm"
                  >
                    Admin
                  </button>
                )}
                
                {/* Requests Bell Icon */}
                <button
                  onClick={onRequestsClick}
                  className="relative p-2 text-gray-300 hover:text-white transition-colors duration-200 group"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  
                  {/* Bell notification popup */}
                  {showBellNotification && unreadCount > 0 && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 z-50">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">New Request!</p>
                          <p className="text-xs text-gray-600">
                            You have {unreadCount} new skill swap request{unreadCount > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
                
                {/* Messages Icon */}
                <button
                  onClick={onMessagesClick}
                  className="relative p-2 text-gray-300 hover:text-white transition-colors duration-200 group"
                >
                  <MessageSquare className="w-6 h-6" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </span>
                  )}
                </button>
                
                {/* Profile Photo and Name */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onProfileClick}
                    className="flex items-center space-x-2 hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors"
                  >
                    <img
                      src={userProfile?.profilePhotoUrl || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-600"
                    />
                    <span className="text-white text-sm hidden sm:block">
                      {userProfile?.name || user.displayName || user.email}
                    </span>
                  </button>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            ) : showHomeButton ? (
              <button
                onClick={onHomeClick}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
            ) : (
              <>
                <button
                  onClick={onAuthAction}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  Login
                </button>
                <button
                  onClick={onAuthAction}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;