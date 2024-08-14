import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
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

  const {CREATE_MOCKTESTS_API} = mocktestEndpoints;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const seriesData = { seriesName, description, price, mockTests, status };

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(CREATE_MOCKTESTS_API, seriesData, { headers });
      // //console.log('Server response:', response.data);
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
      <div className="flex w-full items-start gap-x-6 bg-richblack-900 min-h-screen p-8">
        <div className="flex flex-1 flex-col">
          <h1 className="mb-14 text-3xl font-medium text-richblack-5 font-boogaloo text-center lg:text-left">
            Add Mock Test Series
          </h1>
          <div className="flex-1">
            <form onSubmit={status === 'draft' ? handleDraft : handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="seriesName" className="block text-sm font-medium text-richblack-5">Series Name</label>
                <input
                  type="text"
                  id="seriesName"
                  value={seriesName}
                  onChange={(e) => setSeriesName(e.target.value)}
                  required
                  className="mt-1 block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-richblack-5">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="mt-1 block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-richblack-5">Price</label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="mt-1 block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <h2 className="text-xl font-semibold mt-8 mb-4 text-richblack-5">Mock Tests in Series</h2>
              {mockTests.map((test, index) => (
                <div key={index} className="space-y-4 bg-richblack-800 p-4 rounded-lg border border-richblack-700 relative">
                  <input
                    type="text"
                    placeholder="Test Name"
                    value={test.testName}
                    onChange={(e) => updateMockTest(index, 'testName', e.target.value)}
                    className="block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <input
                    type="text"
                    placeholder="Test ID"
                    value={test.testId}
                    onChange={(e) => updateMockTest(index, 'testId', e.target.value)}
                    className="block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <button 
                    type="button" 
                    onClick={() => deleteMockTest(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button 
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-richblack-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
              >
                Submit Series
              </button>
              <button 
                type="submit" 
                onClick={handleDraft}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-richblack-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
              >
                Save as Draft
              </button>
            </form>
            {submitStatus === 'success' && (
              <p className="mt-4 text-green-500">Mock test series submitted successfully!</p>
            )}
            {submitStatus === 'error' && (
              <p className="mt-4 text-red-500">Error submitting mock test series. Please try again.</p>
            )}
          </div>
        </div>
        
        {/* Mock Test Series Creation Tips */}
        <div className="sticky top-10 hidden lg:block max-w-[400px] flex-1 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6 ">
          <p className="mb-8 text-lg text-richblack-5">⚡ Mock Test Series Creation Tips</p>
          <ul className="ml-5 list-item list-disc space-y-4 text-xs text-richblack-5">
            <li>Choose a clear and descriptive name for your series.</li>
            <li>Provide a comprehensive description of what the series covers.</li>
            <li>Set a fair price considering the content and number of tests.</li>
            <li>Include a variety of mock tests to cover different aspects of the subject.</li>
            <li>Ensure all test IDs are correct and correspond to existing tests.</li>
            <li>Review your series details before submission.</li>
            <li>Use the draft option if you need to come back and finish later.</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default AddMockTestSeries;