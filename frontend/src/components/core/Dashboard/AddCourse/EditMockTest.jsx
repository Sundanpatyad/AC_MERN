import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
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

  const openAddMockTestModal = () => setIsAddMockTestModalOpen(true);
  const closeAddMockTestModal = () => setIsAddMockTestModalOpen(false);

  const openAddAttachmentsModal = () => setIsAddAttachmentsModalOpen(true);
  const closeAddAttachmentsModal = () => setIsAddAttachmentsModalOpen(false);

  useEffect(() => {
    const loadSeries = async () => {
      setIsLoading(true);
      const result = await fetchSeries(seriesId, token);
      if (result) {
        setSeries(result);
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
        { testName: '', duration: 0, questions: [], status: 'draft' }
      ]
    });
  };

  const deleteTest = (testIndex) => {
    const updatedTests = [...series.mockTests];
    updatedTests.splice(testIndex, 1);
    setSeries({ ...series, mockTests: updatedTests });
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
        status: test.status,
        questions: test.questions.map(question => ({
          text: question.text,
          options: question.options,
          correctAnswer: question.correctAnswer
        }))
      })),
      attachments: series.attachments
    };

    // //console.log(seriesData);
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="float-right text-gray-300 hover:text-white"
          >
            &times;
          </button>
          {children}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-center text-richblack-5">Loading...</div>;
  }

  if (!series) {
    return <div className="text-center text-richblack-5">No series data found.</div>;
  }

  return (
    <div className="flex w-full items-start gap-x-6 bg-richblack-900 min-h-screen p-8">
      <div className="flex flex-1 flex-col">
        <h1 className="mb-14 text-3xl font-medium text-richblack-5 font-boogaloo text-center lg:text-left">
          Edit Mock Test Series
        </h1>
       
        <div className="flex-1">
          <form onSubmit={(e) => { e.preventDefault(); handleSaveSeries(); }} className="space-y-8">
            <div>
              <label htmlFor="seriesName" className="block text-sm font-medium text-richblack-5">Series Name</label>
              <input
                type="text"
                id="seriesName"
                name="seriesName"
                value={series.seriesName}
                onChange={handleSeriesChange}
                className="mt-1 block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2 "
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-richblack-5">Description</label>
              <textarea
                id="description"
                name="description"
                value={series.description}
                onChange={handleSeriesChange}
                className="mt-1 block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2"
              ></textarea>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-richblack-5">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={series.price}
                onChange={handleSeriesChange}
                className="mt-1 block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label htmlFor="seriesStatus" className="block text-sm font-medium text-richblack-5">Series Status</label>
              <select
                id="seriesStatus"
                name="status"
                value={series.status}
                onChange={handleSeriesStatusChange}
                className="mt-1 block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

          
            {series.attachments && series.attachments.map((item, index) => (
              <div key={item._id} className="bg-gray-800 p-6 rounded-lg shadow-md mb-6 relative">
                <h2 className="text-2xl font-bold text-white mb-4">OMR Based Test</h2>
                <div className="space-y-4">
                  {['name', 'answerKey', 'omrSheet', 'questionPaper'].map((field) => (
                    <div key={field} className="flex flex-col">
                      <label htmlFor={`${field}-${index}`} className="text-gray-300 mb-1 capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}:
                      </label>
                      <input 
                        type="text" 
                        id={`${field}-${index}`} 
                        value={item[field]} 
                        onChange={(e) => handleAttachmentChange(index, field, e.target.value)}
                        className="bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                  <div className="flex flex-col">
                    <label htmlFor={`_id-${index}`} className="text-gray-300 mb-1">ID:</label>
                    <input 
                      type="text" 
                      id={`_id-${index}`} 
                      value={item._id} 
                      readOnly 
                      className="bg-gray-600 text-gray-300 px-3 py-2 rounded-md cursor-not-allowed"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteAttachment(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  <FaTrash />
                </button>
              </div>
            ))}

            <h2 className="text-xl font-semibold mt-8 mb-4 text-richblack-5">Edit Tests</h2>
            {series.mockTests && series.mockTests.map((test, testIndex) => (
              <div key={testIndex} className="space-y-4 bg-richblack-800 p-4 rounded-lg border border-richblack-700 relative mb-6">
                <div>
                  <label htmlFor={`testName-${testIndex}`} className="block text-sm font-medium text-richblack-5">Test Name</label>
                  <input
                    type="text"
                    id={`testName-${testIndex}`}
                    name="testName"
                    value={test.testName}
                    onChange={(e) => handleTestChange(e, testIndex)}
                    className="mt-1 block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2 "
                  />
                </div>
                <div>
                  <label htmlFor={`duration-${testIndex}`} className="block text-sm font-medium text-richblack-5">Duration (minutes)</label>
                  <input
                    type="number"
                    id={`duration-${testIndex}`}
                    name="duration"
                    value={test.duration}
                    onChange={(e) => handleTestChange(e, testIndex)}
                    className="mt-1 block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2 "
                  />
                </div>
                <div>
                  <label htmlFor={`testStatus-${testIndex}`} className="block text-sm font-medium text-richblack-5">Test Status</label>
                  <select
                    id={`testStatus-${testIndex}`}
                    name="status"
                    value={test.status}
                    onChange={(e) => handleTestStatusChange(e, testIndex)}
                    className="mt-1 block w-full bg-richblack-700 border border-richblack-600 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <h3 className="font-bold text-richblack-5 mt-4">Questions</h3>
                {test.questions && test.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="space-y-2 bg-richblack-700 p-3 rounded-md relative">
                    <div>
                      <label htmlFor={`question-${testIndex}-${questionIndex}`} className="block text-sm font-medium text-richblack-5">Question Text</label>
                      <input
                        type="text"
                        id={`question-${testIndex}-${questionIndex}`}
                        name="text"
                        value={question.text}
                        onChange={(e) => handleQuestionChange(e, testIndex, questionIndex)}
                        className="mt-1 block w-full bg-richblack-600 border border-richblack-500 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2"
                      />
                    </div>
                    {question.options && question.options.map((option, optionIndex) => (
                      <div key={optionIndex}>
                        <label htmlFor={`option-${testIndex}-${questionIndex}-${optionIndex}`} className="block text-sm font-medium text-richblack-5">Option {optionIndex + 1}</label>
                        <input
                          type="text"
                          id={`option-${testIndex}-${questionIndex}-${optionIndex}`}
                          value={option}
                          onChange={(e) => handleOptionChange(testIndex, questionIndex, optionIndex, e.target.value)}
                          className="mt-1 block w-full bg-richblack-600 border border-richblack-500 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                    ))}
                    <div>
                      <label htmlFor={`correctAnswer-${testIndex}-${questionIndex}`} className="block text-sm font-medium text-richblack-5">Correct Answer</label>
                      <select
                        id={`correctAnswer-${testIndex}-${questionIndex}`}
                        name="correctAnswer"
                        value={question.correctAnswer}
                        onChange={(e) => handleQuestionChange(e, testIndex, questionIndex)}
                        className="mt-1 block w-full bg-richblack-600 border border-richblack-500 rounded-md shadow-sm py-2 px-3 text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      >
                        <option value="">Select correct answer</option>
                        {question.options.map((option, optionIndex) => (
                          <option key={optionIndex} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteQuestion(testIndex, questionIndex)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addQuestion(testIndex)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-richblack-900 bg-white hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
                >
                  Add Question
                </button>
                <button
                  type="button"
                  onClick={() => deleteTest(testIndex)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  <FaTrash />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addTest}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-richblack-900 bg-white hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
            >
              Add New Test
            </button>

            <div className="flex gap-x-4">
              <button 
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-richblack-900 bg-white hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2  transition-colors duration-200"
              >
                Save Series
              </button>
              <Link to="/dashboard/instructor"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-richblack-900 bg-white hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </Link>
            </div>
          </form>
          {submitStatus === 'success' && (
            <p className="mt-4 text-3xl font-medium text-richblack-5">Mock test series updated successfully!</p>
          )}
          {submitStatus === 'error' && (
            <p className="mt-4 text-3xl font-medium text-richblack-5">Error updating mock test series. Please try again.</p>
          )}
        </div>
        <button
          onClick={openAddMockTestModal}
          className="mt-4 bg-white text-black py-2 px-4 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 "
        >
          Add Mock Test
        </button>
        <button
          onClick={openAddAttachmentsModal}
          className="mt-4 bg-white text-black py-2 px-4 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 "
        >
          Add Omr Based Test
        </button>
        <Modal isOpen={isAddMockTestModalOpen} onClose={closeAddMockTestModal}>
          <AddMockTest seriesId={seriesId} onClose={closeAddMockTestModal} />
        </Modal>
        <Modal isOpen={isAddAttachmentsModalOpen} onClose={closeAddAttachmentsModal}>
          <AddAttachments seriesId={seriesId} onClose={closeAddAttachmentsModal}/>
        </Modal>
      </div>
      
      {/* Tips Section */}
      <div className="sticky top-10 hidden lg:block max-w-[400px] flex-1 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
        <p className="mb-8 text-lg text-richblack-5">⚡ Mock Test Series Editing Tips</p>
        <ul className="ml-5 list-item list-disc space-y-4 text-xs text-richblack-5">
          <li>Review and update the series name and description if needed.</li>
          <li>Set an appropriate price for the series.</li>
          <li>Check existing tests for any necessary modifications.</li>
          <li>When adding new tests, ensure the name and duration are appropriate.</li>
          <li>Create diverse questions to cover various aspects of the subject.</li>
          <li>Double-check all questions and answers for accuracy.</li>
          <li>Ensure a good balance of difficulty levels across the tests.</li>
          <li>Preview the entire series before saving to catch any errors.</li>
          <li>Consider the overall flow and structure of the test series.</li>
        </ul>
      </div>
    </div>
  );
};

export default EditMockTestSeries;