import React from 'react';
import { Link } from 'react-router-dom';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">This Cookie Policy explains how Awakening Classes uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. What are cookies?</h2>
          <p className="mb-4">Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Why do we use cookies?</h2>
          <p className="mb-4">We use cookies for the following purposes:</p>
          <ul className="list-disc list-inside mb-4">
            <li>To enable certain functions of the website</li>
            <li>To provide analytics</li>
            <li>To store your preferences</li>
            <li>To enable advertisements delivery, including behavioral advertising</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. What cookies do we use?</h2>
          <p className="mb-4">We use the following types of cookies:</p>
          <ul className="list-disc list-inside mb-4">
            <li>Essential cookies</li>
            <li>Analytical/performance cookies</li>
            <li>Functionality cookies</li>
            <li>Targeting cookies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. How to control cookies</h2>
          <p className="mb-4">You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Changes to this Cookie Policy</h2>
          <p className="mb-4">We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please check back periodically for updates.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Contact us</h2>
          <address className="not-italic mb-4">
            Awakening Classes<br />
            Jammu, Jammu & Kashmir<br />
            Email: awakeningclasses1343@gmail.com
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
  );
}