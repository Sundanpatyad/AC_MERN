import React, { useState } from 'react';

const RankingTable = ({ rankings }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Function to handle the search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Filtered rankings based on the search query
  const filteredRankings = rankings.filter((ranking) =>
    ranking.userName.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="container mx-auto px-2 sm:px-6 lg:px-8 bg-black text-white">
      <div className="py-4 sm:py-8">
        {/* Search input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by student name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="max-w-full overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Test Name
                </th>
                <th scope="col" className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Attempt Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {filteredRankings.map((ranking, index) => (
                <tr key={ranking._id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}>
                  <td className="px-2 sm:px-3 py-2 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                    <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-xs sm:text-sm">
                      {ranking.rank}
                    </span>
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                        <img className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-blue-500" src={ranking.userImage} alt="" />
                      </div>
                      <div className="ml-2 sm:ml-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-100">{ranking.userName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-300">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {ranking.score}
                    </span>
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-300">
                    {ranking.testName}
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-300">
                    {new Date(ranking.attemptDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RankingTable;
