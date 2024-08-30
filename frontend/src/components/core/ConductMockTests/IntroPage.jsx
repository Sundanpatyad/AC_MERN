import React from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from './Spinner';

const MockTestIntro = ({ testSeries, loading, error, startTest }) => {
  if (loading) {
    return <LoadingSpinner title={"Loading Tests"} />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-center text-2xl font-bold text-white p-8 bg-gray-800 rounded-lg shadow-md max-w-md">
          {error}
        </div>
      </div>
    );
  }

  if (!testSeries) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="text-center text-2xl font-bold text-white p-8 bg-gray-800 rounded-lg shadow-md max-w-md">
          No test series found.
        </div>
      </div>
    );
  }

  const publishedTests = testSeries.mockTests.filter(test => test.status === 'published');

  return (
    <div className="min-h-screen bg-black flex justify-center p-4">
      <div className="w-full max-w-6xl bg-black border border-gray-700 shadow-2xl rounded-xl overflow-hidden">
        <div className="p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center">{testSeries.seriesName}</h1>
          <p className="text-richblack-300 text-lg text-center mt-2">{testSeries.description}</p>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publishedTests.map((test, index) => (
              <button
                key={index}
                onClick={() => startTest(test)}
                className="py-4 px-6 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                Start {test.testName}
              </button>
            ))}
          </div>

          {testSeries.attachments &&
            testSeries.attachments.map((item, index) => (
              <div
                key={index}
                className="py-4 px-6 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105 shadow-lg flex flex-col items-start space-y-2"
              >
                <div className="flex items-center">
                  <span className="mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  {item.name}
                </div>
                <a href={item.questionPaper} className="text-blue-500 hover:underline">
                  Download Question Paper
                </a>
                <a href={item.answerKey} className="text-blue-500 hover:underline">
                  Download Answer Key
                </a>
                <a href={item.omrSheet} className="text-blue-500 hover:underline">
                  Download OMR Sheet
                </a>
              </div>
            ))
          }

          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="font-semibold text-xl text-white mb-4">Test Instructions:</h2>
            <ol className="list-decimal list-inside space-y-2 text-richblack-100">
              <li>This is a timed test. Once you start, the timer cannot be paused.</li>
              <li>Each question has only one correct answer.</li>
              <li>You can navigate between questions using the 'Next' and 'Previous' buttons or the question number buttons at the bottom.</li>
              <li>You can change your answer at any time before submitting the test.</li>
              <li>There is negative marking. Each correct answer is awarded 1 mark, and 0.25 marks are deducted for each incorrect answer.</li>
              <li>Unanswered questions will not be penalized.</li>
              <li>Once you finish the test or the time runs out, your answers will be automatically submitted.</li>
              <li>Ensure you have a stable internet connection throughout the test.</li>
              <li>Do not refresh the page or close the browser window during the test.</li>
              <li>If you face any technical issues, please contact the support team immediately.</li>
            </ol>
            <p className="font-semibold mt-4 text-white">Good luck with your test!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTestIntro;