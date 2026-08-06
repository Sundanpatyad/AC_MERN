import React, { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "../components/common/Footer";
import ReviewSlider from "../components/common/ReviewSlider";
import ConfirmationModal from "../components/common/ConfirmationModal";
import HeroSection from "../components/core/HomePage/HeroSection";
import RankOneStoryBlack from "../components/core/HomePage/Rank1";
import { FaTelegram, FaWhatsapp, FaInstagram } from "react-icons/fa";

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

const socials = [
  { href: "https://t.me/awakeningclasses3103", label: "Telegram", Icon: FaTelegram },
  { href: "https://whatsapp.com/channel/0029Van0bFDDDmFZjhOoX03N", label: "WhatsApp", Icon: FaWhatsapp },
  { href: "https://www.instagram.com/awakeningclasses", label: "Instagram", Icon: FaInstagram },
];

const Home = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const { user } = useSelector((state) => state.profile);

  return (
    <div className="w-full overflow-x-hidden bg-page min-h-screen text-fg">
      <HeroSection />

      <Suspense fallback={<div className="h-64" />}>
        <MockTestSection setShowLoginModal={setShowLoginModal} />
      </Suspense>

      <RankOneStoryBlack />

      <Suspense fallback={<div className="h-64" />}>
        <InstructorSection />
      </Suspense>

      <ReviewSlider />

      <Footer />

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

      {/* Desktop-only social links; mobile uses bottom nav and footer */}
      <div className="hidden md:flex fixed right-5 bottom-8 z-40 flex-col gap-2.5">
        {socials.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            aria-label={label}
            className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-muted hover:text-fg hover:bg-elevated transition-colors"
          >
            <Icon size={16} />
          </a>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Home);
