import React from 'react';
import { Star, Clock, ArrowRight } from 'lucide-react';
import { UserProfile } from '../services/userService';

interface UserCardProps {
  user: UserProfile;
  onRequest: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onRequest }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-600'
        }`}
      />
    ));
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-600 p-6 hover:bg-gray-750 transition-all duration-300">
      <div className="flex items-start space-x-4">
        {/* Profile Photo */}
        <div className="flex-shrink-0">
          <img
            src={user.profilePhotoUrl || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-white mb-2">{user.name}</h3>
          
          {/* Skills Offered */}
          <div className="mb-3">
            <span className="text-sm text-green-400 font-medium">Skills Offered → </span>
            <div className="inline-flex flex-wrap gap-2 mt-1">
              {user.skillsOffered.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm border border-green-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="mb-4">
            <span className="text-sm text-blue-400 font-medium">Skill wanted → </span>
            <div className="inline-flex flex-wrap gap-2 mt-1">
              {user.skillsWanted.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm border border-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-400">rating</span>
              <div className="flex items-center space-x-1 ml-2">
                {renderStars(user.rating)}
                <span className="text-sm text-gray-300 ml-1">
                  {user.rating.toFixed(1)}/5
                </span>
                <span className="text-sm text-gray-400 ml-1">
                  ({user.feedback.length} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Request Button */}
        <div className="flex-shrink-0">
          <button
            onClick={onRequest}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
          >
            Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;