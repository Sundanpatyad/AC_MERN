import React from 'react';

const ConfirmationModal = ({ 
    isOpen, 
    onCancel, 
    onConfirm, 
    totalQuestions, 
    answeredCount
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
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-2xl transition-all border bg-page border-line">
                
                <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h3 className="text-xl font-bold text-fg">
                        Finish Mock Test?
                    </h3>
                    
                    <p className="text-sm text-muted">
                        Are you sure you want to submit your test? Once submitted, you cannot change your answers.
                    </p>

                    {/* Stats Summary */}
                    <div className="w-full grid grid-cols-2 gap-3 p-4 rounded-xl bg-surface">
                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-subtle">Answered</p>
                            <p className="text-2xl font-bold text-blue-500">{answeredCount}</p>
                        </div>
                        <div className="text-center border-l border-line">
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-subtle">Left</p>
                            <p className="text-2xl font-bold text-orange-500">{totalQuestions - answeredCount}</p>
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
                            className="w-full py-3 px-4 font-semibold rounded-xl transition-colors bg-surface text-muted hover:bg-elevated"
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
