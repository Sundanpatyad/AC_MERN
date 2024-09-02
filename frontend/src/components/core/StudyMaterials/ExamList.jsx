import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExams } from '../../../slices/contentSlice'; // Update the import path accordingly
import { FaDownload, FaExternalLinkAlt } from 'react-icons/fa';
import axios from 'axios';
import { studyMaterialEndPoints } from '../../../services/apis';
import LoadingSpinner from '../ConductMockTests/Spinner';
import { Link } from 'react-router-dom';

function ExamList() {
  const dispatch = useDispatch();
  const exams = useSelector((state) => state.content.exams);
  const examStatus = useSelector((state) => state.content.status);
  const examError = useSelector((state) => state.content.error);

  const [selectedExamId, setSelectedExamId] = useState(null);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const { FETCH_STUDY_MATERIALS } = studyMaterialEndPoints;

  const [searchQuery, setSearchQuery] = useState(''); 

  useEffect(() => {
    if (examStatus === 'idle') {
      dispatch(fetchExams());
    }
  }, [dispatch, examStatus]);

  useEffect(() => {
    if (!token || !selectedExamId) return;

    const fetchStudyMaterials = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${FETCH_STUDY_MATERIALS}/${selectedExamId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudyMaterials(response.data);
      } catch (error) {
        console.error('Error fetching study materials:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudyMaterials();
  }, [selectedExamId, token]);

  const handleExamClick = (id) => {
    setSelectedExamId(id);
  };

  const filteredExams = exams.filter((exam) =>
    exam.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (examStatus === 'loading') {
    return <LoadingSpinner />;
  }

  if (examStatus === 'failed') {
    return <p className="text-red-500">Error: {examError}</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-3xl text-center font-bold mb-6">Exams & Study Materials</h2>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search exams..."
          className="w-full p-3 rounded-lg bg-zinc-900 text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
        />
      </div>

      {/* Exam List displayed in a horizontal row */}
      <div className="flex overflow-x-auto space-x-4 mb-6 border-b border-zinc-400 pb-5">
        {filteredExams.map((exam) => (
          <button
            key={exam._id}
            onClick={() => handleExamClick(exam._id)}
            className={`cursor-pointer bg-zinc-900 p-3 rounded-lg shadow-lg whitespace-nowrap ${exam._id === selectedExamId ? 'bg-slate-800' : ''}`}
          >
            <h3 className="text-sm font-semibold mb-2">{exam.name}</h3>
            <p className="text-gray-400 mb-2 text-xs">{exam.description}</p>
          </button>
        ))}
      </div>

      {/* Display study materials for the selected exam */}
      {token ? (
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill().map((_, index) => <SkeletonCard key={index} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {studyMaterials.map((material) => (
              <div key={material._id} className="bg-zinc-900 p-3 rounded-lg shadow-lg flex flex-col">
                <h3 className="text-md font-semibold mb-4">{material.title}</h3>
                <p className="text-xs text-gray-400 mb-4">Created by: @awakeningclasses</p>
                <div className="flex-1"></div>
                <div className="flex justify-between mt-4 text-sm">
                  <a href={material.content} download className="flex items-center text-slate-400 hover:text-blue-300">
                    <FaDownload className="mr-2" />
                    Download
                  </a>
                  <a href={material.content} target="_blank" rel="noopener noreferrer" className="flex items-center text-slate-400 hover:text-blue-300">
                    <FaExternalLinkAlt className="mr-2" />
                    Open
                  </a>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="pt-40 bg-black text-zinc-100 flex flex-col items-center justify-center p-6 sm:p-4">
          <p className="text-2xl sm:text-xl font-semibold mb-6 text-center">
            Please log in to view and download study materials.
          </p>
          <Link to={'/login'} className="w-full sm:w-auto px-8 py-3 text-center bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-bold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
            Log In
          </Link>
        </div>
      )}
    </div>
  );
}

const SkeletonCard = () => {
  return (
    <div className="bg-zinc-900 p-6 rounded-lg shadow-lg flex flex-col animate-pulse">
      <div className="h-6 bg-zinc-700 rounded mb-4"></div>
      <div className="h-4 bg-zinc-700 rounded mb-4"></div>
      <div className="flex-1">
        <div className="h-32 bg-zinc-700 rounded"></div>
      </div>
      <div className="flex justify-between mt-4">
        <div className="h-8 bg-zinc-700 rounded w-24"></div>
        <div className="h-8 bg-zinc-700 rounded w-24"></div>
      </div>
    </div>
  );
};

export default ExamList;
