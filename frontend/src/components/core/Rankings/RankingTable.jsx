import React, { useState } from 'react';
import { FaTrophy } from 'react-icons/fa'; // Make sure to install react-icons

const RankingTable = ({ rankings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  console.log(rankings)
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredRankings = rankings.filter((ranking) =>
    ranking.userName.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="flex items-center w-full justify-center bg-gradient-to-b rounded-xl from-gray-900 to-black text-white">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className='text-center mt-4 font-semibold'>Ranking Table</h2>
        <div className="pb-8 pt-4">
          {/* Search input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 sm:px-5 sm:py-3 rounded-xl bg-gray-800 text-gray-300 placeholder-gray-500 shadow-lg focus:outline-none"
            />
          </div>

          <div className="max-w-full overflow-x-auto rounded-lg shadow-2xl">
            <div className="space-y-2">
              {filteredRankings.map((ranking) => (
                <div key={ranking._id} className="bg-gray-800 p-3 sm:p-4 rounded-lg flex items-center space-x-2 sm:space-x-4">
                  {/* Rank with trophy icon */}
                  <div className="flex-shrink-0 w-8 sm:w-8 h-8 sm:h-8 flex items-center justify-center bg-blue-600 rounded-md text-white font-bold relative">
                    <FaTrophy className="text-yellow-400 text-xl sm:text-3xl" />
                    <span className="absolute inset-0 flex items-center justify-center text-xs sm:text-lg">
                      {ranking.rank}
                    </span>
                  </div>
                  {/* Student image */}
                  <div className="flex-shrink-0">
                    <img
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-blue-500"
                      src={ranking.userImage}
                      alt=""
                    />
                  </div>
                  {/* Student details */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-100 truncate">{ranking.userName}</div>
                    {/* <div className="text-xs text-gray-400 truncate">{ranking.testName}</div> */}
                  </div>
                  {/* Score and date */}
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${ranking.score >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {ranking.score}
                    </div>
                    <div className="text-xs text-gray-300">
                      {new Date(ranking.attemptDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingTable;