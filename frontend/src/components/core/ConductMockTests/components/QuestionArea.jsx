import React from 'react';

const QuestionArea = ({
    currentQuestionData,
    isDarkMode,
    selectedAnswer,
    handleAnswerSelect
}) => {
    return (
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
            {/* Question Text */}
            <div className={`prose max-w-none ${isDarkMode ? 'prose-invert' : 'prose-slate'}`}>
                <h3 className={`text-base md:text-2xl leading-snug font-medium whitespace-pre-line ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {currentQuestionData.text.replace(/\\n/g, '\n')}
                </h3>
            </div>

            {/* Match Question Columns */}
            {currentQuestionData.questionType === 'MATCH' && currentQuestionData.leftColumn && currentQuestionData.rightColumn && (
                <div className="grid grid-cols-2 gap-2 md:gap-8 my-2 md:my-8">
                    <div className="space-y-2 md:space-y-4">
                        <div className="flex items-center gap-2 pb-1 border-b border-blue-500/20">
                            <span className="bg-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded">COL A</span>
                        </div>
                        {currentQuestionData.leftColumn.map((item, idx) => (
                            <div key={`left-${idx}`} className={`flex items-start gap-2 md:gap-4 p-2 md:p-4 rounded-lg md:rounded-xl border transition-colors ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                <span className="flex-shrink-0 w-4 h-4 md:w-6 md:h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] md:text-xs font-bold mt-0.5">
                                    {String.fromCharCode(97 + idx)}
                                </span>
                                <span className={`text-[10px] md:text-base leading-snug ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.replace(/^[a-z]\)\s*/, '')}</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2 md:space-y-4">
                        <div className="flex items-center gap-2 pb-1 border-b border-orange-500/20">
                            <span className="bg-orange-500/20 text-orange-400 text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded">COL B</span>
                        </div>
                        {currentQuestionData.rightColumn.map((item, idx) => (
                            <div key={`right-${idx}`} className={`flex items-start gap-2 md:gap-4 p-2 md:p-4 rounded-lg md:rounded-xl border transition-colors ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                <span className="flex-shrink-0 w-4 h-4 md:w-6 md:h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] md:text-xs font-bold mt-0.5">
                                    {idx + 1}
                                </span>
                                <span className={`text-[10px] md:text-base leading-snug ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.replace(/^\d+\)\s*/, '')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Options Grid */}
            <div className="grid grid-cols-2 gap-2 md:gap-4 pt-2">
                {(currentQuestionData.questionType === 'MATCH'
                    ? currentQuestionData.options.slice(0, 4)
                    : currentQuestionData.options
                ).map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        className={`group relative p-3 md:p-5 text-left rounded-xl border-2 transition-all duration-200 hover:shadow-lg
              ${selectedAnswer === option
                                ? 'bg-blue-600/10 border-blue-500 shadow-blue-500/10'
                                : (isDarkMode ? 'bg-zinc-800/30 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800' : 'bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50')
                            }`}
                    >
                        <div className="flex items-start gap-2 md:gap-3">
                            <div className={`flex-shrink-0 w-4 h-4 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors
                ${selectedAnswer === option
                                    ? 'border-blue-500 bg-blue-500'
                                    : (isDarkMode ? 'border-zinc-500 group-hover:border-zinc-400' : 'border-gray-300 group-hover:border-gray-400')
                                }`}>
                                {selectedAnswer === option && <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-white" />}
                            </div>
                            <span className={`text-xs md:text-lg leading-snug ${selectedAnswer === option ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                                {option}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuestionArea;
