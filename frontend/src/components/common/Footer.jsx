import React from "react";
import { Link } from "react-router-dom";
import { FaTelegram, FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa";
import rzpLogo from "../../assets/Logo/logo.png";

const socials = [
  { href: "https://www.youtube.com/@awakeningclasses", label: "YouTube", Icon: FaYoutube },
  { href: "https://t.me/awakeningclasses3103", label: "Telegram", Icon: FaTelegram },
  { href: "https://www.instagram.com/awakeningclasses", label: "Instagram", Icon: FaInstagram },
  { href: "https://whatsapp.com/channel/0029Van0bFDDDmFZjhOoX03N", label: "WhatsApp", Icon: FaWhatsapp },
];

const Footer = () => {
  return (
    <footer className="border-t border-line bg-page pb-24 md:pb-10">
      <div className="page-shell py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img src={rzpLogo} alt="" className="w-8 h-8 rounded-full" />
              <span className="font-semibold text-fg tracking-tight">Awakening Classes</span>
            </Link>
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              Coaching and mock tests for competitive exam preparation.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-muted hover:text-fg hover:bg-elevated transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-fg mb-3">Company</h3>
            <div className="flex flex-col gap-2.5">
              <Link to="/about" className="text-sm text-muted hover:text-fg transition-colors">About</Link>
              <Link to="/contact" className="text-sm text-muted hover:text-fg transition-colors">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-fg mb-3">Learn</h3>
            <div className="flex flex-col gap-2.5">
              <Link to="/catalog/all-courses" className="text-sm text-muted hover:text-fg transition-colors">Courses</Link>
              <Link to="/mocktest" className="text-sm text-muted hover:text-fg transition-colors">Mock Tests</Link>
              <Link to="/exams" className="text-sm text-muted hover:text-fg transition-colors">Free PDF</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-fg mb-3">Legal</h3>
            <div className="flex flex-col gap-2.5">
              <Link to="/privacy-policy" className="text-sm text-muted hover:text-fg transition-colors">Privacy</Link>
              <Link to="/terms" className="text-sm text-muted hover:text-fg transition-colors">Terms</Link>
              <Link to="/cookie-policy" className="text-sm text-muted hover:text-fg transition-colors">Cookies</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-xs text-subtle">
            © {new Date().getFullYear()} Awakening Classes. All rights reserved.
          </p>
          <p className="text-xs text-subtle">
            Built by{" "}
            <a
              href="https://github.com/Sundanpatyad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-fg transition-colors"
            >
              Sundan Sharma
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
