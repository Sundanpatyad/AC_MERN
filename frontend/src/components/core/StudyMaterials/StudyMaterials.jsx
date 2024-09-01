import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { FaDownload, FaExternalLinkAlt } from 'react-icons/fa';

function StudyMaterialList() {
  const { examId } = useParams();  // Extract the examId from the URL parameters
  const [studyMaterials, setStudyMaterials] = useState([]);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      return; // Skip fetching data if there's no token
    }

    const fetchStudyMaterials = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/materials/getStudyMaterials/${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudyMaterials(response.data);
      } catch (error) {
        console.error('Error fetching study materials:', error);
      }
    };
    fetchStudyMaterials();
  }, [examId, token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">Please log in to view and download study materials.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-3xl text-center font-bold mb-6">Study Materials</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {studyMaterials.map((material) => (
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
        ))}
      </div>
    </div>
  );
}

export default StudyMaterialList;
