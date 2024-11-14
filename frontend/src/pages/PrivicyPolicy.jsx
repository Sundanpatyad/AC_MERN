import { Link } from "react-router-dom";



export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
     

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">Welcome to Awakening Classes. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <p className="mb-4">We collect personal information that you provide to us when you register for an account, sign up for our newsletter, or contact us. This may include:</p>
          <ul className="list-disc list-inside mb-4">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Billing information</li>
          </ul>
          <p>We also automatically collect certain information when you visit our website, including your IP address, browser type, and pages visited.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc list-inside mb-4">
            <li>Provide and maintain our services</li>
            <li>Communicate with you about our classes and offerings</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. How We Share Your Information</h2>
          <p className="mb-4">We do not sell your personal information. We may share your information with third-party service providers who help us operate our website and deliver our services. We may also disclose your information if required by law or to protect our rights or the rights of others.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights and Choices</h2>
          <p className="mb-4">You have the right to access, correct, or delete your personal information. You can also opt out of receiving marketing communications from us at any time.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Security</h2>
          <p className="mb-4">We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Changes to This Privacy Policy</h2>
          <p className="mb-4">We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at:</p>
          <address className="not-italic">
            Awakening Classes<br />
            Jammu  , Jammu & Kashmir<br />
            Email: awakeningclasses1343@gmail.com<br />
           
          </address>
        </section>
      </main>

      <footer className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-4 md:mb-0">&copy; 2024 Awakening Classes. All rights reserved.</p>
            <nav>
              <ul className="flex space-x-4">
                <li><Link to="/terms" className="text-sm text-gray-400 hover:text-gray-300">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-sm text-gray-400 hover:text-gray-300">Privacy Policy</Link></li>
                <li><Link to="/contact" className="text-sm text-gray-400 hover:text-gray-300">Contact Us</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}