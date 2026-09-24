import React from "react"

import FoundingStory from "../assets/Images/FoundingStory.png"

import Footer from "../components/common/Footer"
import ContactFormSection from "../components/core/AboutPage/ContactFormSection"
import LearningGrid from "../components/core/AboutPage/LearningGrid"
import StatsComponenet from "../components/core/AboutPage/Stats"
import Img from "../components/common/Img"
import ReviewSlider from "./../components/common/ReviewSlider"

const Kicker = ({ children }) => (
  <div className="flex items-center gap-3">
    <span className="h-px w-8 shrink-0 bg-fg" />
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg">{children}</p>
  </div>
)

const About = () => {
  return (
    <div className="bg-page text-fg">
      <section className="border-b border-line">
        <div className="mx-auto w-full max-w-2xl px-5 py-14 sm:px-6 sm:py-20">
          <Kicker>Our story</Kicker>
          <h1 className="mt-8 text-[2.35rem] font-semibold leading-[1.08] tracking-tight text-fg sm:text-5xl">
            Clear coaching for competitive exams
          </h1>
          <p className="mt-14 text-base leading-relaxed text-muted">
            We help aspirants prepare with focused courses, realistic mock tests, and practical guidance.
          </p>

          <figure className="relative mt-8 aspect-[4/3] w-full overflow-hidden">
            <Img
              src={FoundingStory}
              alt="Students preparing with Awakening Classes"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute bottom-4 left-4 z-10 rounded-full bg-page px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg shadow-sm">
              Awakening Classes
            </span>
          </figure>

          <div className="mt-14">
            <Kicker>A focused start</Kicker>
            <p className="mt-14 text-base leading-relaxed text-muted">
              Our platform started from a simple need: accessible, flexible, high-quality preparation for students who want more than classroom limits.
            </p>
            <p className="mt-8 text-base leading-relaxed text-muted">
              As educators, we saw the gaps in traditional systems. We built Awakening Classes to bridge those gaps with modern tools and focused content.
            </p>
          </div>

          <div className="mt-14">
            <Kicker>Our vision</Kicker>
            <p className="mt-14 text-base leading-relaxed text-muted">
              Create a preparation experience that is clear, practical, and built for real exam conditions.
            </p>
          </div>

          <div className="mt-14">
            <Kicker>Our mission</Kicker>
            <p className="mt-14 text-base leading-relaxed text-muted">
              Help learners connect, practice, and improve through mock tests, sessions, and a supportive community.
            </p>
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
