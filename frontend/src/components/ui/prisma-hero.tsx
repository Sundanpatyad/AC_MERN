import { motion, useInView, useReducedMotion } from "framer-motion";
import { ClipboardCheck, Youtube } from "lucide-react";
import { useRef } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

const CREAM = "#E1E0CC";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";
const POSTER_SRC = "https://picsum.photos/seed/awakening-exam-hall/1920/1080";

/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: CSSProperties;
}

export const WordsPullUp = ({
  text,
  className = "",
  showAsterisk = false,
  style,
}: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={`${word}-${i}`}
            initial={reduceMotion ? false : { y: 20, opacity: 0 }}
            animate={isInView || reduceMotion ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
            className="inline-block relative"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ---------------- WordsPullUpMultiStyle ---------------- */
interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  style?: CSSProperties;
}

export const WordsPullUpMultiStyle = ({
  segments,
  className = "",
  style,
}: WordsPullUpMultiStyleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();

  const words: { word: string; className?: string }[] = [];
  segments.forEach((seg) => {
    seg.text.split(" ").forEach((w) => {
      if (w) words.push({ word: w, className: seg.className });
    });
  });

  return (
    <div
      ref={ref}
      className={`inline-flex flex-wrap justify-center ${className}`}
      style={style}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w.word}-${i}`}
          initial={reduceMotion ? false : { y: 20, opacity: 0 }}
          animate={isInView || reduceMotion ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
          className={`inline-block ${w.className ?? ""}`}
          style={{ marginRight: "0.25em" }}
        >
          {w.word}
        </motion.span>
      ))}
    </div>
  );
};

/* ---------------- Hero ---------------- */
const LETTERS = ["A", "C"] as const;

const YOUTUBE_URL = "https://www.youtube.com/@awakeningclasses";

const PrismaHero = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={POSTER_SRC}
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEO_SRC}
      />

      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.55] mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,9,6,0.55)_0%,transparent_28%,transparent_52%,rgba(10,9,6,0.72)_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[58%] bg-[linear-gradient(90deg,rgba(10,9,6,0.55)_0%,transparent_100%)]" />

      <div className="absolute inset-0 flex items-end px-5 pb-10 sm:px-8 md:px-12 md:pb-14 lg:px-16">
        <div className="flex w-full max-w-xl flex-col items-start">
          <h1
            className="flex font-medium uppercase leading-none tracking-[-0.07em] text-[28vw] sm:text-[22vw] md:text-[18vw] lg:text-[15vw] xl:text-[13rem]"
            style={{ color: CREAM, textShadow: "0 12px 48px rgba(0,0,0,0.35)" }}
          >
            {LETTERS.map((letter, i) => (
              <span key={letter} className="inline-block overflow-hidden pb-1">
                <motion.span
                  initial={reduceMotion ? false : { y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, delay: 0.08 + i * 0.12, ease: EASE }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={reduceMotion ? false : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.42, ease: EASE }}
            className="mt-1 text-[13px] font-medium lowercase tracking-[0.28em] sm:text-sm md:text-base"
            style={{ color: CREAM }}
          >
            awakening classes
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.58, ease: EASE }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/mocktest"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#E1E0CC] px-5 py-3 text-sm font-semibold text-[#14130F] shadow-[0_10px_28px_rgba(0,0,0,0.45)] transition-transform active:scale-[0.98] hover:bg-[#f0efde] sm:text-base"
            >
              <ClipboardCheck className="h-4 w-4" strokeWidth={2.25} />
              Mocktest
            </Link>

            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#14130F] px-5 py-3 text-sm font-semibold text-[#E1E0CC] shadow-[0_10px_28px_rgba(0,0,0,0.45)] ring-1 ring-[#E1E0CC]/35 transition-transform active:scale-[0.98] hover:bg-[#1c1b16] sm:text-base"
            >
              <Youtube className="h-4 w-4 text-[#ff3b3b]" strokeWidth={2.25} />
              YouTube
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export { PrismaHero };
