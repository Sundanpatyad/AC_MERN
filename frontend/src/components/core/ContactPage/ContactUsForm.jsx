import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CountryCode from '../../../../data/countrycode.json';

const inputClass = "field";
const labelClass = "text-sm font-medium text-fg";

const ContactUsForm = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm();

  const submitContactForm = async () => {
    try {
      setLoading(true);
    } catch (error) {
      console.error("Error submitting form:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        email: "",
        firstname: "",
        lastname: "",
        message: "",
        phoneNo: "",
        countrycode: "",
      });
    }
  }, [reset, isSubmitSuccessful]);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit(submitContactForm)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="firstname" className={labelClass}>
            First name
          </label>
          <input
            type="text"
            id="firstname"
            placeholder="First name"
            className={inputClass}
            {...register("firstname", { required: "Please enter your first name." })}
          />
          {errors.firstname && (
            <span className="text-xs text-brand">{errors.firstname.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="lastname" className={labelClass}>
            Last name
          </label>
          <input
            type="text"
            id="lastname"
            placeholder="Last name"
            className={inputClass}
            {...register("lastname")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          type="email"
          id="email"
          placeholder="you@example.com"
          className={inputClass}
          {...register("email", {
            required: "Please enter your email address.",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Please enter a valid email address."
            }
          })}
        />
        {errors.email && (
          <span className="text-xs text-brand">{errors.email.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phonenumber" className={labelClass}>
          Phone number
        </label>
        <div className="flex gap-3">
          <select
            id="countrycode"
            className={`${inputClass} w-[100px] shrink-0`}
            {...register("countrycode", { required: "Country code is required." })}
          >
            <option value="">Code</option>
            {CountryCode.map((ele, i) => (
              <option key={i} value={ele.code} className="bg-page">
                {ele.code}
              </option>
            ))}
          </select>
          <input
            type="tel"
            id="phonenumber"
            placeholder="Phone number"
            className={inputClass}
            {...register("phoneNo", {
              required: "Please enter your phone number.",
              pattern: {
                value: /^[0-9]{10,12}$/,
                message: "Please enter a valid phone number (10-12 digits)."
              }
            })}
          />
        </div>
        {(errors.countrycode || errors.phoneNo) && (
          <span className="text-xs text-brand">
            {errors.countrycode?.message || errors.phoneNo?.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          rows="5"
          placeholder="How can we help?"
          className={`${inputClass} resize-none`}
          {...register("message", { required: "Please enter your message." })}
        />
        {errors.message && (
          <span className="text-xs text-brand">{errors.message.message}</span>
        )}
      </div>

      <button
        disabled={loading}
        type="submit"
        className="btn-primary w-full sm:w-auto disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send message"}
      </button>
    </form>
  );
};

export default ContactUsForm;
