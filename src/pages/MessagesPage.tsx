import React, { useEffect } from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMessages } from '../hooks/useMessages';
import { markMessageAsSeen } from '../services/messageService';
import Navbar from '../components/Navbar';

interface MessagesPageProps {
  onNavigateHome: () => void;
  onNavigateBack: () => void;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ onNavigateHome, onNavigateBack }) => {
  const { user } = useAuth();
  const { messages, loading } = useMessages();

  useEffect(() => {
    // Mark all messages as seen when user visits this page
    if (user && messages.length > 0) {
      const markAllAsSeen = async () => {
        const unseenMessages = messages.filter(msg => !msg.seenBy.includes(user.uid));
        
        for (const message of unseenMessages) {
          if (message.id) {
            try {
              await markMessageAsSeen(message.id, user.uid);
            } catch (error) {
              console.error('Error marking message as seen:', error);
            }
          }
        }
      };

      markAllAsSeen();
    }
  }, [user, messages]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isUnread = (message: any) => {
    return user && !message.seenBy.includes(user.uid);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        showBackButton={true}
        onBackClick={onNavigateBack}
        onHomeClick={onNavigateHome}
        currentPage="messages"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Platform Messages</h1>
            </div>
            <p className="text-blue-100 mt-2">
              Important updates and announcements from the platform team.
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {loading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading messages...</p>
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`border rounded-lg p-6 transition-all duration-200 hover:shadow-md ${
                      isUnread(message) 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <MessageSquare className="w-5 h-5 text-blue-500" />
                          <span className="text-sm font-medium text-blue-600">Platform Announcement</span>
                          {isUnread(message) && (
                            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                          <p className="text-gray-800 leading-relaxed">{message.message}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(message.createdAt)}</span>
                          <span>•</span>
                          <span>{message.seenBy.length} user{message.seenBy.length !== 1 ? 's' : ''} seen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Messages</h3>
                <p className="text-gray-600">No platform messages have been sent yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;