import React, { useState } from 'react';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { createAdminMessage } from '../services/messageService';
import Navbar from '../components/Navbar';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';

interface AdminMessagesPageProps {
  onNavigateHome: () => void;
  onNavigateBack: () => void;
}

const AdminMessagesPage: React.FC<AdminMessagesPageProps> = ({ onNavigateHome, onNavigateBack }) => {
  const { user, userProfile, loading } = useAuth();
  const { notifications, removeNotification, showSuccess, showError } = useNotification();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  React.useEffect(() => {
    const checkAdminAccess = async () => {
      if (loading) return;
      
      if (!user || !userProfile) {
        onNavigateHome();
        return;
      }

      if (userProfile.role !== 'admin') {
        onNavigateHome();
        return;
      }

      setIsAuthorized(true);
      setCheckingAuth(false);
    };

    checkAdminAccess();
  }, [user, userProfile, loading, onNavigateHome]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      showError('Message Required', 'Please enter a message before sending.');
      return;
    }

    setSending(true);
    try {
      await createAdminMessage(message);
      showSuccess('Message Sent!', 'Your platform-wide message has been sent to all users.');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Send Failed', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        showBackButton={true}
        onBackClick={onNavigateBack}
        onHomeClick={onNavigateHome}
        currentPage="admin-messages"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Send Platform Message</h1>
            </div>
            <p className="text-purple-100 mt-2">
              Broadcast important announcements to all platform users.
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Message Content
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Enter your platform-wide message here... (e.g., maintenance updates, new features, important announcements)"
                />
                <div className="mt-2 text-sm text-gray-500">
                  {message.length}/500 characters
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">📢 Message Guidelines</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Keep messages clear and concise</li>
                  <li>• Include relevant dates for scheduled maintenance</li>
                  <li>• Use professional and friendly tone</li>
                  <li>• All users will receive this message immediately</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setMessage('')}
                  disabled={sending || !message.trim()}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !message.trim()}
                  className="px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {sending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  This message will be sent to all registered users on the platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notifications */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default AdminMessagesPage;