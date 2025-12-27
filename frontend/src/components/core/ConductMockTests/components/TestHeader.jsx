import React from 'react';
import { FiSun, FiMoon } from "react-icons/fi";
import { IoMdTime } from "react-icons/io";

const TestHeader = ({
    testName,
    currentQuestionIndex,
    totalQuestions,
    timeLeft,
    isDarkMode,
    setIsDarkMode,
    formatTime
}) => {
    return (
        <div className={`flex flex-row justify-between items-center gap-2 pb-2 md:pb-6 border-b flex-shrink-0 ${isDarkMode ? 'border-zinc-800' : 'border-gray-300'}`}>
            <div className="flex flex-col gap-1.5">
                <h2 className={`text-lg md:text-2xl font-bold tracking-tight truncate max-w-[250px] md:max-w-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    {testName}
                </h2>
                <div className={`flex items-center gap-3 text-xs md:text-sm font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    <span>Q {currentQuestionIndex + 1} <span className="text-[10px] opacity-60">/</span> {totalQuestions}</span>
                    <div className={`w-px h-3 ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}></div>
                    <div className={`flex items-center gap-1.5 font-mono ${timeLeft < 300 ? 'text-red-500' : (isDarkMode ? 'text-zinc-300' : 'text-slate-600')}`}>
                        <IoMdTime className="text-blue-500 text-sm" />
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`relative rounded-full w-9 h-[18px] transition-colors duration-300 focus:outline-none ${isDarkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-gray-200 border border-gray-300'}`}
                >
                    <div
                        className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full shadow-sm transform transition-transform duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-4 bg-zinc-700 text-yellow-400' : 'translate-x-0 bg-white text-orange-400'}`}
                    >
                        {isDarkMode ? <FiMoon size={10} /> : <FiSun size={10} />}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default TestHeader;
