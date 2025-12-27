import React, { useEffect, useRef } from 'react';

const TestFooter = ({
    currentQuestionIndex,
    totalQuestions,
    answeredQuestions,
    skippedQuestions,
    handleQuestionNavigation,
    handleNextQuestion,
    handlePreviousQuestion,
    handleSkipQuestion,
    isDarkMode,
    selectedAnswer
}) => {
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (scrollContainerRef.current) {
            const activeBtn = scrollContainerRef.current.querySelector(`button[data-index="${currentQuestionIndex}"]`);
            if (activeBtn) {
                const container = scrollContainerRef.current;
                const scrollLeft = activeBtn.offsetLeft - (container.offsetWidth / 2) + (activeBtn.offsetWidth / 2);
                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    }, [currentQuestionIndex]);

    return (
        <div className={`flex flex-col gap-3 pt-3 md:pt-6 border-t flex-shrink-0 -mx-3 px-3 md:mx-0 md:px-0 transition-colors ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50 md:bg-transparent' : 'border-gray-200 bg-white md:bg-transparent'}`}>
            {/* Question Numbers Horizontal Scroll */}
            <div
                ref={scrollContainerRef}
                className="overflow-x-auto pb-2 scrollbar-hide"
            >
                <div className="flex gap-1.5 md:gap-2">
                    {Array.from({ length: totalQuestions }).map((_, index) => (
                        <button
                            key={index}
                            data-index={index}
                            onClick={() => handleQuestionNavigation(index)}
                            className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg font-medium text-xs md:text-sm transition-all duration-200 border
                ${index === currentQuestionIndex
                                    ? 'bg-white text-black border-white shadow-lg scale-105'
                                    : answeredQuestions[index]
                                        ? 'bg-blue-600/20 text-blue-500 border-blue-500/30'
                                        : skippedQuestions.includes(index)
                                            ? 'bg-orange-500/20 text-orange-500 border-orange-500/30'
                                            : (isDarkMode ? 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-zinc-600 hover:text-zinc-300' : 'bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700')
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 justify-between">
                <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`flex-1 py-2.5 md:py-3 rounded-xl font-semibold text-xs md:text-sm transition-all duration-200 border
            ${currentQuestionIndex > 0
                            ? (isDarkMode ? 'bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700' : 'bg-white text-gray-900 hover:bg-gray-100 border-gray-200')
                            : (isDarkMode ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border-zinc-800' : 'bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200')
                        }`}
                >
                    Prev
                </button>

                <button
                    onClick={handleSkipQuestion}
                    className={`flex-1 py-2.5 md:py-3 rounded-xl font-semibold text-xs md:text-sm transition-colors border ${isDarkMode ? 'text-zinc-400 bg-zinc-800/50 hover:bg-zinc-800 hover:text-white border-zinc-800' : 'text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border-gray-200'}`}
                >
                    Skip
                </button>

                <button
                    onClick={handleNextQuestion}
                    disabled={!selectedAnswer && !answeredQuestions[currentQuestionIndex]}
                    className={`flex-[2] py-2.5 md:py-3 rounded-xl font-semibold text-xs md:text-sm shadow-lg transition-all duration-200 border
            ${selectedAnswer || answeredQuestions[currentQuestionIndex]
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/25 border-transparent'
                            : (isDarkMode ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-zinc-700' : 'bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200')
                        }`}
                >
                    {currentQuestionIndex + 1 === totalQuestions ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default TestFooter;
