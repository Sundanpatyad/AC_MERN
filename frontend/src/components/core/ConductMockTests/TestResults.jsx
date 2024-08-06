import React, { useState } from 'react';

const TestResult = ({ currentTest, score, correctAnswers, incorrectAnswers, setCurrentTest }) => {
  const [showAttemptDetails, setShowAttemptDetails] = useState(false);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const renderAttemptDetails = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white">Attempt Details</h3>
        <p className="text-richblack-100">Total Time Taken: {formatTime(currentTest.duration)}</p>
        <div className="space-y-4">
          {currentTest.questions.map((question, index) => {
            const incorrectAnswer = incorrectAnswers.find(item => item.questionIndex === index);
            const isCorrect = correctAnswers.includes(index);
            const userAnswer = incorrectAnswer ? incorrectAnswer.userAnswer : (isCorrect ? question.correctAnswer : "Not answered");

            return (
              <div key={index} className="bg-gray-700 p-4 rounded-lg shadow-md">
                <p className="text-gray-100 font-semibold mb-2">Question {index + 1}: {question.text}</p>
                <p className="text-gray-300">Your Answer: {userAnswer}</p>
                <p className="text-gray-300">Correct Answer: {question.correctAnswer}</p>
                <p className={isCorrect ? "text-green-400" : "text-rose-500"}>
                  {isCorrect ? "Correct" : "Incorrect"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 shadow-2xl rounded-xl p-8 text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white">{currentTest.testName} Completed</h2>
        <div className="space-y-4">
          <p className="text-2xl md:text-3xl text-white">
            Your score: <span className="font-bold text-blue-400">{score.toFixed(2)}</span> out of {currentTest.questions.length}
          </p>
          <p className="text-xl text-white">
            Correct answers: <span className="font-bold text-green-400">{correctAnswers.length}</span>
          </p>
          <p className="text-xl text-white">
            Incorrect answers: <span className="font-bold text-red-400">{incorrectAnswers.length}</span>
          </p>
        </div>
        <button
          onClick={() => setShowAttemptDetails(!showAttemptDetails)}
          className="py-3 px-6 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105 shadow-lg"
        >
          {showAttemptDetails ? "Hide Attempt Details" : "Show Attempt Details"}
        </button>
        {showAttemptDetails && renderAttemptDetails()}
        <button
          onClick={() => setCurrentTest(null)}
          className="py-3 px-6 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105 shadow-lg"
        >
          Back to Test List
        </button>
      </div>
    </div>
  );
};

export default TestResult;
