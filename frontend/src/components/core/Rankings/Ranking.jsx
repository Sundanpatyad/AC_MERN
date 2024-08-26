import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import RankingTable from "./RankingTable";
import Footer from '../../common/Footer';
import { studentEndpoints } from '../../../services/apis';
import RankingsGraph from './RankingGraph';
import LoadingSpinner from '../ConductMockTests/Spinner';


const RankingsPage = () => {
  const [rankings, setRankings] = useState({});
  const [selectedTest, setSelectedTest] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const [error, setError] = useState(null);
  const { RANKINGS_API } = studentEndpoints;
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const testsPerPage = 5;
  const [isLoading, setIsLoading] = useState(true); // New state for loading

  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true); // Start loading
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
        setIsLoading(false); // End loading
      }
    };
    if (token) {
      fetchRankings();
    } else {
      setError('Authentication token is missing');
      setIsLoading(false); // End loading if there's no token
    }
  }, [token, RANKINGS_API]);

  const filteredTests = Object.keys(rankings).filter(testName =>
    testName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = filteredTests.slice(indexOfFirstTest, indexOfLastTest);
  const totalPages = Math.ceil(filteredTests.length / testsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return <LoadingSpinner />; // Show spinner while loading
  }

  if (error) {
    return <div className="text-center text-red-400 mt-8 font-semibold text-xl">{error}</div>;
  }

  return (
    <div className="bg-black w-screen text-gray-100">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-center mb-12 text-transparent bg-clip-text mt-20 bg-white">
          Student Rankings
        </h1>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search mock tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentTests.map((testName) => (
              <button
                key={testName}
                onClick={() => setSelectedTest(testName)}
                className={`px-4 py-2 w-full rounded-sm text-sm transition-colors duration-200 ${
                  selectedTest === testName
                    ? 'bg-slate-200 text-black'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {testName}
              </button>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4 mb-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === number
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {number}
            </button>
          ))}
        </div>

        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl">
          {selectedTest && rankings[selectedTest] ? (
            <>
              <h2 className="text-3xl font-bold mb-6 text-center pt-8 text-gray-100">{selectedTest}</h2>
              <div className="">
                <div>
                  <h3 className="text-2xl rounded-md w-full font-bold mt-10 text-center mb-4">Rankings Table</h3>
                  <div className="overflow-x-auto ">
                    <RankingTable rankings={rankings[selectedTest]} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl rounded font-bold text-center my-4">Rankings Graph</h3>
                  <RankingsGraph rankings={rankings[selectedTest]} />
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 font-medium text-lg">
              {filteredTests.length === 0 ? 'No matching mock tests found.' : 'Select a mock test from above to view rankings.'}
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RankingsPage;