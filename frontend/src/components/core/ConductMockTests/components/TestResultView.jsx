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
                                        <p className="text-gray-200 text-lg leading-relaxed font-medium whitespace-pre-line">{question.text.replace(/\\n/g, '\n')}</p>
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
                                                {(question.questionType === "MATCH" && question.options && question.options.length >= 5)
                                                    ? question.options[4]
                                                    : question.correctAnswer}
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

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 font-inter">
            <div className="w-full max-w-5xl bg-zinc-900/50 border border-zinc-800 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm">

                {/* Header */}
                <div className="bg-gradient-to-r from-zinc-900 to-black p-6 md:p-10 border-b border-zinc-800 flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                    <button
                        onClick={handleBack}
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
                                {score}
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
};

export default TestResultView;
