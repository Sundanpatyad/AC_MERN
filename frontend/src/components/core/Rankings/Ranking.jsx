import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import RankingTable from "./RankingTable";
import Footer from '../../common/Footer';
import { studentEndpoints } from '../../../services/apis';
import RankingsGraph from './RankingGraph';
import LoadingSpinner from '../ConductMockTests/Spinner';
import { Menu, Search } from 'lucide-react';
import { FaRankingStar } from "react-icons/fa6";

const RankingsPage = () => {
  const [rankings, setRankings] = useState({});
  const [selectedTest, setSelectedTest] = useState(null);
  const [userRanks, setUserRanks] = useState({});
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [error, setError] = useState(null);
  const { RANKINGS_API } = studentEndpoints;
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userId = user._id;
  const { testName } = useParams();
  const navigate = useNavigate();

  const calculateRanks = (testResults) => {
    const sortedResults = testResults.sort((a, b) => b.score - a.score);
    
    let currentRank = 1;
    let prevScore = null;
    let rankedResults = sortedResults.map((result, index) => {
      if (result.score !== prevScore) {
        currentRank = index + 1;
      }
      prevScore = result.score;
      return { ...result, rank: currentRank };
    });

    return rankedResults;
  };

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
          const groupedRankings = {};
          const userRanks = {};

          data.data.forEach(ranking => {
            if (!groupedRankings[ranking.testName]) {
              groupedRankings[ranking.testName] = [];
            }
            groupedRankings[ranking.testName].push(ranking);
          });

          Object.keys(groupedRankings).forEach(testName => {
            groupedRankings[testName] = calculateRanks(groupedRankings[testName]);
            
            const userRanking = groupedRankings[testName].find(r => r.userId === userId);
            if (userRanking) {
              userRanks[testName] = userRanking.rank;
            }
          });

          setRankings(groupedRankings);
          setUserRanks(userRanks);

          if (testName && groupedRankings[testName]) {
            setSelectedTest(testName);
          } else if (Object.keys(groupedRankings).length > 0) {
            const firstTest = Object.keys(groupedRankings)[0];
            setSelectedTest(firstTest);
            navigate(`/rankings/${firstTest}`);
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
  }, [token, RANKINGS_API, userId, testName, navigate]);

  const filteredTests = Object.keys(rankings).filter(testName =>
    testName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleTestSelection = (newTestName) => {
    setSelectedTest(newTestName);
    setIsDropdownOpen(false);
    navigate(`/rankings/${newTestName}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8 font-semibold text-xl">An error occurred. Please try again later.</div>;
  }

  return (
    <div className="bg-black w-screen text-gray-100 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <div className="relative mb-8">
          <button
            onClick={toggleDropdown}
            className="flex items-center text-sm justify-between w-full px-4 py-4 bg-zinc-900 text-white rounded-md"
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
                        onClick={() => handleTestSelection(testName)}
                        className="block w-full text-left px-4 py-2 text-sm my-2 text-white hover:bg-white/20 transition-colors duration-200 ease-in-out rounded-lg"
                      >
                        {testName} (My Rank : {userRanks[testName] || 'N/A'})
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
              <div className='flex justify-center align-center'>
                <div className="text-xl flex justify-evenly font-semibold mb-4 text-center bg-slate-200 py-2 px-4 w-80 rounded-md text-zinc-800">
                  <span><FaRankingStar size={"26"}/></span><span>My Rank : {userRanks[selectedTest] || 'N/A'} / {(rankings[selectedTest] || []).length}</span>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <div className="overflow-x-auto">
                    <RankingTable rankings={rankings[selectedTest] || []} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-center mb-4">Rankings Graph</h3>
                  <RankingsGraph rankings={rankings[selectedTest] || []} />
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 font-medium text-lg">
              {Object.keys(rankings).length === 0 ? 'No rankings data available.' : 
               filteredTests.length === 0 ? 'No matching mock tests found.' : 'Select a mock test to view rankings.'}
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RankingsPage;