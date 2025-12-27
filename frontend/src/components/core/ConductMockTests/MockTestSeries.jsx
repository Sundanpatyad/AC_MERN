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
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-xl font-bold text-white">Review Solutions</h3>
          <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded-full">{currentTest.questions.length} Questions</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {currentTest.questions.map((question, index) => {
            const isCorrect = correctAnswers.some(item => item.questionIndex === index);
            const isIncorrect = incorrectAnswers.some(item => item.questionIndex === index);
            const isUnanswered = !isCorrect && !isIncorrect;
            const userAnswer = userAnswers[index] || "Not answered";

            return (
              <div
                key={index}
                className={`flex flex-col md:flex-row gap-6 p-6 rounded-2xl border transition-all duration-300 ${isCorrect ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10' :
                    isIncorrect ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10' :
                      'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800'
                  }`}
              >
                {/* Status Icon & Number */}
                <div className="flex-shrink-0 flex md:flex-col items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${isCorrect ? 'bg-green-500 text-white border-green-400' :
                      isIncorrect ? 'bg-red-500 text-white border-red-400' :
                        'bg-zinc-700 text-zinc-300 border-zinc-600'
                    }`}>
                    {index + 1}
                  </div>
                  <div className={`text-2xl ${isCorrect ? 'text-green-500' :
                      isIncorrect ? 'text-red-500' :
                        'text-zinc-500'
                    }`}>
                    {isCorrect ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : isIncorrect ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-gray-200 text-lg leading-relaxed font-medium">{question.text}</p>
                    {/* Add support for Match Question columns view in review if needed, currently kept simple */}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-500/10 border-green-500/20' :
                        isIncorrect ? 'bg-red-500/10 border-red-500/20' :
                          'bg-zinc-800 border-zinc-700'
                      }`}>
                      <p className="text-xs uppercase tracking-wider font-semibold mb-1 opacity-70">Your Answer</p>
                      <p className={`font-medium ${isCorrect ? 'text-green-400' :
                          isIncorrect ? 'text-red-400' :
                            'text-zinc-400'
                        }`}>
                        {userAnswer}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border bg-blue-500/5 border-blue-500/20">
                      <p className="text-xs uppercase tracking-wider font-semibold mb-1 text-blue-400/70">Correct Answer</p>
                      <p className="font-medium text-blue-400">
                        {question.correctAnswer}
                      </p>
                    </div>
                  </div>
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
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-inter">
        <div className="w-full max-w-5xl bg-zinc-900/50 border border-zinc-800 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm">

          {/* Header */}
          <div className="bg-gradient-to-r from-zinc-900 to-black p-6 md:p-10 border-b border-zinc-800 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <button
              onClick={() => {
                setCurrentTest(null);
                setOpenTestIndex(null);
              }}
              className="absolute top-6 left-6 p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-700 transition-all duration-300"
            >
              <IoChevronBackCircle size={24} />
            </button>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              Test Completed!
            </h2>
            <p className="text-zinc-400 text-lg">{currentTest.testName}</p>

            {/* Score Card */}
            <div className="mt-8 relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-zinc-800 flex flex-col items-center justify-center bg-zinc-900/50 shadow-2xl relative z-10">
                <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Score</span>
                <span className="text-3xl md:text-4xl font-bold text-white mt-1">
                  {score.toFixed(1)}
                </span>
                <span className="text-zinc-500 text-xs mt-1">out of {currentTest.questions.length}</span>
              </div>
              {/* Decorative glows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            </div>
          </div>

          <div className="p-6 md:p-10 space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700/50 text-center hover:bg-zinc-800 transition-colors group">
                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2 group-hover:text-zinc-300">Accuracy</p>
                <div className="text-2xl md:text-3xl font-bold text-blue-400">
                  {Math.round((correctAnswers.length / currentTest.questions.length) * 100)}%
                </div>
              </div>
              <div className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700/50 text-center hover:bg-zinc-800 transition-colors group">
                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2 group-hover:text-zinc-300">Correct</p>
                <div className="text-2xl md:text-3xl font-bold text-green-400">
                  {correctAnswers.length}
                </div>
              </div>
              <div className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700/50 text-center hover:bg-zinc-800 transition-colors group">
                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2 group-hover:text-zinc-300">Incorrect</p>
                <div className="text-2xl md:text-3xl font-bold text-red-400">
                  {incorrectAnswers.length}
                </div>
              </div>
              <div className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700/50 text-center hover:bg-zinc-800 transition-colors group">
                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2 group-hover:text-zinc-300">Unanswered</p>
                <div className="text-2xl md:text-3xl font-bold text-orange-400">
                  {currentTest.questions.length - (correctAnswers.length + incorrectAnswers.length)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 border-t border-zinc-800 pt-8">
              <button
                onClick={rankOpen}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                View Leadership Board
              </button>

              <button
                onClick={() => setShowAttemptDetails(!showAttemptDetails)}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all duration-300 border border-zinc-700 hover:border-zinc-600"
              >
                {showAttemptDetails ? (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> Hide Solutions</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> Review Solutions</>
                )}
              </button>
            </div>

            {/* Rank Modal */}
            <AnimatePresence>
              {isRankOpen && (
                <div className="fixed inset-0 z-50 h-screen w-screen flex items-center justify-center p-4 backdrop-blur-md bg-black/50">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={modalVariants}
                    className="relative"
                  >
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center mr-4">
                          <BsExclamationTriangle className="text-xl" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">View Rankings?</h3>
                          <p className="text-sm text-zinc-400">This will exit the current result view.</p>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setIsRankOpen(false)}
                          className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => rankClose(currentTest.testName)}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-colors"
                        >
                          Proceed
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Attempt Details Section */}
            {showAttemptDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-8 border-t border-zinc-800"
              >
                {renderAttemptDetails()}
              </motion.div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  const currentQuestionData = currentTest.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-inter">
      <div className="w-full md:w-[90vw] max-w-6xl bg-zinc-900/50 border border-zinc-800 shadow-2xl rounded-2xl p-6 md:p-10 space-y-8 backdrop-blur-sm relative overflow-hidden">

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / currentTest.questions.length) * 100}%` }}
          />
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-800">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{currentTest.testName}</h2>
            <p className="text-zinc-400 text-sm mt-1">Question {currentQuestion + 1} of {currentTest.questions.length}</p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2 rounded-full border border-zinc-700/50">
            <IoMdTime className="text-xl text-blue-400" />
            <span className={`text-lg font-mono font-medium ${timeLeft < 300 ? 'text-red-400' : 'text-gray-200'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Main Question Content */}
        <div className="space-y-6 min-h-[400px]">
          <div className="prose prose-invert max-w-none">
            <h3 className="text-xl md:text-2xl leading-relaxed font-medium text-gray-100">
              {currentQuestionData.text}
            </h3>
          </div>

          {/* Match Question Columns */}
          {currentQuestionData.questionType === 'MATCH' && currentQuestionData.leftColumn && currentQuestionData.rightColumn && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-blue-500/20">
                  <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded">COLUMN A</span>
                </div>
                {currentQuestionData.leftColumn.map((item, idx) => (
                  <div key={`left-${idx}`} className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">
                      {String.fromCharCode(97 + idx)}
                    </span>
                    <span className="text-gray-300 leading-relaxed">{item.replace(/^[a-z]\)\s*/, '')}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-orange-500/20">
                  <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-1 rounded">COLUMN B</span>
                </div>
                {currentQuestionData.rightColumn.map((item, idx) => (
                  <div key={`right-${idx}`} className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-gray-300 leading-relaxed">{item.replace(/^\d+\)\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {(currentQuestionData.questionType === 'MATCH'
              ? currentQuestionData.options.slice(0, 4)
              : currentQuestionData.options
            ).map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`group relative p-4 md:p-5 text-left rounded-xl border-2 transition-all duration-200 hover:shadow-lg
                  ${selectedAnswer === option
                    ? 'bg-blue-600/10 border-blue-500 shadow-blue-500/10'
                    : 'bg-zinc-800/30 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors
                    ${selectedAnswer === option
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-zinc-500 group-hover:border-zinc-400'
                    }`}>
                    {selectedAnswer === option && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                  <span className={`text-base md:text-lg leading-relaxed ${selectedAnswer === option ? 'text-white' : 'text-gray-300'}`}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-col-reverse md:flex-row gap-6 pt-6 border-t border-zinc-800">
          <div className="flex-1 overflow-x-auto pb-2 md:pb-0">
            <div className="flex gap-2">
              {currentTest.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionNavigation(index)}
                  className={`flex-shrink-0 w-10 h-10 rounded-lg font-medium text-sm transition-all duration-200 border
                    ${index === currentQuestion
                      ? 'bg-white text-black border-white shadow-lg scale-105'
                      : answeredQuestions[index]
                        ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                        : skippedQuestions.includes(index)
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end min-w-fit">
            <button
              onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200
                ${currentQuestion > 0
                  ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                  : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                }`}
            >
              Previous
            </button>

            <button
              onClick={handleSkipQuestion}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Skip
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer && !answeredQuestions[currentQuestion]}
              className={`px-8 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all duration-200
                ${selectedAnswer || answeredQuestions[currentQuestion]
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transform hover:-translate-y-0.5'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                }`}
            >
              {currentQuestion + 1 === currentTest.questions.length ? 'Finish Test' : 'Next'}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default MockTestSeries;