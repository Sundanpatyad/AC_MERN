import { useState, useEffect } from 'react';
import { PlaceholdersAndVanishInput } from "./placeholder-vanish-input";
import { Link } from 'react-router-dom';
import { mocktestEndpoints } from '../../services/apis';


export function PlaceholdersAndVanishInputDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const {SEARCH_API} = mocktestEndpoints;

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

  return (
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
        <div className="absolute w-full left-0 right-0 z-50 bg-black border border-slate-600 rounded text-stone-50 shadow-lg rounded-b-lg overflow-hidden max-h-96 overflow-y-auto">
          <div className="container mx-auto px-4 py-4">
            {isLoading && <p className="text-center">Loading...</p>}

            {!isLoading && searchResults.length > 0 && (
              <ul className="divide-y divide-gray-200">
                {searchResults.map((result) => (
                  <li key={result._id} className="py-4">
                    <Link 
                      to={getItemLink(result)} 
                      className="flex items-center space-x-4  transition-colors duration-200 p-2 rounded"
                    >
                      {result.thumbnail && (
                        <img src={result.thumbnail} alt={result.name} className="w-16 h-16 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-200 truncate">{result.name}</h3>
                        <p className="text-sm text-gray-500">Type: {result.type}</p>
                        <p className="text-sm text-gray-500">Price: ${result.price}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {!isLoading && searchQuery && searchResults.length === 0 && (
              <p className="text-center py-4">No results found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}