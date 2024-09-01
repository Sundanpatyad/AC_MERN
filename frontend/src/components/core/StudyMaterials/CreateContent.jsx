import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setContentType,
  setExamName,
  setExamDescription,
  setMaterialTitle,
  setMaterialContent,
  setSelectedExamId,
  resetForm,
  fetchExams,
  fetchStudyMaterials,
  createExam,
  createStudyMaterial,
  deleteExam,
  deleteStudyMaterial,
} from '../../../slices/contentSlice';

function CreateContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    contentType,
    examName,
    examDescription,
    materialTitle,
    materialContent,
    selectedExamId,
    exams,
    studyMaterials,
    status,
  } = useSelector((state) => state.content);
  const { token } = useSelector((state) => state.auth);
  const [editMode, setEditMode] = useState({ type: null, id: null });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchExams());
      dispatch(fetchStudyMaterials({ selectedExamId, token }));
    }
  }, [status, dispatch, selectedExamId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (contentType === 'exam') {
        await dispatch(createExam({ name: examName, description: examDescription, token })).unwrap();
      } else {
        await dispatch(createStudyMaterial({ title: materialTitle, content: materialContent, exam: selectedExamId, token })).unwrap();
      }
      dispatch(resetForm());
      setEditMode({ type: null, id: null });
    } catch (error) {
      console.error('Error creating content:', error);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      if (type === 'exam') {
        await dispatch(deleteExam({ id, token })).unwrap();
      } else {
        await dispatch(deleteStudyMaterial({ id, token })).unwrap();
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Content Management</h2>
        
        {/* Create/Edit Form */}
        <div className="bg-zinc-800 shadow-lg rounded-lg overflow-hidden mb-12">
          <div className="bg-gradient-to-r bg-zinc-900  py-8 px-6 sm:px-10">
            <h3 className="text-3xl font-semibold text-white">
              {editMode.type ? `Edit ${editMode.type === 'exam' ? 'Exam' : 'Study Material'}` : 'Create New Content'}
            </h3>
          </div>
          <div className="p-8 sm:p-12">
            <div className="flex justify-center space-x-8 mb-10">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-indigo-500 border-zinc-700 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                  value="exam"
                  checked={contentType === 'exam'}
                  onChange={() => dispatch(setContentType('exam'))}
                />
                <span className="ml-2 text-zinc-300">Exam</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-indigo-500 border-zinc-700 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                  value="studyMaterial"
                  checked={contentType === 'studyMaterial'}
                  onChange={() => dispatch(setContentType('studyMaterial'))}
                />
                <span className="ml-2 text-zinc-300">Study Material</span>
              </label>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              {contentType === 'exam' ? (
                <>
                  <div>
                    <label htmlFor="examName" className="block text-sm font-medium text-zinc-300">
                      Exam Name
                    </label>
                    <input
                      type="text"
                      id="examName"
                      value={examName}
                      onChange={(e) => dispatch(setExamName(e.target.value))}
                      required
                      className="mt-2 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="examDescription" className="block text-sm font-medium text-zinc-300">
                      Description
                    </label>
                    <textarea
                      id="examDescription"
                      value={examDescription}
                      onChange={(e) => dispatch(setExamDescription(e.target.value))}
                      className="mt-2 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                      rows="4"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="materialTitle" className="block text-sm font-medium text-zinc-300">
                      Title
                    </label>
                    <input
                      type="text"
                      id="materialTitle"
                      value={materialTitle}
                      onChange={(e) => dispatch(setMaterialTitle(e.target.value))}
                      required
                      className="mt-2 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="materialContent" className="block text-sm font-medium text-zinc-300">
                      Attachment Link
                    </label>
                    <input
                      id="materialContent"
                      value={materialContent}
                      onChange={(e) => dispatch(setMaterialContent(e.target.value))}
                      required
                      className="mt-2 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="exam" className="block text-sm font-medium text-zinc-300">
                      Exam
                    </label>
                    <select
                      id="exam"
                      value={selectedExamId}
                      onChange={(e) => dispatch(setSelectedExamId(e.target.value))}
                      required
                      className="mt-2 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                    >
                      <option value="">Select an exam</option>
                      {exams.map((exam) => (
                        <option key={exam._id} value={exam._id}>
                          {exam.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-zinc-700 bg-slate-200 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-indigo-500 transition duration-150 ease-in-out"
                >
                  {editMode.type ? 'Update' : 'Create'} {contentType === 'exam' ? 'Exam' : 'Study Material'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Exams List */}
        <div className="bg-zinc-800 shadow-lg rounded-lg overflow-hidden mb-12">
          <div className="bg-gradient-to-r bg-zinc-900 py-5 px-6">
            <h3 className="text-2xl font-semibold text-white">Exams</h3>
          </div>
          <div className="p-8">
            {exams.map((exam) => (
              <div key={exam._id} className="flex justify-between items-center py-3 border-b border-zinc-700">
                <span className="text-lg">{exam.name}</span>
                <div>
                  <button
                    onClick={() => handleDelete('exam', exam._id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Materials List */}
        <div className="bg-zinc-800 shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r bg-zinc-900 py-5 px-6">
            <h3 className="text-2xl font-semibold text-white">Study Materials</h3>
          </div>
          <div className="p-8">
            {studyMaterials.map((material) => (
              <div key={material._id} className="flex justify-between items-center py-3 border-b border-zinc-700">
                <span className="text-lg">{material.title}</span>
                <div>
                  <button
                    onClick={() => handleDelete('studyMaterial', material._id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateContent;
