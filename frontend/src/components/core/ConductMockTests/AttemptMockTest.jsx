import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from "react-hot-toast";
import axios from 'axios';
import { mocktestEndpoints } from '../../../services/apis';
import LoadingSpinner from './Spinner';
import QuestionArea from './components/QuestionArea';
import TestHeader from './components/TestHeader';
import TestFooter from './components/TestFooter';

const AttemptMockTest = () => {
    const { mockId, testId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);

    const [currentTest, setCurrentTest] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [skippedQuestions, setSkippedQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { GET_MCOKTEST_SERIES_BY_ID, CREATE_ATTEMPT_DETAILS } = mocktestEndpoints;

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('mockTestDarkMode');
        return savedMode ? JSON.parse(savedMode) : false;
    });

    useEffect(() => {
        localStorage.setItem('mockTestDarkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    // Handle session cleanup on navigation vs refresh
    const isBrowserRefresh = useRef(false);

    useEffect(() => {
        const handleBeforeUnload = () => {
            isBrowserRefresh.current = true;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {

            window.removeEventListener('beforeunload', handleBeforeUnload);
            // If it's not a refresh (i.e., component unmounting due to navigation), clear storage
            console.log(isBrowserRefresh.current, "currect");
            if (!isBrowserRefresh.current) {
                localStorage.removeItem(`mockTestProgress_${mockId}`);
            }
        };
    }, [mockId]);

    // Initial Data Load logic
    useEffect(() => {
        const loadValidSession = () => {
            // 1. Check Location State (passed from Selection View)
            if (location.state?.testData) {
                const test = location.state.testData;
                setCurrentTest(test);
                setTimeLeft(test.duration * 60);
                setAnsweredQuestions(new Array(test.questions.length).fill(false));
                setUserAnswers(new Array(test.questions.length).fill(''));
                setSkippedQuestions([]);
                setLoading(false);
                return true;
            }
            return false;
        };

        const restoreSession = () => {
            // 2. Check LocalStorage
            const savedProgress = localStorage.getItem(`mockTestProgress_${mockId}`);
            if (savedProgress) {
                try {
                    const parsedProgress = JSON.parse(savedProgress);
                    // Verify it matches current testId
                    if (parsedProgress && parsedProgress.testId === testId) {
                        setCurrentTest({
                            _id: parsedProgress.testId,
                            testName: parsedProgress.testName,
                            questions: parsedProgress.questions,
                            duration: parsedProgress.duration,
                            negative: parsedProgress.negative
                        });
                        setCurrentQuestion(parsedProgress.currentQuestion || 0);
                        setTimeLeft(parsedProgress.timeLeft);
                        setUserAnswers(parsedProgress.userAnswers || []);
                        setAnsweredQuestions(parsedProgress.answeredQuestions || []);
                        setSkippedQuestions(parsedProgress.skippedQuestions || []);
                        setLoading(false);
                        return true;
                    }
                } catch (e) {
                    console.error("Failed to restore progress", e);
                }
            }
            return false;
        };

        const fetchAndStart = async () => {
            // 3. Last Resort: Fetch fresh (user refreshed on start without saving, or link shared)
            try {
                setLoading(true);
                const response = await axios.get(`${GET_MCOKTEST_SERIES_BY_ID}/${mockId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const series = response.data.data;
                const test = series.mockTests.find(t => t._id === testId);

                if (test) {
                    // Shuffle questions for freshness if forced to reload
                    const shuffledQuestions = [...test.questions];
                    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
                    }

                    const testWithShuffle = { ...test, questions: shuffledQuestions };
                    setCurrentTest(testWithShuffle);
                    setTimeLeft(test.duration * 60);
                    setAnsweredQuestions(new Array(test.questions.length).fill(false));
                    setUserAnswers(new Array(test.questions.length).fill(''));
                    setSkippedQuestions([]);
                } else {
                    toast.error("Test not found");
                    navigate(`/view-mock/${mockId}`);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching test", error);
                toast.error("Failed to load test");
                navigate(`/view-mock/${mockId}`);
            }
        };

        // Execution Order
        if (!loadValidSession()) {
            if (!restoreSession()) {
                fetchAndStart();
            }
        }
    }, [mockId, testId, location.state, navigate, token, GET_MCOKTEST_SERIES_BY_ID]);

    // Persist Progress
    useEffect(() => {
        if (currentTest) {
            const progressData = {
                testId: currentTest._id,
                questions: currentTest.questions,
                currentQuestion,
                timeLeft,
                userAnswers,
                answeredQuestions,
                skippedQuestions,
                testName: currentTest.testName,
                duration: currentTest.duration,
                negative: currentTest.negative
            };
            localStorage.setItem(`mockTestProgress_${mockId}`, JSON.stringify(progressData));
        }
    }, [currentTest, currentQuestion, timeLeft, userAnswers, answeredQuestions, skippedQuestions, mockId]);

    // Timer
    useEffect(() => {
        if (currentTest && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && currentTest) {
            endTest();
        }
    }, [timeLeft, currentTest]);

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

    const handlePreviousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setSelectedAnswer(userAnswers[currentQuestion - 1] || '');
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

        // Ensure negative marking is a valid positive number for deduction
        const negativeMarking = Math.abs(Number(currentTest.negative) || 0);

        console.group("Score Calculation Debugging");
        console.log("Negative Marking per wrong answer:", negativeMarking);

        currentTest.questions.forEach((question, index) => {
            let trueCorrectAnswer = question.correctAnswer;
            // Fallback for match questions if correctAnswer isn't directly set (redundant check but safe)
            if (question.questionType === "MATCH" && (!trueCorrectAnswer || String(trueCorrectAnswer).trim() === "") && question.options && question.options.length >= 5) {
                trueCorrectAnswer = question.options[4];
            }

            const userAnswer = userAnswers[index];

            // Normalize for comparison
            const normalizedUserAnswer = userAnswer ? String(userAnswer).trim() : "";
            const normalizedCorrectAnswer = trueCorrectAnswer ? String(trueCorrectAnswer).trim() : "";

            const isCorrect = normalizedUserAnswer !== "" && normalizedUserAnswer === normalizedCorrectAnswer;
            const isAttempted = normalizedUserAnswer !== "";

            console.log(`Q${index + 1}: User: "${normalizedUserAnswer}" | Correct: "${normalizedCorrectAnswer}" | Match: ${isCorrect}`);

            if (isCorrect) {
                newScore += 1;
                newCorrectAnswers.push({
                    questionIndex: index,
                    userAnswer: userAnswer,
                    correctAnswer: trueCorrectAnswer
                });
            } else if (isAttempted) {
                // Apply negative marking
                newScore -= negativeMarking;
                newIncorrectAnswers.push({
                    questionIndex: index,
                    userAnswer: userAnswer,
                    correctAnswer: trueCorrectAnswer
                });
                console.log(`   -> Incorrect. Deducting ${negativeMarking}`);
            } else {
                console.log(`   -> Skipped.`);
            }
        });

        console.log("Final Score:", newScore);
        console.groupEnd();

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
            await axios.post(
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
        } catch (error) {
            console.error('Error submitting score:', error);
            toast.error("Failed to submit score, but results are shown below.");
        }
    };

    const endTest = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Clear saved progress
        localStorage.removeItem(`mockTestProgress_${mockId}`);

        const scoreData = calculateScore();
        sendScoreToBackend(scoreData);

        // Navigate to results
        navigate(`/mock-result/${mockId}/${testId}`, {
            state: {
                currentTest,
                score: scoreData.score,
                correctAnswers: scoreData.correctAnswerDetails,
                incorrectAnswers: scoreData.incorrectAnswerDetails,
                userAnswers,
                // Pass necessary data for ResultView
            }
        });
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    if (loading || !currentTest) {
        return <LoadingSpinner title={"Loading Test"} />;
    }

    const currentQuestionData = currentTest.questions[currentQuestion];

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center font-inter transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-gray-200'}`}>
            <div className={`w-full h-screen shadow-2xl p-3 md:p-10 space-y-4 md:space-y-8 backdrop-blur-sm relative overflow-hidden flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-zinc-900/50' : 'bg-gray-50'}`}>

                {/* Progress Bar */}
                <div className={`absolute top-0 left-0 w-full h-1 ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-300'}`}>
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / currentTest.questions.length) * 100}%` }}
                    />
                </div>

                <TestHeader
                    testName={currentTest.testName}
                    currentQuestionIndex={currentQuestion}
                    totalQuestions={currentTest.questions.length}
                    timeLeft={timeLeft}
                    isDarkMode={isDarkMode}
                    setIsDarkMode={setIsDarkMode}
                    formatTime={formatTime}
                />

                <QuestionArea
                    currentQuestionData={currentQuestionData}
                    isDarkMode={isDarkMode}
                    selectedAnswer={selectedAnswer}
                    handleAnswerSelect={handleAnswerSelect}
                />

                <TestFooter
                    currentQuestionIndex={currentQuestion}
                    totalQuestions={currentTest.questions.length}
                    answeredQuestions={answeredQuestions}
                    skippedQuestions={skippedQuestions}
                    handleQuestionNavigation={handleQuestionNavigation}
                    handleNextQuestion={handleNextQuestion}
                    handlePreviousQuestion={handlePreviousQuestion}
                    handleSkipQuestion={handleSkipQuestion}
                    isDarkMode={isDarkMode}
                    selectedAnswer={selectedAnswer}
                />
            </div>
        </div>
    );
};

export default AttemptMockTest;
