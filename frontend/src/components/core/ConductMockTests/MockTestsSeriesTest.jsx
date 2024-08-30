import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from "react-hot-toast";
import axios from 'axios';
import { mocktestEndpoints } from '../../../services/apis';
import MockTestIntro from './IntroPage';
import ConductTest from './ConductTest';
import ResultsPage from './ResultsPage';

const MockTestSeriesTest = () => {
  const { mockId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [testSeries, setTestSeries] = useState(null);
  const [currentTest, setCurrentTest] = useState(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScore, setShowScore] = useState(false);
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
    setScore(0);
    setShowScore(false);
    setCorrectAnswers([]);
    setIncorrectAnswers([]);
    setUserAnswers(new Array(test.questions.length).fill(''));
  };

  const calculateScore = (userAnswers) => {
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
    setUserAnswers(userAnswers);

    return {
      score: newScore,
      correctAnswers: newCorrectAnswers.length,
      incorrectAnswers: newIncorrectAnswers.length,
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
          timeTaken: currentTest.duration * 60,
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

  const endTest = (userAnswers) => {
    const scoreData = calculateScore(userAnswers);
    setShowScore(true);
    sendScoreToBackend(scoreData);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!currentTest) {
    return <MockTestIntro testSeries={testSeries} startTest={startTest} />;
  }

  if (showScore) {
    return (
      <ResultsPage
        currentTest={currentTest}
        score={score}
        correctAnswers={correctAnswers}
        incorrectAnswers={incorrectAnswers}
        userAnswers={userAnswers}
        setCurrentTest={setCurrentTest}
      />
    );
  }

  return <ConductTest currentTest={currentTest} endTest={endTest} />;
};

export default MockTestSeriesTest;