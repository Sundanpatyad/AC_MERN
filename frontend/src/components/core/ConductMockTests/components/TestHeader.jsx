import React from 'react';
import { IoMdTime } from "react-icons/io";
import ThemeToggle from '../../../common/ThemeToggle';

const TestHeader = ({
    testName,
    currentQuestionIndex,
    totalQuestions,
    timeLeft,
    formatTime
}) => {
    return (
        <div className="flex flex-row justify-between items-center gap-2 pb-2 md:pb-6 border-b flex-shrink-0 border-line">
            <div className="flex flex-col gap-1.5">
                <h2 className="text-lg md:text-2xl font-bold tracking-tight truncate max-w-[250px] md:max-w-none text-fg">
                    {testName}
                </h2>
                <div className="flex items-center gap-3 text-xs md:text-sm font-medium text-muted">
                    <span>Q {currentQuestionIndex + 1} <span className="text-[10px] opacity-60">/</span> {totalQuestions}</span>
                    <div className="w-px h-3 bg-elevated"></div>
                    <div className={`flex items-center gap-1.5 font-mono ${timeLeft < 300 ? 'text-red-500' : 'text-muted'}`}>
                        <IoMdTime className="text-blue-500 text-sm" />
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <ThemeToggle />
            </div>
        </div>
    );
};

export default TestHeader;
