import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { mocktestEndpoints } from '../../../../services/apis';

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

const AddAttachments = ({ seriesId, onClose }) => {
  const { token } = useSelector((state) => state.auth);
  const [questionPaper, setQuestionPaper] = useState('');
  const [answerKey, setAnswerKey] = useState('');
  const [omrSheet, setOmrSheet] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const { ATTACHMENTS_API } = mocktestEndpoints;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${ATTACHMENTS_API}/${seriesId}/attachments`, {
        questionPaper,
        answerKey,
        omrSheet,
        name,
      }, { headers });

      setMessage('Attachments added successfully!');
      setQuestionPaper('');
      setAnswerKey('');
      setOmrSheet('');
      setName('');
    } catch (error) {
      setMessage('Error adding attachments: ' + error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Add Attachments to Mock Test Series</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label htmlFor="questionPaper" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question Paper URL
          </label>
          <input
            type="url"
            id="questionPaper"
            value={questionPaper}
            onChange={(e) => setQuestionPaper(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label htmlFor="answerKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Answer Key URL
          </label>
          <input
            type="url"
            id="answerKey"
            value={answerKey}
            onChange={(e) => setAnswerKey(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label htmlFor="omrSheet" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            OMR Sheet URL
          </label>
          <input
            type="url"
            id="omrSheet"
            value={omrSheet}
            onChange={(e) => setOmrSheet(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-white text-black py-3 px-4 rounded-md hover:bg-slate-200 focus:outline-none font-medium"
        >
          Add Attachments
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

export default AddAttachments;