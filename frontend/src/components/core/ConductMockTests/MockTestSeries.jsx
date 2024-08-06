import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from "react-hot-toast";
import axios from 'axios';
import { mocktestEndpoints } from '../../../services/apis';
import TestList from './TestList';
import TestInProgress from './TestInProgress';
import TestResult from './TestResults';
import LoadingSpinner from './Spinner';
import ErrorMessage from './ErrorMesssage';

const MockTestSeries = () => {
  const { mockId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [testSeries, setTestSeries] = useState(null);
  const [currentTest, setCurrentTest] = useState(null);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const { GET_MCOKTEST_SERIES_BY_ID, CREATE_ATTEMPT_DETAILS } = mocktestEndpoints;

  useEffect(() => {
    fetchTestSeries();
  }, [mockId]);

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
    setShowScore(false);
    setScore(0);
    setCorrectAnswers([]);
    setIncorrectAnswers([]);
  };

  const endTest = (finalScore, correctAns, incorrectAns) => {
    setScore(finalScore);
    setCorrectAnswers(correctAns);
    setIncorrectAnswers(incorrectAns);
    setShowScore(true);
    sendScoreToBackend(finalScore, correctAns, incorrectAns);
  };

  const sendScoreToBackend = async (finalScore, correctAns, incorrectAns) => {
    try {
      const response = await axios.post(
        CREATE_ATTEMPT_DETAILS,
        {
          mockId,
          testName: currentTest.testName,
          score: finalScore,
          totalQuestions: currentTest.questions.length,
          timeTaken: currentTest.duration * 60,
          correctAnswers: correctAns.length,
          incorrectAnswers: incorrectAns.length,
          incorrectAnswerDetails: incorrectAns.map(item => ({
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

  if (loading) return <LoadingSpinner title={"Loading Test"} />;
  if (error) return <ErrorMessage message={error} />;
  if (!testSeries) return <ErrorMessage message="No test series found." />;

  if (!currentTest) {
    return <TestList testSeries={testSeries} startTest={startTest} />;
  }

  if (showScore) {
    return (
      <TestResult
        currentTest={currentTest}
        score={score}
        correctAnswers={correctAnswers}
        incorrectAnswers={incorrectAnswers}
        setCurrentTest={setCurrentTest}
      />
    );
  }

  return (
    <TestInProgress
      currentTest={currentTest}
      endTest={endTest}
    />
  );
};

export default MockTestSeries;