import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ResultsPage = ({ currentTest, score, correctAnswers, incorrectAnswers, userAnswers, setCurrentTest }) => {
  const [showAttemptDetails, setShowAttemptDetails] = useState(false);

  const renderAttemptDetails = () => {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h3 className="text-2xl font-bold text-white mb-2 sm:mb-0">Attempt Details</h3>
          <p className="text-indigo-300 text-lg">
            Total Time: {formatTime(currentTest.duration * 60)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentTest.questions.map((question, index) => {
            const incorrectAnswer = incorrectAnswers.find(item => item.questionIndex === index);
            const isCorrect = correctAnswers.includes(index);
            const userAnswer = userAnswers[index] || "Not answered";

            return (
              <div key={index} className="bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-600">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-white">Question {index + 1}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${isCorrect ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <p className="text-gray-100 mb-4">{question.text}</p>
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <span className="font-medium text-indigo-300">Your Answer:</span> {userAnswer}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium text-indigo-300">Correct Answer:</span> {question.correctAnswer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-black border border-gray-700 shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-black p-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            {currentTest.testName} Completed
          </h2>
        </div>
        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-black border border-gray-700 p-4 rounded-lg">
              <p className="text-lg sm:text-xl font-semibold text-gray-300">Score</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-400">
                {score.toFixed(2)} / {currentTest.questions.length}
              </p>
            </div>
            <div className="bg-black border border-gray-700 p-4 rounded-lg">
              <p className="text-lg sm:text-xl font-semibold text-gray-300">Correct</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-400">{correctAnswers.length}</p>
            </div>
            <div className="bg-black border border-gray-700 p-4 rounded-lg">
              <p className="text-lg sm:text-xl font-semibold text-gray-300">Incorrect</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-400">{incorrectAnswers.length}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setShowAttemptDetails(!showAttemptDetails)}
              className="py-3 px-6 bg-slate-200 text-black font-bold rounded-lg hover:bg-gray-700 transition duration-300 shadow-md"
            >
              {showAttemptDetails ? "Hide Attempt Details" : "Show Attempt Details"}
            </button>
            <button
              onClick={() => setCurrentTest(null)}
              className="py-3 px-6 bg-slate-200 text-black font-bold rounded-lg hover:bg-gray-700 transition duration-300 shadow-md"
            >
              Back to Test List
            </button>
            <Link to="/rankings"
              className="py-3 px-6 text-center bg-slate-200 text-black font-bold rounded-lg hover:bg-gray-700 transition duration-300 shadow-md"
            >
              See My Rank
            </Link>
          </div>

          {showAttemptDetails && (
            <div className="mt-8 bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-white">Attempt Details</h3>
              {renderAttemptDetails()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;