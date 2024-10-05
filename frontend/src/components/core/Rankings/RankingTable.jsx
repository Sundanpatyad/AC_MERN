import React, { useState, useEffect } from 'react';
import { FaSearch, FaStar } from 'react-icons/fa';

const RankingTable = ({ rankings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [animatedRankings, setAnimatedRankings] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedRankings(rankings);
    }, 500);
    return () => clearTimeout(timer);
  }, [rankings]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredRankings = animatedRankings
    .filter((ranking) => ranking.userName.toLowerCase().includes(searchQuery))
    .sort((a, b) => a.rank - b.rank);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-zinc-900 to-black text-white p-4 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-stars"></div>
        <div className="relative">
          <h2 className="text-center mt-8 mb-6 font-bold text-4xl  text-slate-200">
           Ranking Table
          </h2>
          <div className="mb-8 relative">
            <input
              type="text"
              placeholder="Search by cosmic explorer..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-5 py-3 rounded-md bg-zinc-900 text-gray-300 placeholder-gray-500 shadow-lg focus:outline-none "
            />
            <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          <div className="space-y-4">
            {filteredRankings.map((ranking, index) => (
              <div
                key={ranking._id}
                className="bg-gradient-to-r from-zinc-800 to-zinc-900 p-4 rounded-lg flex items-center space-x-4 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 "
              >
                <div className="relative flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-zinc-500 to-zinc-800 rounded-full text-white font-bold shadow-lg">
                
                  <span className={`text-lg ${index === 0 ? 'mt-2' : ''}`}>
                    {index + 1}
                  </span>
                </div>
                <div className="flex-shrink-0 relative">
                  <img
                    className="h-12 w-12 rounded-full border-2 border-purple-500 shadow-lg"
                    src={ranking.userImage}
                    alt={ranking.userName}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1">
                    <FaStar className="text-yellow-400 text-sm" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm md:text-lg font-semibold text-gray-100 truncate">{ranking.userName}</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${ranking.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {ranking.score}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(ranking.attemptDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .bg-stars {
          background-image: radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: twinkle 5s ease-in-out infinite alternate;
        }
        @keyframes twinkle {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default RankingTable;