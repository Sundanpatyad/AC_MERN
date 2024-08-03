import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import RankingTable from "./RankingTable"
import Footer from '../../common/Footer';
import { studentEndpoints } from '../../../services/apis';



const RankingsPage = () => {
  const [rankings, setRankings] = useState([]);
  const [filteredRankings, setFilteredRankings] = useState([]);
  const [testNames, setTestNames] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const [error, setError] = useState(null);
  const{RANKINGS_API}=studentEndpoints;
 

  useEffect(() => {
    const fetchRankings = async () => {
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
          setRankings(data.data);
          const uniqueTestNames = [...new Set(data.data.map(ranking => ranking.testName))];
          setTestNames(uniqueTestNames);
        } else {
          setError(data.message || 'Failed to fetch rankings');
        }
      } catch (error) {
        console.error('Error fetching rankings:', error);
        setError('Failed to fetch rankings. Please try again later.');
      }
    };
    if (token) {
      fetchRankings();
    } else {
      setError('Authentication token is missing');
    }
  }, [token]);

  useEffect(() => {
    if (selectedTest) {
      const filtered = rankings.filter(ranking => ranking.testName === selectedTest);
      const sortedAndRanked = filtered
        .sort((a, b) => b.score - a.score)
        .map((ranking, index) => ({
          ...ranking,
          rank: index + 1
        }));
      setFilteredRankings(sortedAndRanked);
    } else {
      setFilteredRankings([]);
    }
  }, [selectedTest, rankings]);

  const handleTestSelect = (testName) => {
    if (selectedTest === testName) {
      setSelectedTest(null);
    } else {
      setSelectedTest(testName);
    }
  };

  if (error) {
    return <div className="text-center text-red-400 mt-8 font-semibold text-xl">{error}</div>;
  }

  return (
    <div className="bg-black min-h-screen py-12 text-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-300">
          Student Rankings
        </h1>
        
        <div className="bg-transparent border border-slate-300 rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-100">Select a Mock Test</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {testNames.map((testName) => (
              <button
                key={testName}
                onClick={() => handleTestSelect(testName)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedTest === testName
                    ? 'bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-md'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {testName}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-black rounded-lg shadow-xl p-6">
          {selectedTest ? (
            filteredRankings.length > 0 ? (
              <div className="overflow-x-auto">
                <RankingTable rankings={filteredRankings} />
              </div>
            ) : (
              <p className="text-center text-gray-400 font-medium text-lg">
                No rankings available for the selected test.
              </p>
            )
          ) : (
            <p className="text-center text-gray-400 font-medium text-lg">
              Click on a mock test name to view rankings.
              </p>
          )}
        </div>
      </div>
      <Footer/>
    </div>

  );
};

export default RankingsPage;