import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExams } from '../../../slices/contentSlice'; // Update the import path accordingly
import { Link } from 'react-router-dom';
import { FaFilePdf } from 'react-icons/fa';
import LoadingSpinner from '../ConductMockTests/Spinner';


function ExamList() {
  const dispatch = useDispatch();
  const exams = useSelector((state) => state.content.exams);
  const status = useSelector((state) => state.content.status);
  const error = useSelector((state) => state.content.error);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchExams());
    }
  }, [dispatch, status]);

  if (status === 'loading') {
    return <LoadingSpinner/>;
  }

  if (status === 'failed') {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-3xl text-center font-bold mb-6">Exams</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {exams.map((exam) => (
          <div
            key={exam._id}
            className="bg-zinc-900 rounded-lg shadow-lg "
          >
            <Link
              to={`/study-materials/${exam._id}`}
              className="block p-3"
            >
              <h3 className="text-md font-semibold mb-2">{exam.name}</h3>
              <p className="text-gray-400 mb-2 text-sm">{exam.description}</p>
            </Link>
            <div className="flex items-center justify-between p-4 border-t border-gray-700">
              <a 
                href={exam.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-sm text-slate-400 hover:text-blue-300"
              >
                <FaFilePdf className="mr-2 " />
                PDF
              </a>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExamList;
