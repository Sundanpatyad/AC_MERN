import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CountryCode from '../../../../data/countrycode.json';

const ContactUsForm = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm();

  const submitContactForm = async (data) => {
    try {
      setLoading(true);
      // Implement your API call here
      // For example:
      // await apiConnector("POST", contactusEndpoint.CONTACT_US_API, data);
      console.log("Form submitted:", data);
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
      className="flex flex-col gap-7"
      onSubmit={handleSubmit(submitContactForm)}
    >
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex flex-col gap-2 lg:w-[48%]">
          <label htmlFor="firstname" className="label-style">
            First Name
          </label>
          <input
            type="text"
            id="firstname"
            placeholder="Enter first name"
            className="bg-transparent p-3 border-2 rounded-md border-slate-500"
            {...register("firstname", { required: "Please enter your first name." })}
          />
          {errors.firstname && (
            <span className="-mt-1 text-[12px] text-white">
              {errors.firstname.message}
            </span>
          )}
        </div>
        
        <div className="flex flex-col gap-2 lg:w-[48%]">
          <label htmlFor="lastname" className="label-style">
            Last Name
          </label>
          <input
            type="text"
            id="lastname"
            placeholder="Enter last name"
           className="bg-transparent p-3 border-2 rounded-md border-slate-500"
            {...register("lastname")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="label-style">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          placeholder="Enter email address"
         className="bg-transparent p-3 border-2 rounded-md border-slate-500"
          {...register("email", { 
            required: "Please enter your email address.",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Please enter a valid email address."
            }
          })}
        />
        {errors.email && (
          <span className="-mt-1 text-[12px] text-white">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phonenumber" className="label-style">
          Phone Number
        </label>

        <div className="flex gap-5">
          <div className="flex w-[81px] flex-col gap-2">
            <select
              id="countrycode"
             className="bg-transparent p-3 border-2 rounded-md border-slate-500"
              {...register("countrycode", { required: "Country code is required." })}
            >
              <option value="">Select</option>
              {CountryCode.map((ele, i) => (
                <option key={i} value={ele.code}>
                  {ele.code} - {ele.country}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-[calc(100%-90px)] flex-col gap-2">
            <input
              type="tel"
              id="phonenumber"
              placeholder="12345 67890"
               className="bg-transparent p-3 border-2 rounded-md border-slate-500"
              {...register("phoneNo", {
                required: "Please enter your phone number.",
                pattern: {
                  value: /^[0-9]{10,12}$/,
                  message: "Please enter a valid phone number (10-12 digits)."
                }
              })}
            />
          </div>
        </div>
        {(errors.countrycode || errors.phoneNo) && (
          <span className="-mt-1 text-[12px] text-white">
            {errors.countrycode?.message || errors.phoneNo?.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="label-style">
          Message
        </label>
        <textarea
          id="message"
          cols="30"
          rows="7"
          placeholder="Enter your message here"
          className="bg-transparent p-3 border-2 rounded-md border-slate-500"
          {...register("message", { required: "Please enter your message." })}
        />
        {errors.message && (
          <span className="-mt-1 text-[12px] text-white">
            {errors.message.message}
          </span>
        )}
      </div>

      <button
        disabled={loading}
        type="submit"
        className={`rounded-md bg-white px-6 py-3 text-center text-[13px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] 
         ${!loading &&
          "transition-all duration-200 hover:scale-95 hover:shadow-none"
          }  disabled:bg-richblack-500 sm:text-[16px] `}
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
};

export default ContactUsForm;