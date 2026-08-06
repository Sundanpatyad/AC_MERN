import React from "react"
import * as Icon1 from "react-icons/bi"
import * as Icon3 from "react-icons/hi2"
import * as Icon2 from "react-icons/io5"

const contactDetails = [
  {
    icon: "HiChatBubbleLeftRight",
    heading: "Chat with us",
    description: "Our team is here to help.",
    details: "info@awakeningclasses.com",
  },
  {
    icon: "BiWorld",
    heading: "Visit us",
    description: "Come say hello at our office.",
    details: "Jammu, Jammu & Kashmir",
  },
  {
    icon: "IoCall",
    heading: "Call us",
    description: "Mon - Fri, 8am to 5pm",
    details: "9682578167",
  },
]

const ContactDetails = () => {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-surface p-2">
      {contactDetails.map((ele, i) => {
        const Icon = Icon1[ele.icon] || Icon2[ele.icon] || Icon3[ele.icon]
        return (
          <div
            className="flex flex-col gap-1 p-4 rounded-xl hover:bg-elevated transition-colors"
            key={i}
          >
            <div className="flex items-center gap-3 text-fg">
              <Icon size={20} className="text-muted" />
              <h2 className="text-base font-semibold">{ele.heading}</h2>
            </div>
            <p className="text-sm text-subtle pl-8">{ele.description}</p>
            <p className="text-sm font-medium text-muted pl-8">{ele.details}</p>
          </div>
        )
      })}
    </div>
  )
}

export default ContactDetails
