import React, { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaCrown, FaMedal } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const RankingTable = ({ rankings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortedRankings, setSortedRankings] = useState([]);

  useEffect(() => {
    if (rankings) {
      // Sort by rank ascending
      const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
      setSortedRankings(sorted);
    }
  }, [rankings]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const topThree = sortedRankings.slice(0, 3);
  const restRankings = sortedRankings
    .slice(3)
    .filter((ranking) => ranking.userName.toLowerCase().includes(searchQuery));

  // Podium Component
  const PodiumSpot = ({ rank, user, delay }) => {
    const isFirst = rank === 1;
    const height = isFirst ? 'h-48 md:h-64' : rank === 2 ? 'h-40 md:h-52' : 'h-32 md:h-44';
    const color = isFirst ? 'from-yellow-400 to-yellow-600' : rank === 2 ? 'from-gray-300 to-gray-500' : 'from-orange-400 to-orange-600';
    const shadow = isFirst ? 'shadow-yellow-500/20' : rank === 2 ? 'shadow-gray-400/20' : 'shadow-orange-500/20';

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        className={`flex flex-col items-center justify-end ${isFirst ? 'order-2' : rank === 2 ? 'order-1' : 'order-3'}`}
      >
        <div className="relative mb-4">
          <img
            src={user?.userImage}
            alt={user?.userName}
            className={`rounded-full border-4 object-cover shadow-2xl ${isFirst ? 'w-20 h-20 md:w-28 md:h-28 border-yellow-400' : 'w-16 h-16 md:w-20 md:h-20 border-gray-300'}`}
          />
          {isFirst && (
            <FaCrown className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-3xl drop-shadow-lg animate-bounce" />
          )}
        </div>

        <div className={`w-full ${height} w-24 md:w-32 bg-gradient-to-b ${color} rounded-t-lg flex flex-col items-center justify-start pt-4 relative shadow-[0_0_30px_rgba(0,0,0,0.5)] ${shadow}`}>
          <span className="text-3xl md:text-5xl font-bold text-white drop-shadow-md">{rank}</span>
          <div className="mt-2 text-center px-1">
            <p className="text-white font-bold text-sm md:text-lg truncate max-w-[80px] md:max-w-[120px]">{user?.userName.split(' ')[0]}</p>
            <p className="text-white/80 text-xs md:text-sm font-semibold">{user?.score} pts</p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-black text-white p-4 md:p-8 overflow-hidden font-inter">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-4 mb-12 font-bold text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
        >
          Leaderboard
        </motion.h2>

        {/* Podium Section */}
        <div className="flex justify-center items-end gap-2 md:gap-8 mb-16 min-h-[300px]">
          {topThree.length > 0 && (
            <>
              {topThree[1] && <PodiumSpot rank={2} user={topThree[1]} delay={0.2} />}
              {topThree[0] && <PodiumSpot rank={1} user={topThree[0]} delay={0.4} />}
              {topThree[2] && <PodiumSpot rank={3} user={topThree[2]} delay={0.6} />}
            </>
          )}
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-8 relative max-w-md mx-auto"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <input
              type="text"
              placeholder="Search explorers..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="relative w-full px-5 py-3 rounded-lg bg-zinc-900 text-gray-300 placeholder-gray-500 focus:outline-none border border-zinc-700/50 backdrop-blur-xl"
            />
            <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </motion.div>

        {/* Ranking List */}
        <div className="space-y-3">
          <AnimatePresence>
            {restRankings.map((ranking, index) => (
              <motion.div
                key={ranking._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 p-4 rounded-xl flex items-center gap-4 hover:bg-zinc-800/60 hover:border-zinc-700 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-8 md:w-12 text-center">
                  <span className="text-zinc-500 font-bold text-lg md:text-xl group-hover:text-white transition-colors duration-300">
                    #{ranking.rank}
                  </span>
                </div>

                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
                  <img
                    className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-zinc-700 relative z-10 object-cover"
                    src={ranking.userImage}
                    alt={ranking.userName}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm md:text-lg font-semibold text-gray-200 group-hover:text-white truncate transition-colors">
                    {ranking.userName}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {new Date(ranking.attemptDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                    {ranking.score}
                  </div>
                  <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wider">
                    Points
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {restRankings.length === 0 && searchQuery && (
            <div className="text-center text-zinc-500 py-8">
              No explorers found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingTable;