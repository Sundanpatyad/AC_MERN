import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

const AddMockTest = ({ seriesId, onClose }) => {
  const { token } = useSelector((state) => state.auth);
  const [testName, setTestName] = useState('');
  const [testData, setTestData] = useState('');
  const [duration, setDuration] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post('http://localhost:8000/api/v1/mock/addMocktestToSeries', {
        seriesId,
        testName,
        testData,
        duration: parseInt(duration),
      }, { headers });

      setMessage('Mock test added successfully!');
      setTestName('');
      setTestData('');
      setDuration('');
    } catch (error) {
      setMessage('Error adding mock test: ' + error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Add New Mock Test</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="testName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Test Name
          </label>
          <input
            type="text"
            id="testName"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label htmlFor="testData" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Test Data
          </label>
          <textarea
            id="testData"
            value={testData}
            onChange={(e) => setTestData(e.target.value)}
            required
            rows="10"
            placeholder="Enter questions and answers here. Each question should be followed by 4 options and the correct answer, each on a new line."
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Duration (in minutes)
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-white text-black py-3 px-4 rounded-md hover:bg-slate-200 focus:outline-none font-medium"
        >
          Add Mock Test
        </button>
      </form>
      {message && (
        <p className={`mt-6 text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'} font-medium`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AddMockTest;