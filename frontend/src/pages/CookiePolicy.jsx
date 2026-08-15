import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/common/Footer";

const sections = [
  {
    title: "1. Introduction",
    body: (
      <p>
        This Cookie Policy explains how Awakening Classes uses cookies and similar
        technologies when you visit awakeningclasses.in or use our services. It
        covers what these technologies are, why we use them, and the choices you
        have.
      </p>
    ),
  },
  {
    title: "2. What are cookies?",
    body: (
      <p>
        Cookies are small text files stored on your device when you visit a
        website. They help the site remember your session, preferences, and
        some usage information. We also use similar tools such as local storage
        and pixels for the same purposes.
      </p>
    ),
  },
  {
    title: "3. Cookies we use",
    body: (
      <>
        <p className="mb-4">We use the following categories:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-medium text-fg">Essential.</span> Required for
            login, checkout, cart, and security. These cannot be turned off if
            you want the site to work.
          </li>
          <li>
            <span className="font-medium text-fg">Preferences.</span> Remember
            choices such as light or dark theme.
          </li>
          <li>
            <span className="font-medium text-fg">Analytics.</span> Help us
            understand how the site is used so we can improve courses, mock
            tests, and pages. We use Google Analytics for this.
          </li>
          <li>
            <span className="font-medium text-fg">Advertising.</span> Used to
            deliver and measure ads, including Google AdSense, where shown.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "4. Third parties",
    body: (
      <p>
        Some cookies are set by partners who help us run payments, sign-in,
        analytics, and ads. Those partners may process data under their own
        policies. We do not sell your personal information.
      </p>
    ),
  },
  {
    title: "5. How to control cookies",
    body: (
      <>
        <p className="mb-4">
          You can block or delete cookies in your browser settings. You can also
          use Google’s ad and analytics controls where available. If you block
          essential cookies, login, payments, or saved progress may not work.
        </p>
        <p>
          For more on how we handle personal data, see our{" "}
          <Link to="/privacy-policy" className="text-fg underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    title: "6. Updates",
    body: (
      <p>
        We may update this policy when our cookies or legal requirements change.
        The revised version will be posted on this page with an updated date.
      </p>
    ),
  },
  {
    title: "7. Contact",
    body: (
      <address className="not-italic">
        Awakening Classes
        <br />
        Jammu, Jammu &amp; Kashmir
        <br />
        Email:{" "}
        <a
          href="mailto:awakeningclasses1343@gmail.com"
          className="text-fg underline underline-offset-2"
        >
          awakeningclasses1343@gmail.com
        </a>
      </address>
    ),
  },
];

export default function CookiePolicy() {
  return (
    <div className="bg-page text-fg">
      <div className="page-shell section-pad">
        <div className="mx-auto max-w-2xl space-y-3 mb-10">
          <p className="text-sm font-medium text-muted">Legal</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-sm text-subtle">Last updated: 15 August 2026</p>
        </div>

        <div className="mx-auto max-w-2xl space-y-10 text-base leading-relaxed text-muted">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-fg mb-3">{section.title}</h2>
              {section.body}
            </section>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
