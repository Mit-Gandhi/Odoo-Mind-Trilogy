import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, MapPin, Mail, Linkedin, Github, Globe, MessageCircle, Send } from 'lucide-react';
import { getUserProfile, UserProfile, updateUserProfile } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import { createRequest, hasAcceptedRequest } from '../services/requestService';
import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';

interface UserProfilePageProps {
  userId: string;
  onNavigateHome: () => void;
  onNavigateBack: () => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ userId, onNavigateHome, onNavigateBack }) => {
  const { user, userProfile: currentUserProfile } = useAuth();
  const { notifications, removeNotification, showSuccess, showError, showInfo } = useNotification();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [canGiveFeedback, setCanGiveFeedback] = useState(false);
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState('');
  const [selectedWantedSkill, setSelectedWantedSkill] = useState('');
  const [customWantedSkill, setCustomWantedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  
  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getUserProfile(userId);
        setUserProfile(profile);
        
        // Check if current user can give feedback (has accepted request)
        if (user && profile) {
          const hasAccepted = await hasAcceptedRequest(user.uid, profile.uid);
          setCanGiveFeedback(hasAccepted);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId, user]);

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-400'
        } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
        onClick={() => interactive && onStarClick && onStarClick(i + 1)}
      />
    ));
  };

  const handleSubmitRequest = async () => {
    const finalWantedSkill = customWantedSkill.trim() || selectedWantedSkill;
    
    if (!selectedOfferedSkill || !finalWantedSkill || !message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (!user || !currentUserProfile || !userProfile) {
      alert('Please log in to send requests');
      return;
    }

    setSubmittingRequest(true);
    try {
      await createRequest({
        fromUserId: user.uid,
        fromUserName: currentUserProfile.name,
        fromUserPhoto: currentUserProfile.profilePhotoUrl || '',
        toUserId: userProfile.uid,
        toUserName: userProfile.name,
        offeredSkill: selectedOfferedSkill,
        wantedSkill: finalWantedSkill,
        message: message.trim(),
        status: 'pending'
      });

      showSuccess('Request Sent!', `Your skill swap request has been sent to ${userProfile.name}.`);
      setShowRequestForm(false);
      setSelectedOfferedSkill('');
      setSelectedWantedSkill('');
      setCustomWantedSkill('');
      setMessage('');
    } catch (error) {
      console.error('Error sending request:', error);
      showError('Request Failed', 'Failed to send request. Please try again.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    if (!user || !currentUserProfile || !userProfile) {
      alert('Please log in to give feedback');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const newFeedback = {
        from: currentUserProfile.name,
        fromUserId: user.uid,
        rating: feedbackRating,
        comment: feedbackComment.trim(),
        createdAt: new Date()
      };

      const updatedFeedback = [...userProfile.feedback, newFeedback];
      const newRating = updatedFeedback.reduce((sum, f) => sum + f.rating, 0) / updatedFeedback.length;

      await updateUserProfile(userProfile.uid, {
        feedback: updatedFeedback,
        rating: newRating
      });

      // Update local state
      setUserProfile(prev => prev ? {
        ...prev,
        feedback: updatedFeedback,
        rating: newRating
      } : null);

      showSuccess('Feedback Submitted!', 'Your feedback has been submitted successfully.');
      setShowFeedbackForm(false);
      setFeedbackRating(5);
      setFeedbackComment('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showError('Feedback Failed', 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const hasUserGivenFeedback = () => {
    if (!user || !userProfile) return false;
    return userProfile.feedback.some(f => f.fromUserId === user.uid);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          showHomeButton={true}
          onHomeClick={onNavigateHome}
        />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">The user profile you're looking for doesn't exist.</p>
            <button
              onClick={onNavigateBack}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        showBackButton={true}
        onBackClick={onNavigateBack}
        onHomeClick={onNavigateHome}
        currentPage="user-profile"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">User Profile</h1>
              {user && (
                <div className="flex space-x-3">
                  {!showRequestForm && !showFeedbackForm && (
                    <>
                      <button
                        onClick={() => setShowRequestForm(true)}
                        className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Send Request
                      </button>
                      {canGiveFeedback && !hasUserGivenFeedback() && (
                        <button
                          onClick={() => setShowFeedbackForm(true)}
                          className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                        >
                          Give Feedback
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* Profile Info */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                <img 
                  src={userProfile.profilePhotoUrl || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                  alt={userProfile.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{userProfile.name}</h2>
                
                <div className="flex items-center space-x-4 text-gray-600 mb-4">
                  {userProfile.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{userProfile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{userProfile.availability}</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(userProfile.rating)}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {userProfile.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-600">
                    ({userProfile.feedback.length} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Skills Offered */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.skillsOffered.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm border border-green-200 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills Wanted */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills Wanted</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.skillsWanted.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            {userProfile.contactInfo && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userProfile.contactInfo.email && (
                    <a
                      href={`mailto:${userProfile.contactInfo.email}`}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Mail className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900">{userProfile.contactInfo.email}</span>
                    </a>
                  )}
                  
                  {userProfile.contactInfo.linkedin && (
                    <a
                      href={userProfile.contactInfo.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Linkedin className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-900">LinkedIn Profile</span>
                    </a>
                  )}
                  
                  {userProfile.contactInfo.github && (
                    <a
                      href={userProfile.contactInfo.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Github className="w-5 h-5 text-gray-900" />
                      <span className="text-gray-900">GitHub Profile</span>
                    </a>
                  )}
                  
                  {userProfile.contactInfo.portfolio && (
                    <a
                      href={userProfile.contactInfo.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Globe className="w-5 h-5 text-green-600" />
                      <span className="text-gray-900">Portfolio Website</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {userProfile.feedback.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Reviews & Feedback</h3>
                <div className="space-y-4">
                  {userProfile.feedback.map((review, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="font-medium text-gray-900">{review.rating}/5</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      <p className="text-sm text-gray-500 mt-2">- {review.from}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request Form */}
            {showRequestForm && user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Send Skill Swap Request</span>
                  </h3>
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose one of your offered skills
                    </label>
                    <select
                      value={selectedOfferedSkill}
                      onChange={(e) => setSelectedOfferedSkill(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a skill you can offer</option>
                      {currentUserProfile?.skillsOffered?.map((skill, index) => (
                        <option key={index} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose a skill you want to learn
                    </label>
                    <select
                      value={selectedWantedSkill}
                      onChange={(e) => {
                        setSelectedWantedSkill(e.target.value);
                        if (e.target.value !== 'custom') {
                          setCustomWantedSkill('');
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a skill you want to learn</option>
                      {userProfile.skillsOffered.map((skill, index) => (
                        <option key={index} value={skill}>{skill}</option>
                      ))}
                      <option value="custom">Other (specify below)</option>
                    </select>
                  </div>

                  {(selectedWantedSkill === 'custom' || !selectedWantedSkill) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Or specify a custom skill you want to learn
                      </label>
                      <input
                        type="text"
                        value={customWantedSkill}
                        onChange={(e) => setCustomWantedSkill(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter any skill you want to learn..."
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Introduce yourself and explain why you'd like to connect..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleSubmitRequest}
                      disabled={submittingRequest}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {submittingRequest ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Request</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowRequestForm(false)}
                      disabled={submittingRequest}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Form */}
            {showFeedbackForm && user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Star className="w-5 h-5" />
                    <span>Give Feedback & Rating</span>
                  </h3>
                  <button
                    onClick={() => setShowFeedbackForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      {renderStars(feedbackRating, true, setFeedbackRating)}
                      <span className="ml-2 text-gray-600">({feedbackRating}/5)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment
                    </label>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Share your experience working with this person..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={submittingFeedback}
                      className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {submittingFeedback ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4" />
                          <span>Submit Feedback</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowFeedbackForm(false)}
                      disabled={submittingFeedback}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
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

export default UserProfilePage;