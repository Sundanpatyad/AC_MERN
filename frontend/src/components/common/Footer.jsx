import React from "react";
import { Link } from "react-router-dom";
import { ImGithub, ImLinkedin2 } from "react-icons/im";

const Footer = () => {
  return (
    <div className="bg-black mx-7 rounded-3xl mb-10">
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-between w-11/12 max-w-maxContent text-richblack-400 leading-6 mx-auto relative py-14">
        <div className="w-full flex flex-col lg:flex-row justify-between">
          <div className="lg:w-1/3 mb-7">
            <h1 className="text-richblack-50 font-semibold text-[16px] mb-3">Awakening Classes</h1>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-[14px] hover:text-richblack-50 transition-all duration-200">About</Link>
              <Link to="/contact" className="text-[14px] hover:text-richblack-50 transition-all duration-200">Contact</Link>
            </div>
           
          </div>

          <div className="lg:w-1/3 mb-7">
            <h1 className="text-richblack-50 font-semibold text-[16px] mb-3">Quick Links</h1>
            <div className="flex flex-col gap-2">
              <Link to="/catalog/all-courses" className="text-[14px] hover:text-richblack-50 transition-all duration-200">Courses</Link>
              <Link to="/mockTest" className="text-[14px] hover:text-richblack-50 transition-all duration-200">Mock Tests</Link>
            </div>
          </div>

          <div className="lg:w-1/3 mb-7">
            <h1 className="text-richblack-50 font-semibold text-[16px] mb-3">Support</h1>
            <div className="text-[14px] hover:text-richblack-50 transition-all duration-200">
              <Link to="/contact">Help Center</Link>
            </div>
          </div>
        </div>
      </div>

      {/* bottom footer */}
      <div className="flex flex-col lg:flex-row items-center justify-between w-11/12 max-w-maxContent text-richblack-400 mx-auto pb-14 text-sm">
        <div className="flex flex-wrap justify-center lg:justify-start gap-3 w-full mb-4 lg:mb-0">
          <Link to="/privacy-policy" className="hover:text-richblack-50 transition-all duration-200">Privacy Policy</Link>
          <Link to="/cookie-policy" className="hover:text-richblack-50 transition-all duration-200">Cookie Policy</Link>
          <Link to="/terms" className="hover:text-richblack-50 transition-all duration-200">Terms</Link>
        </div>

        <div className="text-center lg:text-right">
          <span>Made with ❤️ by </span>
          <a href="https://github.com/Sundanpatyad" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">
            Sundan Sharma
          </a>
          <span> © 2024 Awakening Classes</span>
        </div>

        <div className="flex items-center mt-4 lg:mt-0">
          <a href="https://www.linkedin.com/in/sundan-sharma" className="text-white p-3 hover:bg-richblack-700 rounded-full duration-300" target="_blank" rel="noopener noreferrer">
            <ImLinkedin2 size={17} />
          </a>
          <a href="https://github.com/Sundanpatyad" className="text-white p-3 hover:bg-richblack-700 rounded-full duration-300" target="_blank" rel="noopener noreferrer">
            <ImGithub size={17} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;