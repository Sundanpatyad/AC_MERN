import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link, Navigate, useParams } from 'react-router-dom';
import { mocktestEndpoints } from '../../../../services/apis';

const {
  CREATE_MOCKTEST_API
} = mocktestEndpoints;

const AddMockTest = () => {
  const { token } = useSelector((state) => state.auth); // Access token from Redux store
  const { id } = useParams(); // Extract ID from URL
  const [testName, setTestName] = useState('');
  const [duration, setDuration] = useState('');
  const [questions, setQuestions] = useState([]);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [createdMockTest, setCreatedMockTest] = useState(null);
  const [status, setStatus] = useState('published'); // Add state for draft or published

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mockTestData = { testName, duration, questions, status, id };

    try {
      // Add authorization header with token (if applicable)
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(CREATE_MOCKTEST_API, mockTestData, { headers });
      setSubmitStatus('success');
      setCreatedMockTest(response.data.data); // Assuming response data has a 'data' property
      console.log('Server response:', response.data.data);

      // Redirect to dashboard if submission was successful
      if (response.data.success) {
        setTimeout(() => {
          <Navigate to={`/dashboard/instructor`} />;
        }, 1000);
      }

      // Reset form
      setTestName('');
      setDuration('');
      setQuestions([]);
      setStatus('published'); // Reset status to published after successful submission
    } catch (error) {
      console.error('Error submitting mock test:', error);
      setSubmitStatus('error');
    }
  };

  const handleDraft = async (e) => {
    e.preventDefault();
    setStatus('draft'); // Set status to draft
    await handleSubmit(e); // Call the submit function to handle the draft status
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const deleteQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  return (
    <>
      {/* {submitStatus === 'success' && <Navigate to={`/dashboard/instructor`} />} */}
      <div className="flex w-full items-start gap-x-6 bg-richblack-900 min-h-screen p-8">
        <div className="flex flex-1 flex-col">
          <h1 className="mb-14 text-3xl font-medium text-richblack-5 font-boogaloo text-center lg:text-left">
            Add Mock Test
          </h1>
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="testName" className="block text-sm font-medium text-richblack-5">Test Name</label>
                <input
                  type="text"
                  id="testName"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  required
                  className="mt-1 block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-richblack-5">Duration (minutes)</label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  className="mt-1 block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <h2 className="text-xl font-semibold mt-8 mb-4 text-richblack-5">Questions</h2>
              {questions.map((question, index) => (
                <div key={index} className="space-y-4 bg-richblack-800 p-4 rounded-lg border border-richblack-700 relative">
                  <input
                    type="text"
                    placeholder="Question text"
                    value={question.text}
                    onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                    className="block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  {question.options.map((option, optionIndex) => (
                    <input
                      key={optionIndex}
                      type="text"
                      placeholder={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...question.options];
                        newOptions[optionIndex] = e.target.value;
                        updateQuestion(index, 'options', newOptions);
                      }}
                      className="block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  ))}
                  <select
                    value={question.correctAnswer}
                    onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                    className="block w-full mt-1 rounded-md border-richblack-600 bg-richblack-700 text-richblack-5 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-500 focus:ring-opacity-50"
                  >
                    <option value="">Select correct answer</option>
                    {question.options.map((option, optionIndex) => (
                      <option key={optionIndex} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={() => deleteQuestion(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={addQuestion}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-richblack-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
              >
                Add Question
              </button>
              <div className="flex gap-x-4">
                <button 
                  type="submit"
                  onClick={() => setStatus('published')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-richblack-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
                >
                  Submit Test
                </button>
                <Link to={"/dashboard/instructor"}
                  
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-richblack-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
                >
                  Publish Mocktest
                </Link>
              </div>
            </form>
            {submitStatus === 'success' && (
              <p className="mt-4 text-3xl font-medium text-richblack-5 ">Mock test submitted successfully!</p>
            )}
            {submitStatus === 'error' && (
              <p className="mt-4 text-3xl font-medium text-richblack-5 ">Error submitting mock test. Please try again.</p>
            )}
          </div>
        </div>
        
        {/* Mock Test Creation Tips */}
        <div className="sticky top-10 hidden lg:block max-w-[400px] flex-1 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6 ">
          <p className="mb-8 text-lg text-richblack-5">⚡ Mock Test Creation Tips</p>
          <ul className="ml-5 list-item list-disc space-y-4 text-xs text-richblack-5">
            <li>Ensure your test name is clear and descriptive.</li>
            <li>Set an appropriate duration for the test.</li>
            <li>Create a variety of questions to test different skills.</li>
            <li>Provide clear and concise question texts.</li>
            <li>Ensure all options for multiple-choice questions are distinct.</li>
            <li>Double-check that you've selected the correct answer for each question.</li>
            <li>Review your test for any errors before submission.</li>
            <li>Use the delete button to remove any unnecessary questions.</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default AddMockTest;
