import React from 'react';

const ConfirmationModal = ({ 
    isOpen, 
    onCancel, 
    onConfirm, 
    totalQuestions, 
    answeredCount, 
    isDarkMode 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            />
            
            {/* Modal Content */}
            <div className={`relative w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-2xl transition-all border
                ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
                
                <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Finish Mock Test?
                    </h3>
                    
                    <p className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                        Are you sure you want to submit your test? Once submitted, you cannot change your answers.
                    </p>

                    {/* Stats Summary */}
                    <div className={`w-full grid grid-cols-2 gap-3 p-4 rounded-xl ${isDarkMode ? 'bg-zinc-800/50' : 'bg-gray-50'}`}>
                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Answered</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{answeredCount}</p>
                        </div>
                        <div className="text-center border-l border-zinc-700/30">
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Left</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{totalQuestions - answeredCount}</p>
                        </div>
                    </div>

                    <div className="flex flex-col w-full gap-3 pt-4">
                        <button
                            onClick={onConfirm}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
                        >
                            Confirm and Submit
                        </button>
                        <button
                            onClick={onCancel}
                            className={`w-full py-3 px-4 font-semibold rounded-xl transition-colors
                                ${isDarkMode 
                                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Go Back to Test
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
