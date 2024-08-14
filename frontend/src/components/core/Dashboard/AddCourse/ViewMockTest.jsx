import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { mocktestEndpoints } from '../../../../services/apis';


const ViewMockTest = () => {
  const { token } = useSelector((state) => state.auth);
  const [mockTest, setMockTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { mockId } = useParams();
  const {GET_MOCK_TEST_API}  = mocktestEndpoints

  useEffect(() => {
    const fetchMockTest = async () => {
      try {
        // //console.log('Fetching mock test with ID:', mockId);  // Log mockId
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${GET_MOCK_TEST_API}/${mockId}`, { headers });
        // //console.log('API response:', response.data);  // Log API response
        setMockTest(response.data.data);
        setLoading(false);
      } catch (error) {
        // console.error('Error details:', error);  // Log error details
        setError(error.response?.data?.message || 'Error fetching mock test');
        setLoading(false);
      }
    };

    fetchMockTest();
  }, [token, mockId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!mockTest) {
    return <div>No mock test available.</div>;
  }

  return (
    <div className="flex flex-col items-center bg-richblack-900 min-h-screen p-8">
      <h1 className="mb-8 text-3xl font-medium text-richblack-5 font-boogaloo text-center">View Mock Test</h1>
      <div className="mb-6 p-4 w-full max-w-2xl bg-richblack-800 rounded-md shadow-md">
        <h2 className="text-xl font-semibold text-yellow-500 mb-4">{mockTest.testName}</h2>
        <p className="text-richblack-5 mb-2"><strong>Duration:</strong> {mockTest.duration} minutes</p>
        <div className="space-y-4">
          {mockTest.questions?.map((question, index) => (
            <div key={index} className="p-4 bg-richblack-700 rounded-lg border border-richblack-600">
              <p className="text-richblack-5 mb-2"><strong>Question {index + 1}:</strong> {question.text}</p>
              <ul className="list-disc ml-5 space-y-2 text-richblack-5">
                {question.options.map((option, optionIndex) => (
                  <li key={optionIndex} className={option === question.correctAnswer ? 'text-green-500' : ''}>
                    {option}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-green-500"><strong>Correct Answer:</strong> {question.correctAnswer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewMockTest;
