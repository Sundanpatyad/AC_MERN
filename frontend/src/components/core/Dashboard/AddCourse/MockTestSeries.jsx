import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { mocktestEndpoints } from '../../../../services/apis';

const AddMockTestSeries = () => {
  const { token } = useSelector((state) => state.auth);

  const [seriesName, setSeriesName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [mockTests, setMockTests] = useState([]);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [redirectId, setRedirectId] = useState(null);
  const [status, setStatus] = useState('published');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { CREATE_MOCKTESTS_API } = mocktestEndpoints;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const seriesData = { seriesName, description, price, mockTests, status };

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(CREATE_MOCKTESTS_API, seriesData, { headers });
      setSubmitStatus('success');
      setRedirectId(response.data.data._id);
      // Reset form
      setSeriesName('');
      setDescription('');
      setPrice('');
      setMockTests([]);
    } catch (error) {
      console.error('Error submitting mock test series:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDraft = async (e) => {
    e.preventDefault();
    setStatus('draft');
    await handleSubmit(e);
  };

  const addMockTest = () => {
    setMockTests([...mockTests, { testName: '', testId: '' }]);
  };

  const updateMockTest = (index, field, value) => {
    const updatedMockTests = [...mockTests];
    updatedMockTests[index][field] = value;
    setMockTests(updatedMockTests);
  };

  const deleteMockTest = (index) => {
    const updatedMockTests = mockTests.filter((_, i) => i !== index);
    setMockTests(updatedMockTests);
  };

  return (
    <>
      {submitStatus === "success" && <Navigate to={`/dashboard/edit-mock-test-series/${redirectId}`}></Navigate>}
      <div className="flex w-full items-start gap-x-8">
        <div className="flex flex-1 flex-col">
          <h1 className="mb-8 text-4xl font-bold text-white text-center lg:text-left bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Add Mock Test Series
          </h1>
          <p className="mb-10 text-sm text-gray-400 text-center lg:text-left">
            Create a new mock test series for your students
          </p>

          <div className="flex-1">
            <form onSubmit={status === 'draft' ? handleDraft : handleSubmit} className="space-y-8">
              {/* Series Information Card */}
              <div className="rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 shadow-2xl space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Series Information</h2>

                <div className="space-y-2">
                  <label htmlFor="seriesName" className="block text-sm font-medium text-gray-200">
                    Series Name <sup className="text-pink-400">*</sup>
                  </label>
                  <input
                    type="text"
                    id="seriesName"
                    value={seriesName}
                    onChange={(e) => setSeriesName(e.target.value)}
                    required
                    placeholder="Enter series name"
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-200">
                    Description <sup className="text-pink-400">*</sup>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows="4"
                    placeholder="Describe what this series covers"
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-200">
                    Price (₹) <sup className="text-pink-400">*</sup>
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Mock Tests Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Mock Tests in Series</h2>
                  <button
                    type="button"
                    onClick={addMockTest}
                    className="flex items-center gap-x-2 rounded-lg px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FaPlus /> Add Mock Test
                  </button>
                </div>

                {mockTests.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-full bg-zinc-800 border border-zinc-700">
                        <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-400 text-lg font-medium">No mock tests added yet</p>
                        <p className="text-gray-500 text-sm mt-1">Click "Add Mock Test" to get started</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockTests.map((test, index) => (
                      <div key={index} className="rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 shadow-2xl relative">
                        <button
                          type="button"
                          onClick={() => deleteMockTest(index)}
                          className="absolute top-4 right-4 text-red-400 hover:text-red-300 transition-colors duration-200 p-2 hover:bg-red-500/10 rounded-lg"
                        >
                          <FaTrash size={18} />
                        </button>

                        <h3 className="text-lg font-semibold text-white mb-4">Mock Test #{index + 1}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-200">
                              Test Name <sup className="text-pink-400">*</sup>
                            </label>
                            <input
                              type="text"
                              placeholder="Enter test name"
                              value={test.testName}
                              onChange={(e) => updateMockTest(index, 'testName', e.target.value)}
                              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-200">
                              Test ID <sup className="text-pink-400">*</sup>
                            </label>
                            <input
                              type="text"
                              placeholder="Enter test ID"
                              value={test.testId}
                              onChange={(e) => updateMockTest(index, 'testId', e.target.value)}
                              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-zinc-700/50">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Series'}
                </button>
                <button
                  type="button"
                  onClick={handleDraft}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-zinc-700 hover:bg-zinc-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save as Draft
                </button>
              </div>
            </form>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="mt-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50">
                <p className="text-green-400 font-medium text-center">✓ Mock test series submitted successfully!</p>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="mt-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50">
                <p className="text-red-400 font-medium text-center">✗ Error submitting mock test series. Please try again.</p>
              </div>
            )}
          </div>
        </div>

        {/* Mock Test Series Creation Tips */}
        <div className="sticky top-10 hidden lg:block max-w-[420px] flex-1 rounded-xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-white">Creation Tips</p>
          </div>

          <ul className="space-y-4 text-sm text-gray-300">
            <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Choose a clear and descriptive name for your series.</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Provide a comprehensive description of what the series covers.</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
              <span className="text-pink-400 mt-0.5">•</span>
              <span>Set a fair price considering the content and number of tests.</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Include a variety of mock tests to cover different aspects.</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
              <span className="text-yellow-400 mt-0.5">•</span>
              <span>Ensure all test IDs are correct and correspond to existing tests.</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>Review your series details before submission.</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
              <span className="text-red-400 mt-0.5">•</span>
              <span>Use the draft option if you need to come back and finish later.</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default AddMockTestSeries;