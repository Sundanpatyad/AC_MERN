import React from "react"

import FoundingStory from "../assets/Images/FoundingStory.png"
import BannerImage1 from "../assets/Images/aboutus1.webp"
import BannerImage2 from "../assets/Images/aboutus2.webp"
import BannerImage3 from "../assets/Images/aboutus3.webp"

import Footer from "../components/common/Footer"
import ContactFormSection from "../components/core/AboutPage/ContactFormSection"
import LearningGrid from "../components/core/AboutPage/LearningGrid"
import Quote from "../components/core/AboutPage/Quote"
import StatsComponenet from "../components/core/AboutPage/Stats"
import Img from "../components/common/Img"
import ReviewSlider from "./../components/common/ReviewSlider"

const About = () => {
  return (
    <div className="bg-page text-fg">
      <section className="border-b border-line">
        <div className="page-shell section-pad text-center max-w-3xl mx-auto space-y-5">
          <p className="text-sm font-semibold text-muted">About Awakening Classes</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Clear coaching for competitive exams
          </h1>
          <p className="text-base text-muted leading-relaxed">
            We help aspirants prepare with focused courses, realistic mock tests, and practical guidance.
          </p>
        </div>

        <div className="page-shell pb-12 md:pb-16">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Img src={BannerImage1} alt="" className="rounded-xl object-cover aspect-[4/3] w-full" />
            <Img src={BannerImage2} alt="" className="rounded-xl object-cover aspect-[4/3] w-full" />
            <Img src={BannerImage3} alt="" className="rounded-xl object-cover aspect-[4/3] w-full" />
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="page-shell section-pad">
          <Quote />
        </div>
      </section>

      <section className="border-b border-line">
        <div className="page-shell section-pad space-y-16 md:space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Our founding story</h2>
              <p className="text-sm md:text-base text-muted leading-relaxed">
                Our platform started from a simple need: accessible, flexible, high-quality preparation for students who want more than classroom limits.
              </p>
              <p className="text-sm md:text-base text-muted leading-relaxed">
                As educators, we saw the gaps in traditional systems. We built Awakening Classes to bridge those gaps with modern tools and focused content.
              </p>
            </div>
            <Img
              src={FoundingStory}
              alt="Founding story"
              className="rounded-2xl w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-3 rounded-2xl bg-surface p-6 md:p-8">
              <h3 className="text-xl font-semibold text-fg">Our vision</h3>
              <p className="text-sm text-muted leading-relaxed">
                Create a preparation experience that is clear, practical, and built for real exam conditions.
              </p>
            </div>
            <div className="space-y-3 rounded-2xl bg-surface p-6 md:p-8">
              <h3 className="text-xl font-semibold text-fg">Our mission</h3>
              <p className="text-sm text-muted leading-relaxed">
                Help learners connect, practice, and improve through mock tests, sessions, and a supportive community.
              </p>
            </div>
          </div>
        </div>
      </section>

      <StatsComponenet />

      <section className="page-shell section-pad space-y-16">
        <LearningGrid />
        <ContactFormSection />
      </section>

      <ReviewSlider />
      <Footer />
    </div>
  )
}

export default About
