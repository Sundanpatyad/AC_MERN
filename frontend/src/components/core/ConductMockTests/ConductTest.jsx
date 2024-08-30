import React, { useState, useEffect } from 'react';

const ConductTest = ({ currentTest, endTest }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(currentTest.duration * 60);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Array(currentTest.questions.length).fill(false));
  const [userAnswers, setUserAnswers] = useState(new Array(currentTest.questions.length).fill(''));

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      endTest(userAnswers);
    }
  }, [timeLeft, endTest, userAnswers]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[currentQuestion] = true;
    setAnsweredQuestions(newAnsweredQuestions);

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = answer;
    setUserAnswers(newUserAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion + 1 < currentTest.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(userAnswers[currentQuestion + 1] || '');
    } else {
      endTest(userAnswers);
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestion + 1 < currentTest.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(userAnswers[currentQuestion + 1] || '');
    } else {
      endTest(userAnswers);
    }
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestion(index);
    setSelectedAnswer(userAnswers[index] || '');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const currentQuestionData = currentTest.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-black flex items-center overflow-hidden justify-center p-4">
      <div className="w-full md:w-[90vw] bg-black border border-gray-700 shadow-2xl rounded-xl p-6 md:p-10 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{currentTest.testName}</h2>
          <div className="text-lg md:text-xl font-semibold text-white">
            Time left: <span className="text-blue-400">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-semibold text-white">
            Question {currentQuestion + 1} of {currentTest.questions.length}
          </h3>
          <p className="text-white text-lg md:text-xl">{currentQuestionData.text}</p>
        </div>
        <div className="space-y-4">
          {currentQuestionData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full py-3 px-6 text-sm text-left rounded-lg transition duration-300 ${
                selectedAnswer === option
                  ? 'bg-white text-gray-900 font-semibold'
                  : 'bg-black border border-white text-white hover:bg-gray-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex gap-4 justify-between w-full">
          <button
            onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
            disabled={currentQuestion === 0}
            className={`py-2 px-4 md:py-3 md:px-6 text-xs md:text-sm font-semibold rounded-lg transition duration-300 w-full md:w-auto ${
              currentQuestion > 0
                ? 'bg-white text-gray-900 hover:bg-gray-100'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleSkipQuestion}
            className="py-2 px-4 md:py-3 md:px-6 font-semibold rounded-lg text-xs md:text-sm transition duration-300 bg-white text-black hover:bg-slate-200 w-full md:w-auto"
          >
            Skip
          </button>
          <button
            onClick={handleNextQuestion}
            className={`py-2 px-4 md:py-3 md:px-6 font-semibold rounded-lg text-xs md:text-sm transition duration-300 w-full md:w-auto ${
              selectedAnswer
                ? 'bg-white text-black hover:bg-gray-100'
                : 'bg-gray-700 border border-white text-white cursor-not-allowed'
            }`}
          >
            {currentQuestion + 1 === currentTest.questions.length ? 'Finish Test' : 'Next'}
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {currentTest.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => handleQuestionNavigation(index)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full font-semibold text-sm transition duration-300 ${
                index === currentQuestion
                  ? 'bg-white text-gray-900'
                  : answeredQuestions[index]
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConductTest;