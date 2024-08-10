// src/components/core/HomePage/CourseSection.jsx

import React from 'react';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import HighlightText from './HighlightText';
import Courses from './Courses';
import { getCatalogPageData } from '../../../services/operations/pageAndComponentData';

const CourseSection = () => {
  const dispatch = useDispatch();
  const categoryID = "66758c6b75de4ef02cd497d1";

  const { data: catalogPageData, isLoading: isCoursesLoading } = useQuery(
    ['catalogPageData', categoryID],
    () => getCatalogPageData(categoryID, dispatch),
    { staleTime: Infinity }
  );

  return (
    <div className='relative mx-auto flex flex-col w-11/12 max-w-full mt-10 items-center text-white justify-between'>
      <div className='text-3xl text-center lg:text-5xl font-semibold'>
        Courses <br /> That Make an <br />
        <HighlightText text={"Impact "} />
      </div>
      <p className='mt-2 w-[90%] text-center text-base lg:text-lg font-bold text-richblack-300'>
        Our courses are designed and taught by experts who have years of experience and are passionate about sharing their knowledge with you.
      </p>
      <div>
        <Courses catalogPageData={catalogPageData} isloading={isCoursesLoading} />
      </div>
    </div>
  );
};

export default CourseSection;