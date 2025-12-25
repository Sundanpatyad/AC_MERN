import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaTrash, FaChevronDown, FaChevronRight, FaPlus } from 'react-icons/fa';
import { fetchSeries } from '../../../../services/operations/mocktest';
import { saveSeries } from '../../../../services/operations/profileAPI';
import AddMockTest from './AddTextQuestions';
import AddAttachments from './AddOMRbased';

const EditMockTestSeries = () => {
  const { token } = useSelector((state) => state.auth);
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isAddMockTestModalOpen, setIsAddMockTestModalOpen] = useState(false);
  const [isAddAttachmentsModalOpen, setIsAddAttachmentsModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [currentBulkImportTestIndex, setCurrentBulkImportTestIndex] = useState(null);
  const [expandedTests, setExpandedTests] = useState({});

  const toggleTest = (testIndex) => {
    setExpandedTests(prev => ({
      ...prev,
      [testIndex]: !prev[testIndex]
    }));
  };

  const openAddMockTestModal = () => setIsAddMockTestModalOpen(true);
  const closeAddMockTestModal = () => setIsAddMockTestModalOpen(false);

  const openAddAttachmentsModal = () => setIsAddAttachmentsModalOpen(true);
  const closeAddAttachmentsModal = () => setIsAddAttachmentsModalOpen(false);

  const openBulkImportModal = (testIndex) => {
    setCurrentBulkImportTestIndex(testIndex);
    setBulkImportText('');
    setIsBulkImportModalOpen(true);
  };
  const closeBulkImportModal = () => {
    setIsBulkImportModalOpen(false);
    setBulkImportText('');
    setCurrentBulkImportTestIndex(null);
  };

  useEffect(() => {
    const loadSeries = async () => {
      setIsLoading(true);
      const result = await fetchSeries(seriesId, token);
      if (result) {
        setSeries(result);
        const initialExpandState = {};
        result.mockTests?.forEach((_, index) => {
          initialExpandState[index] = false;
        });
        setExpandedTests(initialExpandState);
      }
      setIsLoading(false);
    };
    loadSeries();
  }, [seriesId, token]);

  const handleSeriesChange = (e) => {
    setSeries({ ...series, [e.target.name]: e.target.value });
  };

  const handleTestChange = (e, testIndex) => {
    const updatedTests = [...series.mockTests];
    updatedTests[testIndex] = { ...updatedTests[testIndex], [e.target.name]: e.target.value };
    setSeries({ ...series, mockTests: updatedTests });
  };

  const handleQuestionChange = (e, testIndex, questionIndex) => {
    const updatedTests = [...series.mockTests];
    updatedTests[testIndex].questions[questionIndex] = {
      ...updatedTests[testIndex].questions[questionIndex],
      [e.target.name]: e.target.value
    };
    setSeries({ ...series, mockTests: updatedTests });
  };

  const handleOptionChange = (testIndex, questionIndex, optionIndex, value) => {
    const updatedTests = [...series.mockTests];
    updatedTests[testIndex].questions[questionIndex].options[optionIndex] = value;
    setSeries({ ...series, mockTests: updatedTests });
  };

  const addQuestion = (testIndex) => {
    const updatedTests = [...series.mockTests];
    updatedTests[testIndex].questions.push({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: '',
    });
    setSeries({ ...series, mockTests: updatedTests });
  };

  const deleteQuestion = (testIndex, questionIndex) => {
    const updatedTests = [...series.mockTests];
    updatedTests[testIndex].questions.splice(questionIndex, 1);
    setSeries({ ...series, mockTests: updatedTests });
  };

  const addTest = () => {
    setSeries({
      ...series,
      mockTests: [
        ...series.mockTests,
        { testName: '', duration: 0, negative: 0.25, questions: [], status: 'draft' }
      ]
    });
    setExpandedTests(prev => ({
      ...prev,
      [series.mockTests.length]: true
    }));
  };

  const deleteTest = (testIndex) => {
    const updatedTests = [...series.mockTests];
    updatedTests.splice(testIndex, 1);
    setSeries({ ...series, mockTests: updatedTests });
    const newExpandedTests = { ...expandedTests };
    delete newExpandedTests[testIndex];
    setExpandedTests(newExpandedTests);
  };

  const handleSeriesStatusChange = (e) => {
    setSeries({ ...series, status: e.target.value });
  };

  const handleTestStatusChange = (e, testIndex) => {
    const updatedTests = [...series.mockTests];
    updatedTests[testIndex].status = e.target.value;
    setSeries({ ...series, mockTests: updatedTests });
  };

  const handleAttachmentChange = (index, field, value) => {
    const updatedAttachments = [...series.attachments];
    updatedAttachments[index] = { ...updatedAttachments[index], [field]: value };
    setSeries({ ...series, attachments: updatedAttachments });
  };

  const deleteAttachment = (index) => {
    const updatedAttachments = [...series.attachments];
    updatedAttachments.splice(index, 1);
    setSeries({ ...series, attachments: updatedAttachments });
  };

  const parseBulkQuestions = (text) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const questions = [];
    let i = 0;

    while (i < lines.length) {
      // Question text
      const questionText = lines[i]?.trim();
      if (!questionText) {
        i++;
        continue;
      }

      // Options (next 4 lines)
      const options = [];
      for (let j = 1; j <= 4; j++) {
        if (i + j < lines.length) {
          options.push(lines[i + j].trim());
        }
      }

      // Correct answer (5th line after question)
      const correctAnswer = i + 5 < lines.length ? lines[i + 5].trim() : '';

      if (options.length === 4 && correctAnswer) {
        questions.push({
          text: questionText,
          options: options,
          correctAnswer: correctAnswer
        });
      }

      // Move to next question (question + 4 options + 1 answer = 6 lines)
      i += 6;
    }

    return questions;
  };

  const handleBulkImport = () => {
    if (currentBulkImportTestIndex === null || !bulkImportText.trim()) return;

    const parsedQuestions = parseBulkQuestions(bulkImportText);

    if (parsedQuestions.length === 0) {
      alert('No valid questions found. Please check the format.');
      return;
    }

    const updatedTests = [...series.mockTests];
    updatedTests[currentBulkImportTestIndex].questions = [
      ...updatedTests[currentBulkImportTestIndex].questions,
      ...parsedQuestions
    ];
    setSeries({ ...series, mockTests: updatedTests });

    closeBulkImportModal();
  };

  const handleSaveSeries = async () => {
    setIsLoading(true);
    const seriesData = {
      seriesName: series.seriesName,
      description: series.description,
      price: series.price,
      status: series.status,
      mockTests: series.mockTests.map(test => ({
        testName: test.testName,
        duration: test.duration,
        negative: test.negative || 0,
        status: test.status,
        questions: test.questions.map(question => ({
          text: question.text,
          options: question.options,
          correctAnswer: question.correctAnswer
        }))
      })),
      attachments: series.attachments
    };

    const result = await saveSeries(seriesId, seriesData, token);
    setIsLoading(false);

    if (result) {
      setSubmitStatus('success');
      setTimeout(() => {
        navigate('/dashboard/instructor');
      }, 1000);
    } else {
      setSubmitStatus('error');
    }
  };

  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-700/50 shadow-2xl">
          <button
            onClick={onClose}
            className="float-right text-gray-400 hover:text-white text-3xl font-light transition-colors duration-200"
          >
            &times;
          </button>
          {children}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!series) {
    return <div className="text-center text-white text-lg mt-20">No series data found.</div>;
  }

  return (
    <div className="flex w-full items-start gap-x-8">
      <div className="flex flex-1 flex-col">
        <h1 className="mb-8 text-4xl font-bold text-white text-center lg:text-left bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Edit Mock Test Series
        </h1>
        <p className="mb-10 text-sm text-gray-400 text-center lg:text-left">
          Update your mock test series details and manage tests
        </p>

        <div className="flex-1">
          <form onSubmit={(e) => { e.preventDefault(); handleSaveSeries(); }} className="space-y-8">
            {/* Series Information Card */}
            <div className="rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 shadow-2xl space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Series Information</h2>

              <div className="space-y-2">
                <label htmlFor="seriesName" className="block text-sm font-medium text-gray-200">
                  Series Name <sup className="text-pink-400">*</sup>
                </label>
                <input
                  type="text"
                  id="seriesName"
                  name="seriesName"
                  value={series.seriesName}
                  onChange={handleSeriesChange}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-200">
                  Description <sup className="text-pink-400">*</sup>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={series.description}
                  onChange={handleSeriesChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-200">
                    Price (₹) <sup className="text-pink-400">*</sup>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={series.price}
                    onChange={handleSeriesChange}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="seriesStatus" className="block text-sm font-medium text-gray-200">
                    Series Status <sup className="text-pink-400">*</sup>
                  </label>
                  <select
                    id="seriesStatus"
                    name="status"
                    value={series.status}
                    onChange={handleSeriesStatusChange}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>

            {/* OMR Based Tests */}
            {series.attachments && series.attachments.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">OMR Based Tests</h2>
                {series.attachments.map((item, index) => (
                  <div key={item._id} className="rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 shadow-2xl relative">
                    <button
                      type="button"
                      onClick={() => deleteAttachment(index)}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-300 transition-colors duration-200 p-2 hover:bg-red-500/10 rounded-lg"
                    >
                      <FaTrash size={18} />
                    </button>

                    <h3 className="text-xl font-semibold text-white mb-6">OMR Test #{index + 1}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['name', 'answerKey', 'omrSheet', 'questionPaper'].map((field) => (
                        <div key={field} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-200 capitalize">
                            {field.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <input
                            type="text"
                            value={item[field]}
                            onChange={(e) => handleAttachmentChange(index, field, e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tests Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Mock Tests</h2>
                <button
                  type="button"
                  onClick={addTest}
                  className="flex items-center gap-x-2 rounded-lg px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaPlus /> Add New Test
                </button>
              </div>

              {series.mockTests && series.mockTests.map((test, testIndex) => (
                <div key={testIndex} className="rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 shadow-2xl overflow-hidden">
                  <div
                    className="flex justify-between items-center cursor-pointer p-6 hover:bg-zinc-800/50 transition-all duration-200"
                    onClick={() => toggleTest(testIndex)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-400 transition-transform duration-200">
                        {expandedTests[testIndex] ? <FaChevronDown size={20} /> : <FaChevronRight size={20} />}
                      </div>
                      <h3 className="font-semibold text-white text-lg">{test.testName || `Test ${testIndex + 1}`}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${test.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {test.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTest(testIndex);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200 p-2 hover:bg-red-500/10 rounded-lg"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>

                  {expandedTests[testIndex] && (
                    <div className="p-6 pt-0 space-y-6 border-t border-zinc-700/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-200">
                            Test Name <sup className="text-pink-400">*</sup>
                          </label>
                          <input
                            type="text"
                            name="testName"
                            value={test.testName}
                            onChange={(e) => handleTestChange(e, testIndex)}
                            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-200">
                            Duration (minutes) <sup className="text-pink-400">*</sup>
                          </label>
                          <input
                            type="number"
                            name="duration"
                            value={test.duration}
                            onChange={(e) => handleTestChange(e, testIndex)}
                            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-200">
                            Negative Marking <sup className="text-pink-400">*</sup>
                          </label>
                          <input
                            type="number"
                            name="negative"
                            step="0.25"
                            value={test.negative || 0}
                            onChange={(e) => handleTestChange(e, testIndex)}
                            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="0.25"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-200">
                            Status <sup className="text-pink-400">*</sup>
                          </label>
                          <select
                            name="status"
                            value={test.status}
                            onChange={(e) => handleTestStatusChange(e, testIndex)}
                            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                          </select>
                        </div>
                      </div>

                      {/* Questions */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-white text-lg">Questions ({test.questions?.length || 0})</h4>
                        {test.questions && test.questions.map((question, questionIndex) => (
                          <div key={questionIndex} className="rounded-xl bg-zinc-800/50 p-5 relative border border-zinc-700/30">
                            <button
                              type="button"
                              onClick={() => deleteQuestion(testIndex, questionIndex)}
                              className="absolute top-3 right-3 text-red-400 hover:text-red-300 transition-colors duration-200 p-2 hover:bg-red-500/10 rounded-lg"
                            >
                              <FaTrash size={16} />
                            </button>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-200">
                                  Question {questionIndex + 1} <sup className="text-pink-400">*</sup>
                                </label>
                                <input
                                  type="text"
                                  name="text"
                                  value={question.text}
                                  onChange={(e) => handleQuestionChange(e, testIndex, questionIndex)}
                                  className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-zinc-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                  placeholder="Enter question text"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {question.options && question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-200">
                                      Option {String.fromCharCode(65 + optionIndex)}
                                    </label>
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => handleOptionChange(testIndex, questionIndex, optionIndex, e.target.value)}
                                      className="w-full px-4 py-2 rounded-lg bg-zinc-700 border border-zinc-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                      placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                    />
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-200">
                                  Correct Answer <sup className="text-pink-400">*</sup>
                                </label>
                                <select
                                  name="correctAnswer"
                                  value={question.correctAnswer}
                                  onChange={(e) => handleQuestionChange(e, testIndex, questionIndex)}
                                  className="w-full px-4 py-3 rounded-lg bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                                >
                                  <option value="">Select correct answer</option>
                                  {question.options.map((option, optionIndex) => (
                                    <option key={optionIndex} value={option}>
                                      {option || `Option ${String.fromCharCode(65 + optionIndex)}`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => addQuestion(testIndex)}
                            className="flex-1 py-3 px-4 border-2 border-dashed border-zinc-600 rounded-lg text-gray-400 hover:text-white hover:border-blue-500 transition-all duration-200 font-medium"
                          >
                            + Add Question
                          </button>
                          <button
                            type="button"
                            onClick={() => openBulkImportModal(testIndex)}
                            className="flex-1 py-3 px-4 border-2 border-dashed border-purple-600 rounded-lg text-purple-400 hover:text-white hover:border-purple-500 transition-all duration-200 font-medium"
                          >
                            📋 Bulk Import Questions
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-zinc-700/50">
              <button
                type="button"
                onClick={openAddMockTestModal}
                className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-zinc-700 hover:bg-zinc-600 transition-all duration-200"
              >
                Add Mock Test
              </button>
              <button
                type="button"
                onClick={openAddAttachmentsModal}
                className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-zinc-700 hover:bg-zinc-600 transition-all duration-200"
              >
                Add OMR Based Test
              </button>
            </div>

            <div className="flex gap-x-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isLoading ? 'Saving...' : 'Save Series'}
              </button>
              <Link
                to="/dashboard/instructor"
                className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-zinc-700 hover:bg-zinc-600 transition-all duration-200 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>

          {submitStatus === 'success' && (
            <div className="mt-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50">
              <p className="text-green-400 font-medium text-center">✓ Mock test series updated successfully!</p>
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="mt-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50">
              <p className="text-red-400 font-medium text-center">✗ Error updating mock test series. Please try again.</p>
            </div>
          )}
        </div>

        <Modal isOpen={isAddMockTestModalOpen} onClose={closeAddMockTestModal}>
          <AddMockTest seriesId={seriesId} onClose={closeAddMockTestModal} />
        </Modal>
        <Modal isOpen={isAddAttachmentsModalOpen} onClose={closeAddAttachmentsModal}>
          <AddAttachments seriesId={seriesId} onClose={closeAddAttachmentsModal} />
        </Modal>
        <Modal isOpen={isBulkImportModalOpen} onClose={closeBulkImportModal}>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Bulk Import Questions</h2>
            <p className="text-gray-400 text-sm">
              Paste your questions in the following format (6 lines per question):
            </p>
            <div className="bg-zinc-800 p-4 rounded-lg text-xs text-gray-300 font-mono">
              <div>Question text?</div>
              <div>Option 1</div>
              <div>Option 2</div>
              <div>Option 3</div>
              <div>Option 4</div>
              <div>Correct Answer</div>
            </div>
            <textarea
              value={bulkImportText}
              onChange={(e) => setBulkImportText(e.target.value)}
              rows="15"
              placeholder="What is the speed of light in vacuum?&#10;299,792 km/s&#10;300,000 km/s&#10;150,000 km/s&#10;250,000 km/s&#10;299,792 km/s"
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none font-mono text-sm"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBulkImport}
                className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                Import Questions
              </button>
              <button
                type="button"
                onClick={closeBulkImportModal}
                className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-zinc-700 hover:bg-zinc-600 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>

      {/* Tips Section */}
      <div className="sticky top-10 hidden lg:block max-w-[420px] flex-1 rounded-xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-white">Editing Tips</p>
        </div>

        <ul className="space-y-4 text-sm text-gray-300">
          <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
            <span className="text-blue-400 mt-0.5">•</span>
            <span>Review and update the series name and description if needed.</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
            <span className="text-purple-400 mt-0.5">•</span>
            <span>Set an appropriate price for the series.</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
            <span className="text-pink-400 mt-0.5">•</span>
            <span>Check existing tests for any necessary modifications.</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
            <span className="text-green-400 mt-0.5">•</span>
            <span>Create diverse questions to cover various aspects.</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
            <span className="text-yellow-400 mt-0.5">•</span>
            <span>Double-check all questions and answers for accuracy.</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>Ensure a good balance of difficulty levels.</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors duration-200">
            <span className="text-red-400 mt-0.5">•</span>
            <span>Preview the entire series before saving to catch any errors.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EditMockTestSeries; 