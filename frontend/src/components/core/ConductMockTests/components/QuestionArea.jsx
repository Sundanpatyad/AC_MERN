import React, { useState, useCallback } from 'react';

// ─── Lightbox ────────────────────────────────────────────────────────────────

const ImageLightbox = ({ src, alt, onClose }) => {
    if (!src) return null;
    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <button
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white text-2xl flex items-center justify-center hover:bg-white/20 transition-colors"
                onClick={onClose}
            >
                ×
            </button>
            <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

// ─── Thumbnail Image ──────────────────────────────────────────────────────────

const ThumbnailImage = ({ src, alt, className = '' }) => {
    const [lightbox, setLightbox] = useState(false);

    if (!src) return null;
    return (
        <>
            <div
                className={`relative inline-flex cursor-zoom-in group/img ${className}`}
                onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
            >
                <img
                    src={src}
                    alt={alt}
                    className="h-24 w-auto max-w-[160px] object-contain rounded-lg bg-black/20 border border-white/10"
                    loading="lazy"
                />
                <div className="absolute inset-0 rounded-lg bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity text-xs font-bold bg-black/60 px-2 py-1 rounded">
                        🔍 Tap to expand
                    </span>
                </div>
            </div>
            {lightbox && <ImageLightbox src={src} alt={alt} onClose={() => setLightbox(false)} />}
        </>
    );
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Normalise an option that may be a plain string (legacy) or {text, image} object. */
const normaliseOption = (opt) => {
    if (typeof opt === 'string') return { text: opt, image: '' };
    return { text: opt?.text || '', image: opt?.image || '' };
};

/** The answer value sent to the backend: text if available, else image URL. */
const optionValue = (opt) => {
    const { text, image } = normaliseOption(opt);
    return text || image;
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const OptionButton = ({ opt, index, isDarkMode, isSelected, onClick }) => {
    const { text, image } = normaliseOption(opt);
    const hasImage = !!image;
    const hasText = !!text;
    const label = String.fromCharCode(65 + index); // A, B, C, D

    const baseClass = `group relative p-3 md:p-4 text-left rounded-xl border-2 transition-all duration-200 hover:shadow-lg`;
    const selectedClass = 'bg-blue-600/10 border-blue-500 shadow-blue-500/10';
    const unselectedClass = isDarkMode
        ? 'bg-zinc-800/30 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800'
        : 'bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50';

    return (
        <button
            onClick={onClick}
            className={`${baseClass} ${isSelected ? selectedClass : unselectedClass}`}
        >
            <div className="flex flex-col gap-2">
                {/* Radio circle + label row */}
                <div className="flex items-center gap-2">
                    <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                            ${isSelected
                                ? 'border-blue-500 bg-blue-500'
                                : isDarkMode
                                    ? 'border-zinc-500 group-hover:border-zinc-400'
                                    : 'border-gray-300 group-hover:border-gray-400'
                            }`}
                    >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-blue-400' : 'text-zinc-500'}`}>
                        {label}
                    </span>
                </div>

                {/* Thumbnail Image (if any) — stops propagation so click doesn't select option */}
                {hasImage && (
                    <ThumbnailImage src={image} alt={`Option ${label}`} />
                )}

                {/* Text (if any) */}
                {hasText && (
                    <span
                        className={`text-xs md:text-base leading-snug
                            ${isSelected
                                ? isDarkMode ? 'text-white' : 'text-gray-900'
                                : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                    >
                        {text}
                    </span>
                )}
            </div>
        </button>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const QuestionArea = ({
    currentQuestionData,
    isDarkMode,
    selectedAnswer,
    handleAnswerSelect,
}) => {
    const questionText = currentQuestionData.text || '';
    const questionImage = currentQuestionData.questionImage || '';

    return (
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">

            {/* ── Question ── */}
            <div className={`prose max-w-none ${isDarkMode ? 'prose-invert' : 'prose-slate'}`}>
                {/* Question thumbnail image — click to expand */}
                {questionImage && (
                    <div className="mb-4">
                        <ThumbnailImage
                            src={questionImage}
                            alt="Question illustration"
                            className="!inline-flex"
                        />
                    </div>
                )}

                {/* Question text */}
                {questionText && (
                    <h3
                        className={`text-base md:text-2xl leading-snug font-medium whitespace-pre-line
                            ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                    >
                        {questionText.replace(/\\n/g, '\n')}
                    </h3>
                )}
            </div>

            {/* ── Match columns (unchanged) ── */}
            {currentQuestionData.questionType === 'MATCH' &&
                currentQuestionData.leftColumn &&
                currentQuestionData.rightColumn && (
                    <div className="grid grid-cols-2 gap-2 md:gap-8 my-2 md:my-8">
                        <div className="space-y-2 md:space-y-4">
                            <div className="flex items-center gap-2 pb-1 border-b border-blue-500/20">
                                <span className="bg-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                                    COL A
                                </span>
                            </div>
                            {currentQuestionData.leftColumn.map((item, idx) => (
                                <div
                                    key={`left-${idx}`}
                                    className={`flex items-start gap-2 md:gap-4 p-2 md:p-4 rounded-lg md:rounded-xl border transition-colors
                                        ${isDarkMode
                                            ? 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                                >
                                    <span className="flex-shrink-0 w-4 h-4 md:w-6 md:h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] md:text-xs font-bold mt-0.5">
                                        {String.fromCharCode(97 + idx)}
                                    </span>
                                    <span className={`text-[10px] md:text-base leading-snug ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {item.replace(/^[a-z]\)\s*/, '')}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2 md:space-y-4">
                            <div className="flex items-center gap-2 pb-1 border-b border-orange-500/20">
                                <span className="bg-orange-500/20 text-orange-400 text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                                    COL B
                                </span>
                            </div>
                            {currentQuestionData.rightColumn.map((item, idx) => (
                                <div
                                    key={`right-${idx}`}
                                    className={`flex items-start gap-2 md:gap-4 p-2 md:p-4 rounded-lg md:rounded-xl border transition-colors
                                        ${isDarkMode
                                            ? 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                                >
                                    <span className="flex-shrink-0 w-4 h-4 md:w-6 md:h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[10px] md:text-xs font-bold mt-0.5">
                                        {idx + 1}
                                    </span>
                                    <span className={`text-[10px] md:text-base leading-snug ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {item.replace(/^\d+\)\s*/, '')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            {/* ── Options Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 pt-2">
                {(currentQuestionData.questionType === 'MATCH'
                    ? currentQuestionData.options.slice(0, 4)
                    : currentQuestionData.options
                ).map((opt, index) => {
                    const value = optionValue(opt);
                    return (
                        <OptionButton
                            key={index}
                            opt={opt}
                            index={index}
                            isDarkMode={isDarkMode}
                            isSelected={selectedAnswer === value}
                            onClick={() => handleAnswerSelect(value)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionArea;
