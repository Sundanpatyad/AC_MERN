import React from "react"

import Footer from "../components/common/Footer"
import ContactDetails from "../components/core/ContactPage/ContactDetails"
import ContactForm from "../components/core/ContactPage/ContactForm"
import ReviewSlider from "./../components/common/ReviewSlider"

const Contact = () => {
  return (
    <div className="bg-page text-fg">
      <div className="page-shell section-pad">
        <div className="max-w-2xl mb-10 space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Contact us</h1>
          <p className="text-base text-muted">
            Questions about courses, mock tests, or enrollment? Reach out and we will help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <ContactDetails />
          </div>
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>

      <ReviewSlider />
      <Footer />
    </div>
  )
}

export default Contact
