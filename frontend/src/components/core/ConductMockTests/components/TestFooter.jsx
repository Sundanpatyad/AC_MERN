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
        <div className="flex flex-col gap-3 pt-3 md:pt-6 border-t flex-shrink-0 -mx-3 px-3 md:mx-0 md:px-0 transition-colors border-line bg-page md:bg-transparent">
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
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
                                    : answeredQuestions[index]
                                        ? 'bg-blue-600/20 text-blue-500 border-blue-500/30'
                                        : skippedQuestions.includes(index)
                                            ? 'bg-orange-500/20 text-orange-500 border-orange-500/30'
                                            : 'bg-surface text-subtle border-line hover:border-muted hover:text-fg'
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
                            ? 'bg-surface text-fg hover:bg-elevated border-line'
                            : 'bg-page text-subtle cursor-not-allowed border-line'
                        }`}
                >
                    Prev
                </button>

                <button
                    onClick={handleSkipQuestion}
                    className="flex-1 py-2.5 md:py-3 rounded-xl font-semibold text-xs md:text-sm transition-colors border text-muted bg-surface hover:bg-elevated hover:text-fg border-line"
                >
                    Skip
                </button>

                <button
                    onClick={handleNextQuestion}
                    disabled={!selectedAnswer && !answeredQuestions[currentQuestionIndex]}
                    className={`flex-[2] py-2.5 md:py-3 rounded-xl font-semibold text-xs md:text-sm shadow-lg transition-all duration-200 border
            ${selectedAnswer || answeredQuestions[currentQuestionIndex]
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/25 border-transparent'
                            : 'bg-surface text-subtle cursor-not-allowed border-line'
                        }`}
                >
                    {currentQuestionIndex + 1 === totalQuestions ? 'Finish' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default TestFooter;
