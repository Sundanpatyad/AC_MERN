import { Link } from "react-router-dom"
import Footer from "../components/common/Footer"

const DELETE_EMAIL = "awakeningclasses1343@gmail.com"
const MAIL_HREF = `mailto:${DELETE_EMAIL}?subject=${encodeURIComponent(
  "Delete my Awakening Classes account"
)}`

export default function DeleteAccountPage() {
  return (
    <div className="bg-page text-fg">
      <div className="page-shell section-pad max-w-3xl">
        <p className="text-sm font-semibold text-muted">Awakening Classes</p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
          Delete your account
        </h1>
        <p className="mt-4 text-base text-muted leading-relaxed">
          This page explains how to request deletion of your Awakening Classes
          account and related data from the Awakening Classes website and
          Android app. Deletion is permanent.
        </p>

        <section className="mt-10 rounded-2xl border border-line bg-surface p-6 md:p-8">
          <h2 className="text-xl font-semibold">How to delete your account</h2>
          <ol className="mt-5 space-y-5 text-sm leading-relaxed">
            <li>
              <p className="font-medium text-fg">1. From the Awakening Classes app</p>
              <p className="mt-1 text-muted">
                Open the app → Profile → Settings → Privacy &amp; Security →
                Delete Account. Confirm when asked. You must be signed in.
              </p>
            </li>
            <li>
              <p className="font-medium text-fg">2. From the website</p>
              <p className="mt-1 text-muted">
                Sign in at{" "}
                <Link to="/login" className="text-fg underline underline-offset-2">
                  awakeningclasses.in/login
                </Link>
                , then go to Dashboard → Settings → Delete Account, and confirm.
              </p>
            </li>
            <li>
              <p className="font-medium text-fg">3. If you cannot sign in</p>
              <p className="mt-1 text-muted">
                Email us from your registered email address with the subject
                “Delete my Awakening Classes account”. Include the name and
                phone number on the account if you have them.
              </p>
              <a
                href={MAIL_HREF}
                className="mt-3 inline-flex rounded-full bg-solid px-4 py-2 text-sm font-medium text-solid-fg"
              >
                Email {DELETE_EMAIL}
              </a>
            </li>
          </ol>
          <p className="mt-6 text-sm text-muted">
            We process deletion requests within <span className="text-fg font-medium">30 days</span>.
            In-app and website deletion is immediate after you confirm.
          </p>
        </section>

        <section className="mt-8 space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold">Data we delete</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
              <li>Account profile: name, email, phone number, photo, and password</li>
              <li>App login sessions and device notification tokens</li>
              <li>Course and mock-test enrollments tied to your account</li>
              <li>Test attempts, scores, and in-app usage logs</li>
              <li>Saved profile details such as about, date of birth, and gender</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Data we may keep</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
              <li>
                Payment and invoice records required under Indian tax and
                accounting law, for up to 8 years. These are kept only as needed
                for legal compliance, not for marketing.
              </li>
              <li>
                Information we must retain if required by a lawful request from
                authorities.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Contact</h2>
            <p className="mt-3 text-muted">
              Awakening Classes, Jammu, Jammu &amp; Kashmir
              <br />
              Email:{" "}
              <a href={`mailto:${DELETE_EMAIL}`} className="text-fg underline underline-offset-2">
                {DELETE_EMAIL}
              </a>
            </p>
            <p className="mt-4 text-muted">
              See also our{" "}
              <Link to="/privacy-policy" className="text-fg underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
