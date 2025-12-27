import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import TestResultView from './components/TestResultView';

const MockTestResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { mockId } = useParams();

    // Retrieve data passed from AttemptMockTest
    const resultData = location.state;

    if (!resultData) {
        // If accessed directly without data, redirect to test list
        // In a production app, we might fetch the result from backend using an attemptId
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-white text-xl mb-4">No result data found.</h2>
                    <button
                        onClick={() => navigate(`/view-mock/${mockId}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                    >
                        Return to Mock Test Series
                    </button>
                </div>
            </div>
        );
    }

    const { currentTest, score, correctAnswers, incorrectAnswers, userAnswers } = resultData;

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    };

    const handleBack = () => {
        navigate(`/view-mock/${mockId}`);
    };

    return (
        <TestResultView
            currentTest={currentTest}
            score={score}
            correctAnswers={correctAnswers}
            incorrectAnswers={incorrectAnswers}
            userAnswers={userAnswers}
            handleBack={handleBack}
            modalVariants={modalVariants}
        />
    );
};

export default MockTestResults;
