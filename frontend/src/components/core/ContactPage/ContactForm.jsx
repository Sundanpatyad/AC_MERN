import React from "react";
import ContactUsForm from "./ContactUsForm";

const ContactForm = () => {
  return (
    <div className="rounded-2xl bg-surface p-6 sm:p-8 lg:p-10 flex gap-3 flex-col">
      <h2 className="text-2xl md:text-3xl leading-tight font-semibold text-fg">
        Send us a message
      </h2>
      <p className="text-sm md:text-base text-muted">
        Tell us a bit about yourself and how we can help.
      </p>

      <div className="mt-4">
        <ContactUsForm />
      </div>
    </div>
  );
};

export default ContactForm;
