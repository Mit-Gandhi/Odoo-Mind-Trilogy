import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import UserCard from '../components/UserCard';
import { mockUsers } from '../data/mockUsers';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface HomePageProps {
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateLogin, onNavigateSignup }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  // Filter users based on search query and availability
  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch = searchQuery === '' || 
        user.skillsOffered.some(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        user.skillsWanted.some(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAvailability = availabilityFilter === 'All' || 
        user.availability === availabilityFilter;

      return matchesSearch && matchesAvailability;
    });
  }, [searchQuery, availabilityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (availability: string) => {
    setAvailabilityFilter(availability);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleAuthAction = () => {
    onNavigateLogin();
  };

  const handleRequest = () => {
    if (!user) {
      onNavigateLogin();
    } else {
      // Handle authenticated request
      alert('Request sent! (Demo)');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar onAuthAction={handleAuthAction} />

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-center max-w-4xl mx-auto">
          {/* Availability Filter */}
          <div className="relative sm:w-48">
            <select
              value={availabilityFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white"
            >
              <option value="All">Availability ▼</option>
              <option value="Weekends">Weekends</option>
              <option value="Evenings">Evenings</option>
              <option value="Weekdays">Weekdays</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
            />
          </div>

          {/* Search Button */}
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium">
            Search
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* User Cards Grid */}
        {paginatedUsers.length > 0 ? (
          <div className="space-y-6 mb-12">
            {paginatedUsers.map(user => (
              <UserCard
                key={user.id}
                user={user}
                onRequest={handleRequest}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No skills found
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Try adjusting your search query or filters to find what you're looking for.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-blue-500 text-white border border-blue-500'
                    : 'border border-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 Skill Swap Platform. Connecting learners and experts worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;