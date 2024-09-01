import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { FaDownload, FaExternalLinkAlt } from 'react-icons/fa';
import { studyMaterialEndPoints } from '../../../services/apis';

function StudyMaterialList() {
  const { examId } = useParams();
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const { token } = useSelector((state) => state.auth);
  const {FETCH_STUDY_MATERIALS} = studyMaterialEndPoints;

  useEffect(() => {
    if (!token) {
      return;
    }

    const fetchStudyMaterials = async () => {
      try {
        const response = await axios.get(`${FETCH_STUDY_MATERIALS}/${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudyMaterials(response.data);
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching study materials:', error);
        setLoading(false); // Ensure loading is false even if there's an error
      }
    };
    fetchStudyMaterials();
  }, [examId, token]);

  if (!token) {
    return (
      <div className="pt-40 bg-black text-zinc-100 flex flex-col items-center justify-center p-6 sm:p-4">
        <p className="text-2xl sm:text-xl font-semibold mb-6 text-center">
          Please log in to view and download study materials.
        </p>
        <Link to={'/login'} className="w-full sm:w-auto px-8 py-3 text-center bg-zinc-700 hover:bg-zinc-600 text-zinc-100 font-bold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
          Log In
        </Link>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-3xl text-center font-bold mb-6">Study Materials</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          // Render 8 skeleton cards as a placeholder
          Array(8).fill().map((_, index) => <SkeletonCard key={index} />)
        ) : (
          studyMaterials.map((material) => (
            <div key={material._id} className="bg-zinc-900 p-6 rounded-lg shadow-lg flex flex-col">
              <h3 className="text-xl font-semibold mb-4">{material.title}</h3>
              <p className="text-sm text-gray-400 mb-4">Created by: @awakeningclasses</p>
              <div className="flex-1">
                {/* Placeholder for content preview, if needed */}
              </div>
              <div className="flex justify-between mt-4">
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
          ))
        )}
      </div>
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

export default StudyMaterialList;
