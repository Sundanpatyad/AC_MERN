import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { BsExclamationTriangle } from "react-icons/bs";
import { IoChevronBackCircle } from "react-icons/io5";
import Footer from '../../../common/Footer';

const TestResultView = ({
    currentTest,
    score,
    correctAnswers,
    incorrectAnswers,
    userAnswers,
    handleBack,
    modalVariants
}) => {
    const navigate = useNavigate();
    const [isRankOpen, setIsRankOpen] = useState(false);
    const [showAttemptDetails, setShowAttemptDetails] = useState(false);

    const rankOpen = () => {
        setIsRankOpen(true);
    };

    const rankClose = (testName) => {
        navigate(`/rankings/${testName}`);
    };

    // ── Helpers ──────────────────────────────────────────────────────────────
    const isImageUrl = (str) => {
        if (!str) return false;
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(str) ||
            str.includes('cloudinary.com') ||
            str.includes('res.cloudinary');
    };

    /** Renders a value that may be an image URL or plain text */
    const renderAnswerValue = (value, colorClass) => {
        if (!value || value === 'Not answered') {
            return <p className={`font-medium ${colorClass || 'text-muted'}`}>{value || 'Not answered'}</p>;
        }
        if (isImageUrl(value)) {
            return (
                <div className="mt-1 rounded-lg overflow-hidden border border-line">
                    <img
                        src={value}
                        alt="Answer"
                        className="w-full h-auto max-h-40 object-contain bg-surface"
                        loading="lazy"
                    />
                </div>
            );
        }
        return <p className={`font-medium ${colorClass}`}>{value}</p>;
    };

    const renderAttemptDetails = () => {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-xl font-bold text-fg">View Correct Answers</h3>
                    <span className="bg-surface text-muted text-xs px-2 py-1 rounded-full">{currentTest.questions.length} Questions</span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {currentTest.questions.map((question, index) => {
                        const isCorrect = correctAnswers.some(item => item.questionIndex === index);
                        const isIncorrect = incorrectAnswers.some(item => item.questionIndex === index);
                        const userAnswer = userAnswers[index] || "Not answered";

                        const correctAns = (question.questionType === "MATCH" && question.options && question.options.length >= 5)
                            ? question.options[4]
                            : question.correctAnswer;

                        return (
                            <div
                                key={index}
                                className={`flex flex-col md:flex-row gap-6 p-6 rounded-2xl border transition-all duration-300 ${isCorrect ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10' :
                                    isIncorrect ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10' :
                                        'bg-surface border-line hover:bg-elevated'
                                    }`}
                            >
                                {/* Status Icon & Number */}
                                <div className="flex-shrink-0 flex md:flex-col items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${isCorrect ? 'bg-green-500 text-white border-green-400' :
                                        isIncorrect ? 'bg-red-500 text-white border-red-400' :
                                            'bg-surface text-muted border-line'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className={`text-2xl ${isCorrect ? 'text-green-500' :
                                        isIncorrect ? 'text-red-500' :
                                            'text-muted'
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
                                    {/* Question image + text */}
                                    <div className="space-y-2">
                                        {question.questionImage && (
                                            <div className="rounded-xl overflow-hidden border border-line">
                                                <img
                                                    src={question.questionImage}
                                                    alt={`Question ${index + 1}`}
                                                    className="w-full h-auto max-h-56 object-contain bg-surface"
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                        {question.text && (
                                            <p className="text-fg text-lg leading-relaxed font-medium whitespace-pre-line">
                                                {question.text.replace(/\\n/g, '\n')}
                                            </p>
                                        )}
                                    </div>

                                    {/* Answer boxes */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-500/10 border-green-500/20' :
                                            isIncorrect ? 'bg-red-500/10 border-red-500/20' :
                                                'bg-surface border-line'
                                            }`}>
                                            <p className="text-xs uppercase tracking-wider font-semibold mb-2 text-muted">Your Answer</p>
                                            {renderAnswerValue(userAnswer, isCorrect ? 'text-green-400' : isIncorrect ? 'text-red-400' : 'text-muted')}
                                        </div>

                                        <div className="p-4 rounded-xl border bg-blue-500/5 border-blue-500/20">
                                            <p className="text-xs uppercase tracking-wider font-semibold mb-2 text-blue-400">Correct Answer</p>
                                            {renderAnswerValue(correctAns, 'text-blue-400')}
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

    return (
        <div className="min-h-screen bg-page flex items-center justify-center p-4 font-inter">
            <div className="w-full max-w-5xl bg-page border border-line shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm">

                {/* Header */}
                <div className="bg-gradient-to-r from-surface to-page p-6 md:p-10 border-b border-line flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>

                    <button
                        onClick={handleBack}
                        className="absolute top-6 left-6 p-2 bg-surface text-muted hover:text-fg rounded-full hover:bg-elevated transition-all duration-300"
                    >
                        <IoChevronBackCircle size={24} />
                    </button>

                    <h2 className="text-3xl md:text-4xl font-bold text-fg mb-2 tracking-tight">
                        Test Completed!
                    </h2>
                    <p className="text-muted text-lg">{currentTest.testName}</p>

                    {/* Score Card */}
                    <div className="mt-8 relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-line flex flex-col items-center justify-center bg-page shadow-2xl relative z-10">
                            <span className="text-subtle text-sm font-medium uppercase tracking-wider">Score</span>
                            <span className="text-3xl md:text-4xl font-bold text-fg mt-1">
                                {score}
                            </span>
                            <span className="text-subtle text-xs mt-1">out of {currentTest.questions.length}</span>
                        </div>
                        {/* Decorative glows */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
                    </div>
                </div>

                <div className="p-6 md:p-10 space-y-10">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <div className="bg-surface p-6 rounded-2xl border border-line text-center hover:bg-elevated transition-colors group">
                            <p className="text-muted text-sm font-medium uppercase tracking-wider mb-2 group-hover:text-fg">Accuracy</p>
                            <div className="text-2xl md:text-3xl font-bold text-blue-400">
                                {Math.round((correctAnswers.length / currentTest.questions.length) * 100)}%
                            </div>
                        </div>
                        <div className="bg-surface p-6 rounded-2xl border border-line text-center hover:bg-elevated transition-colors group">
                            <p className="text-muted text-sm font-medium uppercase tracking-wider mb-2 group-hover:text-fg">Correct</p>
                            <div className="text-2xl md:text-3xl font-bold text-green-400">
                                {correctAnswers.length}
                            </div>
                        </div>
                        <div className="bg-surface p-6 rounded-2xl border border-line text-center hover:bg-elevated transition-colors group">
                            <p className="text-muted text-sm font-medium uppercase tracking-wider mb-2 group-hover:text-fg">Incorrect</p>
                            <div className="text-2xl md:text-3xl font-bold text-red-400">
                                {incorrectAnswers.length}
                            </div>
                        </div>
                        <div className="bg-surface p-6 rounded-2xl border border-line text-center hover:bg-elevated transition-colors group">
                            <p className="text-muted text-sm font-medium uppercase tracking-wider mb-2 group-hover:text-fg">Unanswered</p>
                            <div className="text-2xl md:text-3xl font-bold text-orange-400">
                                {currentTest.questions.length - (correctAnswers.length + incorrectAnswers.length)}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 border-t border-line pt-8">
                        <button
                            onClick={rankOpen}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-solid text-solid-fg hover:bg-solid-hover font-semibold rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            View Your Rank
                        </button>

                        <button
                            onClick={() => setShowAttemptDetails(!showAttemptDetails)}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-surface hover:bg-elevated text-fg font-semibold rounded-xl transition-all duration-300 border border-line hover:border-muted"
                        >
                            {showAttemptDetails ? (
                                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> Hide Solutions</>
                            ) : (
                                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> View Correct Answers</>
                            )}
                        </button>
                    </div>

                    {/* Rank Modal */}
                    <AnimatePresence>
                        {isRankOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/50">
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    variants={modalVariants}
                                    className="relative w-full max-w-md mx-auto"
                                >
                                    <div className="bg-page border border-line rounded-2xl shadow-2xl w-full p-8">
                                        <div className="flex items-center mb-6">
                                            <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center mr-4">
                                                <BsExclamationTriangle className="text-xl" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-lg font-bold text-fg">View Rankings?</h3>
                                                <p className="text-sm text-muted">This will exit the current result view.</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => setIsRankOpen(false)}
                                                className="px-4 py-2 text-sm font-medium text-fg bg-surface rounded-lg hover:bg-elevated transition-colors border border-line"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => rankClose(currentTest.testName)}
                                                className="px-4 py-2 text-sm font-medium text-solid-fg bg-solid rounded-lg hover:bg-solid-hover shadow-lg transition-colors"
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
                            className="pt-8 border-t border-line"
                        >
                            {renderAttemptDetails()}
                        </motion.div>
                    )}
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default TestResultView;
