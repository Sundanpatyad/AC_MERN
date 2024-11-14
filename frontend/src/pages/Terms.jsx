import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">Welcome to Awakening Classes. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our website, you agree to be bound by these Terms and our Privacy Policy.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Use of Our Services</h2>
          <p className="mb-4">You agree to use our services only for lawful purposes and in a way that does not infringe on the rights of others or restrict or inhibit anyone else's use and enjoyment of the services.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Intellectual Property</h2>
          <p className="mb-4">The content, organization, graphics, design, compilation, and other matters related to our website are protected under applicable copyrights, trademarks, and other proprietary rights. You may not modify, copy, distribute, transmit, display, reproduce, or create derivative works from the website.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Termination</h2>
          <p className="mb-4">We reserve the right to suspend or terminate your access to the services at any time for any reason, including if we reasonably believe you have violated these Terms.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Disclaimers</h2>
          <p className="mb-4">We provide our services "as is" and do not make any warranties or representations about the accuracy, completeness, or reliability of the information, services, or related graphics.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
          <p className="mb-4">In no event shall Awakening Classes be liable for any indirect, special, incidental, or consequential damages related to your use of our services.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Governing Law</h2>
          <p className="mb-4">These Terms and your use of our services shall be governed by and construed in accordance with the laws of Jammu & Kashmir, India.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Changes to These Terms</h2>
          <p className="mb-4">We may update these Terms from time to time. You should check this page periodically for changes. Your continued use of the services after any such changes constitutes your acceptance of the new Terms.</p>
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
  );
}