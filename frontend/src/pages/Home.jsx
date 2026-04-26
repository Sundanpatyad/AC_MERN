import React, { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "../components/common/Footer";
import ReviewSlider from "../components/common/ReviewSlider";
import ConfirmationModal from "../components/common/ConfirmationModal";
import HeroSection from "../components/core/HomePage/HeroSection";
import RankOneStoryBlack from "../components/core/HomePage/Rank1";
import { FaTelegram } from "react-icons/fa";

const MockTestSection = lazy(() =>
  import("../components/core/HomePage/MockTestSection")
);
const InstructorSection = lazy(() =>
  import("../components/core/HomePage/InstructorSection")
);
const CourseReviewModal = lazy(() =>
  import("../components/core/ViewCourse/CourseReviewModal")
);
const MobileNumberDrawer = lazy(() =>
  import("../components/core/HomePage/Phone")
);

const Home = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const { user } = useSelector((state) => state.profile);

  return (
    <div className="overflow-hidden w-screen bg-black min-h-screen text-white selection:bg-white/20 selection:text-white">

      {/* ── Sections ── */}
      <div className="space-y-0">
        <HeroSection />

        <Suspense fallback={<div className="h-96" />}>
          <MockTestSection setShowLoginModal={setShowLoginModal} />
        </Suspense>

        <RankOneStoryBlack />

        <Suspense fallback={<div className="h-96" />}>
          <InstructorSection />
        </Suspense>

        <ReviewSlider />
      </div>

      <Footer />

      {/* ── Modals ── */}
      {token && reviewModal && (
        <Suspense fallback={null}>
          <CourseReviewModal setReviewModal={setReviewModal} />
        </Suspense>
      )}

      {showLoginModal && (
        <ConfirmationModal
          modalData={{
            title: "You are not logged in",
            text1: "Please log in to continue.",
            btn1Text: "Login",
            btn2Text: "Cancel",
            btn1Handler: () => navigate("/login"),
            btn2Handler: () => setShowLoginModal(false),
          }}
        />
      )}

      {token && user?.mobileNumber === null && (
        <Suspense fallback={null}>
          <MobileNumberDrawer />
        </Suspense>
      )}

      {/* ── Minimal floating social bar ── */}
      <div className="fixed right-6 bottom-8 z-50 flex flex-col gap-3 items-center md:right-8 md:bottom-12">
        {/* Telegram */}
        <a
          href="https://t.me/awakeningclasses3103"
          target="_blank"
          rel="noopener noreferrer"
          title="Telegram"
          className="w-11 h-11 rounded-full glass glass-hover flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl"
        >
          <FaTelegram size={18} className="text-[#24A1DE]" />
        </a>

        {/* WhatsApp */}
        <a
          href="https://whatsapp.com/channel/0029Van0bFDDDmFZjhOoX03N"
          target="_blank"
          rel="noopener noreferrer"
          title="WhatsApp"
          className="w-11 h-11 rounded-full glass glass-hover flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5" fill="#25D366">
            <path d="M16.002 0C7.165 0 0 7.164 0 15.999c0 2.825.742 5.593 2.149 8.034L.039 32l8.119-2.086a16.01 16.01 0 0 0 7.844 2.008C24.84 31.922 32 24.76 32 16.002 32 7.164 24.838 0 16.002 0zm0 29.267a13.269 13.269 0 0 1-6.77-1.844l-.487-.29-4.829 1.24 1.292-4.702-.314-.495a13.25 13.25 0 1 1 24.29-6.19c0 7.31-5.954 13.281-13.182 13.281zm7.224-9.952c-.394-.196-2.335-1.157-2.7-1.29-.364-.134-.629-.196-.893.197-.262.388-1.029 1.29-1.26 1.557-.232.262-.463.293-.857.098-.393-.195-1.664-.614-3.17-1.957-1.171-1.046-1.964-2.34-2.194-2.735-.232-.39-.025-.6.171-.795.175-.172.39-.447.586-.67.196-.232.262-.39.393-.648.13-.262.066-.49-.033-.688-.099-.195-.893-2.153-1.222-2.944-.32-.777-.647-.671-.893-.671-.23 0-.49-.032-.754-.032a1.452 1.452 0 0 0-1.063.487c-.394.393-1.447 1.414-1.447 3.445s1.482 3.985 1.688 4.266c.198.262 2.92 4.472 7.084 6.272.989.426 1.762.681 2.365.872a5.75 5.75 0 0 0 2.637.166c.804-.122 2.334-.953 2.665-1.878.33-.925.33-1.718.23-1.878-.098-.163-.36-.262-.754-.457z" />
          </svg>
        </a>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/awakeningclasses?igsh=bXo2MXllODRmandr&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          title="Instagram"
          className="w-11 h-11 rounded-full glass glass-hover flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 169.063 169.063" className="w-5 h-5">
            <defs>
              <linearGradient id="ig-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#f09433", stopOpacity: 1 }} />
                <stop offset="25%" style={{ stopColor: "#e6683c", stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: "#dc2743", stopOpacity: 1 }} />
                <stop offset="75%" style={{ stopColor: "#cc2366", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#bc1888", stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path fill="url(#ig-grad)" d="M122.406 0H46.657C20.935 0 0 20.935 0 46.657v75.749c0 25.723 20.935 46.657 46.657 46.657h75.749c25.723 0 46.657-20.935 46.657-46.657V46.657C169.063 20.935 148.129 0 122.406 0zm32.265 122.406c0 17.801-14.464 32.265-32.265 32.265H46.657c-17.801 0-32.265-14.464-32.265-32.265V46.657c0-17.801 14.464-32.265 32.265-32.265h75.749c17.801 0 32.265 14.464 32.265 32.265v75.749z" />
            <path fill="url(#ig-grad)" d="M84.532 41.164c-23.928 0-43.369 19.442-43.369 43.369 0 23.927 19.441 43.369 43.369 43.369 23.927 0 43.369-19.442 43.369-43.369 0-23.927-19.442-43.369-43.369-43.369zm0 71.473c-15.544 0-28.104-12.56-28.104-28.104 0-15.544 12.56-28.104 28.104-28.104 15.544 0 28.104 12.56 28.104 28.104 0 15.544-12.56 28.104-28.104 28.104zM129.921 27.773a10.202 10.202 0 0 0-10.197 10.197 10.202 10.202 0 0 0 10.197 10.197 10.203 10.203 0 0 0 10.197-10.197 10.201 10.201 0 0 0-10.197-10.197z" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default React.memo(Home);
