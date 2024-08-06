import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from "react-hot-toast";
import axios from 'axios';
import { mocktestEndpoints } from '../../../services/apis';
import LoadingSpinner from './Spinner';

const MockTestSeries = () => {
  const { mockId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [testSeries, setTestSeries] = useState(null);
  const [currentTest, setCurrentTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [showAttemptDetails, setShowAttemptDetails] = useState(false);
  const { GET_MCOKTEST_SERIES_BY_ID , CREATE_ATTEMPT_DETAILS} = mocktestEndpoints

  useEffect(() => {
    fetchTestSeries();
  }, [mockId]);

  useEffect(() => {
    if (currentTest && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentTest) {
      endTest();
    }
  }, [timeLeft, currentTest]);

  const fetchTestSeries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${GET_MCOKTEST_SERIES_BY_ID}/${mockId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestSeries(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching test series:', error);
      setError('Failed to load mock test details');
      toast.error("Failed to load mock test details");
      setLoading(false);
    }
  };

  const startTest = (test) => {
    setCurrentTest(test);
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setTimeLeft(test.duration * 60);
    setAnsweredQuestions(new Array(test.questions.length).fill(false));
    setCorrectAnswers([]);
    setIncorrectAnswers([]);
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[currentQuestion] = true;
    setAnsweredQuestions(newAnsweredQuestions);
  };

  const handleNextQuestion = () => {
    const currentQuestionData = currentTest.questions[currentQuestion];
    if (selectedAnswer === currentQuestionData.correctAnswer) {
      setScore(score + 1);
      setCorrectAnswers([...correctAnswers, currentQuestion]);
    } else {
      setScore(score - 0.25); // Apply negative marking
      setIncorrectAnswers([...incorrectAnswers, {
        questionIndex: currentQuestion,
        userAnswer: selectedAnswer,
        correctAnswer: currentQuestionData.correctAnswer
      }]);
    }

    setSelectedAnswer('');
    
    if (currentQuestion + 1 < currentTest.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      endTest();
    }
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestion(index);
    setSelectedAnswer('');
  };

  const sendScoreToBackend = async () => {
    try {
      const response = await axios.post(
        CREATE_ATTEMPT_DETAILS,
        {
          mockId,
          testName: currentTest.testName,
          score,
          totalQuestions: currentTest.questions.length,
          timeTaken: currentTest.duration * 60 - timeLeft,
          correctAnswers: correctAnswers.length,
          incorrectAnswers: incorrectAnswers.length,
          incorrectAnswerDetails: incorrectAnswers.map(item => ({
            questionText: currentTest.questions[item.questionIndex].text,
            userAnswer: item.userAnswer,
            correctAnswer: item.correctAnswer
          }))
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success("Score submitted successfully");
      } else {
        toast.error("Failed to submit score");
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      toast.error("Failed to submit score");
    }
  };

  const endTest = () => {
    setShowScore(true);
    setTimeLeft(0);
    sendScoreToBackend();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const renderAttemptDetails = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white">Attempt Details</h3>
        <p className="text-richblack-100">Total Time Taken: {formatTime(currentTest.duration * 60 - timeLeft)}</p>
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

  if (loading) {
    return <LoadingSpinner title={"Loading Tests"}/>;
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
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-center text-2xl font-bold text-white p-8 bg-gray-800 rounded-lg shadow-md max-w-md">
          No test series found.
        </div>
      </div>
    );
  }

  if (!currentTest) {
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
  }

  if (showScore) {
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
            className="py-3 px-6  bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105 shadow-lg"
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
  }

  const currentQuestionData = currentTest.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-gray-800 shadow-2xl rounded-xl p-6 md:p-10 space-y-6">
        <div className="flex justify-between items-center">
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
              className={`w-full py-3 px-6 text-left rounded-lg transition duration-300 ${
                selectedAnswer === option
                  ? 'bg-white text-gray-900 font-semibold'
                  : 'bg-gray-700 border border-white text-white hover:bg-gray-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <button 
            onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
            disabled={currentQuestion === 0}
            className={`py-3 px-6 font-semibold rounded-lg transition duration-300 ${
              currentQuestion > 0
                ? 'bg-white text-gray-900 hover:bg-gray-100'
                : 'bg-gray-700  text-gray-400 cursor-not-allowed'
            }`}
          >
            Previous
          </button>
          <button 
            onClick={handleNextQuestion} 
            disabled={!selectedAnswer}
            className={`py-3 px-6 font-semibold rounded-lg transition duration-300 ${
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
              onClick={() => handleQuestionNavigation(index)}className={`w-8 h-8 md:w-10 md:h-10 rounded-full font-semibold text-sm transition duration-300 ${
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

export default MockTestSeries;