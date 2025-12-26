import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from "react-hot-toast";
import axios from 'axios';
import { mocktestEndpoints } from '../../../services/apis';
import LoadingSpinner from './Spinner';
import Footer from '../../common/Footer';
import { motion, AnimatePresence } from "framer-motion";
import { BsFiletypePdf, BsExclamationTriangle } from "react-icons/bs";
import { AiOutlineCaretDown, AiOutlineHome } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { IoMdTime } from "react-icons/io";
import { IoChevronBackCircle } from "react-icons/io5";

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
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const { GET_MCOKTEST_SERIES_BY_ID, CREATE_ATTEMPT_DETAILS } = mocktestEndpoints;
  const [openTestIndex, setOpenTestIndex] = useState(null);
  const [isRankOpen, setIsRankOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
    setSkippedQuestions([]);
    setOpenTestIndex(null);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  const startTestConfirm = (index) => {
    setOpenTestIndex(index);
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[currentQuestion] = true;
    setAnsweredQuestions(newAnsweredQuestions);

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = answer;
    setUserAnswers(newUserAnswers);

    const newSkippedQuestions = skippedQuestions.filter(q => q !== currentQuestion);
    setSkippedQuestions(newSkippedQuestions);
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
    const newSkippedQuestions = [...skippedQuestions];
    if (!newSkippedQuestions.includes(currentQuestion)) {
      newSkippedQuestions.push(currentQuestion);
    }
    setSkippedQuestions(newSkippedQuestions);

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
        newCorrectAnswers.push({
          questionIndex: index,
          userAnswer: userAnswers[index],
          correctAnswer: question.correctAnswer
        });
      } else if (userAnswers[index] !== '') {
        newScore -= currentTest.negative;
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
      correctAnswers: newCorrectAnswers,
      incorrectAnswers: newIncorrectAnswers.length,
      correctAnswerDetails: newCorrectAnswers,
      incorrectAnswerDetails: newIncorrectAnswers
    };
  };

  const sendScoreToBackend = async (scoreData) => {
    try {
      console.log(scoreData, "scoreData");
      const response = await axios.post(
        CREATE_ATTEMPT_DETAILS,
        {
          mockId,
          testName: currentTest.testName,
          score: scoreData.score,
          totalQuestions: currentTest.questions.length,
          timeTaken: currentTest.duration * 60 - timeLeft,
          correctAnswers: scoreData.correctAnswerDetails.map(item => ({
            questionText: currentTest.questions[item.questionIndex].text,
            userAnswer: item.userAnswer,
            correctAnswer: item.correctAnswer
          })),
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
      // Handle successful response if needed
    } catch (error) {
      console.error('Error submitting score:', error);
      toast.error("Failed to submit score");
    }
  };

  const endTest = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
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

  const rankOpen = () => {
    setIsRankOpen(true);
  };

  const rankClose = (testName) => {
    navigate(`/rankings/${testName}`);
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
            const isCorrect = correctAnswers.some(item => item.questionIndex === index);
            const userAnswer = userAnswers[index] || "Not answered";

            return (
              <div key={index} className="bg-zinc-800 p-6 rounded-xl shadow-lg border border-gray-600">
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
      <div className="min-h-screen bg-black p-4 md:p-8">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="border-b border-white/10 pb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              {testSeries.seriesName}
            </h1>
            <p className="text-gray-400 text-base md:text-lg">
              {testSeries.description}
            </p>
          </div>

          {/* Tests List or Coming Soon */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Available Tests</h2>

            {publishedTests.length === 0 ? (
              // Coming Soon Message
              <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4 border border-white/10 rounded-lg bg-white/5">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 mb-4 md:mb-6">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Coming Soon</h3>
                <p className="text-gray-400 text-center text-sm md:text-base max-w-md px-4">
                  Mock tests for this series are currently being prepared. Check back soon for updates!
                </p>
              </div>
            ) : (
              // Tests List
              <div className="space-y-3">
                {publishedTests.map((test, index) => (
                  <React.Fragment key={index}>
                    <div className="group flex flex-col md:flex-row md:items-center md:justify-between p-4 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/5 transition-all duration-200 gap-4">
                      <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/10 flex items-center justify-center text-white font-semibold text-sm md:text-base flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-base md:text-lg mb-1 md:mb-0">{test.testName}</h3>
                          <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-1 text-xs md:text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {test.duration} mins
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {test.questions.length} questions
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => startTestConfirm(index)}
                        className="w-full md:w-auto px-4 md:px-6 py-2 md:py-2.5 bg-white text-black font-semibold text-sm md:text-base rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        Start Test
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    <AnimatePresence>
                      {openTestIndex === index && (
                        <div className="fixed inset-0 z-50 h-screen w-screen flex items-center justify-center p-4 backdrop-blur-md">
                          <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={modalVariants}
                            className="relative"
                          >
                            {test.questions.length === 0 ? (
                              // Preparing Questions Modal
                              <div className="bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6">
                                <div className="flex flex-col items-center text-center">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/30 mb-4">
                                    <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <h3 className="text-xl font-bold text-white mb-2">
                                    Preparing Questions
                                  </h3>
                                  <p className="text-sm text-gray-400 mb-6">
                                    Questions for this test are currently being prepared. Please check back later.
                                  </p>
                                  <button
                                    onClick={() => setOpenTestIndex(null)}
                                    className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300"
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // Start Test Confirmation Modal
                              <div className="bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6">
                                <div className="flex items-center mb-4">
                                  <BsExclamationTriangle className="text-yellow-500 text-2xl mr-3" />
                                  <h3 className="text-lg font-semibold text-slate-300">
                                    Confirm Start Test Now
                                  </h3>
                                </div>
                                <p className="text-sm text-slate-300 mb-4">
                                  Are you sure you want to Start?
                                </p>
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => setOpenTestIndex(null)}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300"
                                  >
                                    <AiOutlineHome className="mr-2" />
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => startTest(test)}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
                                  >
                                    <FiLogOut className="mr-2" />
                                    Start Now
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          {testSeries.attachments && testSeries.attachments.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Study Materials</h2>
              <div className="space-y-3">
                {testSeries.attachments.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/5 transition-all duration-200"
                  >
                    <h3 className="text-white font-medium mb-3">{item.name}</h3>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={item.questionPaper}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Question Paper
                      </a>
                      <a
                        href={item.answerKey}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Answer Key
                      </a>
                      <a
                        href={item.omrSheet}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        OMR Sheet
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test Instructions</h2>
            <ol className="list-decimal list-inside space-y-2.5 text-gray-300 text-sm md:text-base">
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
    );
  }

  if (showScore) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-black border border-gray-700 shadow-2xl rounded-2xl overflow-hidden">
          <button
            onClick={() => {
              setCurrentTest(null);
              setOpenTestIndex(null);
            }}
            className="py-2 px-2 m-2 bg-slate-200 text-black font-bold rounded-full hover:bg-gray-700 transition duration-300 shadow-md"
          >
            <IoChevronBackCircle size={"16"} />
          </button>
          <div className="bg-black p-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              {currentTest.testName} Completed
            </h2>
          </div>
          <div className='text-center'>
            <button onClick={rankOpen}
              className="py-3 px-6 text-center bg-slate-200 text-black font-bold rounded-lg hover:bg-gray-700 transition duration-300 shadow-md"
            >
              See My Rank
            </button>

            <AnimatePresence>
              {isRankOpen && (
                <div className="fixed inset-0 z-50 h-screen w-screen flex items-center justify-center p-4 backdrop-blur-md">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={modalVariants}
                    className="relative"
                  >
                    <div
                      className="bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6"
                    >
                      <div className="flex items-center mb-4">
                        <BsExclamationTriangle className="text-yellow-500 text-2xl mr-3" />
                        <h3 className="text-lg font-semibold text-slate-300">
                          Confirm Goto Rankings
                        </h3>
                      </div>
                      <p className="text-sm text-slate-300 mb-4">
                        Are you sure you want to Navigate to Rankings ? This action will clear your current attempt details!
                      </p>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setIsRankOpen(false)}
                          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300"
                        >
                          <IoMdTime className="mr-2" />
                          Wait
                        </button>
                        <button
                          onClick={() => rankClose(currentTest.testName)}
                          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
                        >
                          <FiLogOut className="mr-2" />
                          Yes
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
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
                {showAttemptDetails ? "Hide Answers" : "Show Answers"}
              </button>
            </div>

            {showAttemptDetails && (
              <div className="mt-8 bg-zinc-900 p-6 rounded-lg">
                {renderAttemptDetails()}
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  const currentQuestionData = currentTest.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-black flex items-center overflow-hidden justify-center p-4">
      <div className="w-full md:w-[90vw] bg-black border border-gray-700 shadow-2xl rounded-xl p-6 md:p-10 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{currentTest.testName}</h2>
          <div className="text-lg md:text-xl font-semibold text-white">
            Time left: <span className="text-red-500">{formatTime(timeLeft)}</span>
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
              className={`w-full py-3 px-6 text-sm text-left rounded-lg transition duration-300 ${selectedAnswer === option
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
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {currentTest.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => handleQuestionNavigation(index)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full font-semibold text-sm transition duration-300 
                ${index === currentQuestion
                  ? 'bg-violet-700 text-white'
                  : answeredQuestions[index]
                    ? 'bg-white text-gray-900'
                    : skippedQuestions.includes(index)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default MockTestSeries;