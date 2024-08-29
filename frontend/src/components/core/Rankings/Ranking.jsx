import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import RankingTable from "./RankingTable";
import Footer from '../../common/Footer';
import { studentEndpoints } from '../../../services/apis';
import RankingsGraph from './RankingGraph';
import LoadingSpinner from '../ConductMockTests/Spinner';
import { Menu, Search } from 'lucide-react';

const RankingsPage = () => {
  const [rankings, setRankings] = useState({});
  const [selectedTest, setSelectedTest] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const [error, setError] = useState(null);
  const { RANKINGS_API } = studentEndpoints;
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(RANKINGS_API, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          const groupedRankings = data.data.reduce((acc, ranking) => {
            if (!acc[ranking.testName]) {
              acc[ranking.testName] = [];
            }
            acc[ranking.testName].push(ranking);
            return acc;
          }, {});

          Object.keys(groupedRankings).forEach(testName => {
            groupedRankings[testName].sort((a, b) => b.score - a.score);
            groupedRankings[testName].forEach((ranking, index) => {
              ranking.rank = index + 1;
            });
          });

          setRankings(groupedRankings);
          if (Object.keys(groupedRankings).length > 0) {
            setSelectedTest(Object.keys(groupedRankings)[0]);
          }
        } else {
          setError(data.message || 'Failed to fetch rankings');
        }
      } catch (error) {
        console.error('Error fetching rankings:', error);
        setError('Failed to fetch rankings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    if (token) {
      fetchRankings();
    } else {
      setError('Authentication token is missing');
      setIsLoading(false);
    }
  }, [token, RANKINGS_API]);

  const filteredTests = Object.keys(rankings).filter(testName =>
    testName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-400 mt-8 font-semibold text-xl">{error}</div>;
  }

  return (
    <div className="bg-black w-screen text-gray-100 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 mt-5">
      

        <div className="relative mb-8">
          <button
            onClick={toggleDropdown}
            className="flex items-center text-sm justify-between w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>{selectedTest || "Select a mock test"}</span>
            <Menu size={24} />
          </button>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute z-10 py-4 px-2 left-0 mt-2 w-full rounded-lg shadow-lg bg-slate-400 bg-opacity-10 border border-white/20 backdrop-blur-lg"
              >
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search mock tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 pl-10 bg-transparent border border-slate-200 text-white rounded-md focus:outline-none"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>

                <motion.div className="max-h-60 overflow-y-auto">
                  {filteredTests.map((testName, index) => (
                    <motion.div
                      key={testName}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => {
                          setSelectedTest(testName);
                          setIsDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm my-2 text-white hover:bg-white/20 transition-colors duration-200 ease-in-out rounded-lg"
                      >
                        {testName}
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-transparent bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl">
          {selectedTest && rankings[selectedTest] ? (
            <>
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-100">{selectedTest}</h2>
              <div className="space-y-8">
                <div>
                  <div className="overflow-x-auto">
                    <RankingTable rankings={rankings[selectedTest]} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-center mb-4">Rankings Graph</h3>
                  <RankingsGraph rankings={rankings[selectedTest]} />
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 font-medium text-lg">
              {filteredTests.length === 0 ? 'No matching mock tests found.' : 'Select a mock test to view rankings.'}
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RankingsPage;