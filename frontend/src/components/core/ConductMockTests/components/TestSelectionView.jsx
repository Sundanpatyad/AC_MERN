import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { BsExclamationTriangle } from "react-icons/bs";
import { AiOutlineHome } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";

const TestSelectionView = ({
    testSeries,
    startTest,
    modalVariants
}) => {
    const [openTestIndex, setOpenTestIndex] = useState(null);

    const startTestConfirm = (index) => {
        setOpenTestIndex(index);
    };

    const publishedTests = testSeries.mockTests.filter(test => test.status === 'published');

    return (
        <div className="min-h-screen bg-black p-4 md:p-8">
            <div className="w-full max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="border-b border-white/10 pb-6">
                    <h1 className="text-2xl md:text-2xl lg:text-5xl font-bold text-white mb-3">
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
};

export default TestSelectionView;
