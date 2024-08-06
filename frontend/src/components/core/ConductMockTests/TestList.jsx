import React from 'react';

const TestList = ({ testSeries, startTest }) => {
  const publishedTests = testSeries.mockTests.filter(test => test.status === 'published');

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center p-4">
      <div className="w-full max-w-4xl bg-gray-800 shadow-2xl rounded-xl p-6 md:p-10 space-y-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white text-center">{testSeries.seriesName}</h1>
        <p className="text-richblack-300 text-lg text-center">{testSeries.description}</p>
        <div className="grid gap-6 md:grid-cols-2">
          {publishedTests.map((test, index) => (
            <button
              key={index}
              onClick={() => startTest(test)}
              className="py-4 px-6 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105 shadow-lg"
            >
              Start {test.testName}
            </button>
          ))}
        </div>
        <div className="space-y-4 text-richblack-100">
          <p className="font-semibold text-xl">Please read the following instructions carefully before starting the test:</p>
          <ol className="list-decimal list-inside space-y-2">
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
          <p className="font-semibold mt-4">Good luck with your test!</p>
        </div>
      </div>
    </div>
  );
};

export default TestList;