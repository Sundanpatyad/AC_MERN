import { useState, useEffect } from 'react';
import { PlaceholdersAndVanishInput } from "./placeholder-vanish-input";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mocktestEndpoints } from '../../services/apis';

export function PlaceholdersAndVanishInputDemo({ onResultClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { SEARCH_API } = mocktestEndpoints;

  console.log(searchResults);

  const placeholders = [
    "Search Mocktests...",
    "Search Courses...",
  ];

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const fetchSearchResults = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SEARCH_API}?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      const data = await response.json();
      setSearchResults(data.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchSearchResults();
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        fetchSearchResults();
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const getItemLink = (result) => {
    if (result.type.toLowerCase() === 'mocktest') {
      return `/mock-test/${result._id}`;
    } else if (result.type.toLowerCase() === 'course') {
      return `/courses/${result._id}`;
    }
    return '#'; // Default link if type is not recognized
  };

  const handleResultClick = () => {
    if (typeof onResultClick === 'function') {
      onResultClick();
    }
  };

  return (
    <>
      <style>
        {`
          input, textarea {
            font-size: 16px;
          }
          @media screen and (max-width: 768px) {
            input, textarea {
              font-size: 16px;
            }
          }
        `}
      </style>
      <div className="relative">
        <div className="container mx-auto px-4 pt-8">
          <div className="mb-8">
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={onSubmit}
              value={searchQuery}
            />
          </div>
        </div>

        {(isLoading || searchResults.length > 0 || (searchQuery && searchResults.length === 0)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute w-full left-0 right-0 z-50 bg-black border border-gray-700 rounded text-gray-200 shadow-lg overflow-hidden max-h-96 overflow-y-auto"
          >
            <div className="container mx-auto px-4 py-4">
              {isLoading && <p className="text-center text-gray-400">Loading...</p>}

              {!isLoading && searchResults.length > 0 && (
                <ul className="divide-y divide-gray-600">
                  {searchResults.map((result) => (
                    <motion.li
                      key={result._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="py-4"
                    >
                      <Link
                        to={getItemLink(result)}
                        className="flex items-center space-x-4 transition-colors duration-200 p-2 rounded hover:bg--900"
                        onClick={handleResultClick}
                      >
                        {result.thumbnail && (
                          <img src={result.thumbnail} alt={result.name} className="w-16 h-16 object-cover rounded" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-200 truncate">{result.name}</h3>
                          <p className="text-sm text-gray-400">Type: {result.type}</p>
                          <p className="text-sm text-gray-400">Price: ${result.price}</p>
                        </div>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              )}

              {!isLoading && searchQuery && searchResults.length === 0 && (
                <p className="text-center py-4 text-gray-400">No results found.</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}