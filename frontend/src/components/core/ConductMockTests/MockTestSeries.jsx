import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  const [userAnswers, setUserAnswers] = useState([]);
  const { GET_MCOKTEST_SERIES_BY_ID, CREATE_ATTEMPT_DETAILS } = mocktestEndpoints

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
    setUserAnswers(new Array(test.questions.length).fill(''));
  };

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
      endTest();
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestion + 1 < currentTest.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(userAnswers[currentQuestion + 1] || '');
    } else {
      endTest();
    }
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestion(index);
    setSelectedAnswer(userAnswers[index] || '');
  };

  const calculateScore = () => {
    let newScore = 0;
    let newCorrectAnswers = [];
    let newIncorrectAnswers = [];

    currentTest.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        newScore += 1;
        newCorrectAnswers.push(index);
      } else if (userAnswers[index] !== '') {
        newScore -= 0.25;
        newIncorrectAnswers.push({
          questionIndex: index,
          userAnswer: userAnswers[index],
          correctAnswer: question.correctAnswer
        });
      }
    });

    setScore(newScore);
    setCorrectAnswers(newCorrectAnswers);
    setIncorrectAnswers(newIncorrectAnswers);

    return {
      score: newScore,
      correctAnswers: newCorrectAnswers.length,
      incorrectAnswers: newIncorrectAnswers.length,
      incorrectAnswerDetails: newIncorrectAnswers
    };
  };

  const sendScoreToBackend = async (scoreData) => {
    try {
      const response = await axios.post(
        CREATE_ATTEMPT_DETAILS,
        {
          mockId,
          testName: currentTest.testName,
          score: scoreData.score,
          totalQuestions: currentTest.questions.length,
          timeTaken: currentTest.duration * 60 - timeLeft,
          correctAnswers: scoreData.correctAnswers,
          incorrectAnswers: scoreData.incorrectAnswers,
          incorrectAnswerDetails: scoreData.incorrectAnswerDetails.map(item => ({
            questionText: currentTest.questions[item.questionIndex].text,
            userAnswer: item.userAnswer,
            correctAnswer: item.correctAnswer
          }))
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

    } catch (error) {
      console.error('Error submitting score:', error);
      toast.error("Failed to submit score");
    }
  };

  const endTest = () => {
    const scoreData = calculateScore();
    setShowScore(true);
    setTimeLeft(0);
    sendScoreToBackend(scoreData);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const renderAttemptDetails = () => {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h3 className="text-2xl font-bold text-white mb-2 sm:mb-0">Attempt Details</h3>
          <p className="text-indigo-300 text-lg">
            Total Time: {formatTime(currentTest.duration * 60 - timeLeft)}
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

  if (!currentTest) {
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
  }

  if (showScore) {
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
                className="py-3 px-6 bg-slate-200 text-black font-bold rounded-lg hover:bg-gray-700transition duration-300 shadow-md"
              >
                {showAttemptDetails ? "Hide Attempt Details" : "Show Attempt Details"}
              </button>
              <button
                onClick={() => setCurrentTest(null)}
                className="py-3 px-6 bg-slate-200 text-black font-bold rounded-lg hover:bg-gray-700 transition duration-300 shadow-md"
              >
                Back to Test List
              </button>
              <Link to={"/rankings"}

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
  }

  const currentQuestionData = currentTest.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-black flex items-center overflow-hidden justify-center p-4">
      <div className="w-full md:w-[90vw]  bg-black border border-gray-700 shadow-2xl rounded-xl p-6 md:p-10 space-y-6">
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
              className={`w-full py-3 px-6  text-sm text-left rounded-lg transition duration-300 ${selectedAnswer === option
                ? 'bg-white text-gray-900 font-semibold'
                : 'bg-black border border-white text-white hover:bg-gray-600'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center">
          {/* <button
            onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
            disabled={currentQuestion === 0}
            className={`py-3 px-6 text-sm font-semibold rounded-lg transition duration-300 ${currentQuestion > 0
                ? 'bg-white text-gray-900 hover:bg-gray-100'
                : 'bg-gray-700  text-gray-400 cursor-not-allowed'
              }`}
          >
            Previous
          </button> */}
          <div className="flex gap-4 justify-between w-full">
            <button
              onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
              className={`py-2 px-4 md:py-3 md:px-6 text-xs md:text-sm font-semibold rounded-lg transition duration-300 w-full md:w-auto ${currentQuestion > 0
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
              disabled={!selectedAnswer}
              className={`py-2 px-4 md:py-3 md:px-6 font-semibold rounded-lg text-xs md:text-sm transition duration-300 w-full md:w-auto ${selectedAnswer
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-gray-700 border border-white text-white cursor-not-allowed'
                }`}
            >
              {currentQuestion + 1 === currentTest.questions.length ? 'Finish Test' : 'Next'}
            </button>
          </div>
          {/* <button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
              className={`py-3 px-6 font-semibold rounded-lg text-sm transition duration-300 ${
                selectedAnswer
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-gray-700 border border-white text-white cursor-not-allowed'
              }`}
            >
              {currentQuestion + 1 === currentTest.questions.length ? 'Finish Test' : 'Next'}
            </button> */}
          {/* <button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer}
            className={`py-3 px-6 font-semibold rounded-lg text-sm transition duration-300 ${selectedAnswer
                ? 'bg-white text-black hover:bg-gray-100'
                : 'bg-gray-700 border border-white text-white cursor-not-allowed'
              }`}
          >
            {currentQuestion + 1 === currentTest.questions.length ? 'Finish Test' : 'Next'}
          </button> */}
        </div>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {currentTest.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => handleQuestionNavigation(index)} className={`w-8 h-8 md:w-10 md:h-10 rounded-full font-semibold text-sm transition duration-300 ${index === currentQuestion
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