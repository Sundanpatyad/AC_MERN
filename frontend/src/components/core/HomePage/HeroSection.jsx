import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useSelector } from "react-redux";
import { FaYoutube } from "react-icons/fa";
import { ArrowRight, Play } from "lucide-react";
import { apiConnector } from "../../../services/apiConnector";
import { youtubeEndpoints } from "../../../services/apis";

const EASE = [0.16, 1, 0.3, 1];

const FALLBACK_VIDEOS = [
  {
    id: "Kyu0WStcnAs",
    title: "Articles | General English | Marathon | JKSSB",
    thumbnail: "https://i.ytimg.com/vi/Kyu0WStcnAs/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=Kyu0WStcnAs",
  },
  {
    id: "9XuMWYgg5as",
    title: "Input & Output devices | Marathon Session | Latest PYQs | JKSSB",
    thumbnail: "https://i.ytimg.com/vi/9XuMWYgg5as/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=9XuMWYgg5as",
  },
  {
    id: "SBYBCQYsPog",
    title: "JKSSB Finance Account Assistant | Revision Plan",
    thumbnail: "https://i.ytimg.com/vi/SBYBCQYsPog/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=SBYBCQYsPog",
  },
];

function LectureStack() {
  const reduceMotion = useReducedMotion();
  const [videos, setVideos] = useState(FALLBACK_VIDEOS);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiConnector("GET", `${youtubeEndpoints.VIDEOS}?limit=3`)
      .then((response) => {
        if (cancelled) return;
        const latest = (response.data?.videos || []).filter((item) => item?.id).slice(0, 3);
        if (latest.length) setVideos(latest);
      })
      .catch(() => {
        // Keep FALLBACK_VIDEOS already in state
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const count = videos.length;

  useEffect(() => {
    if (playing || count < 2) return undefined;
    const id = setInterval(() => {
      setActive((current) => (current + 1) % count);
    }, 4200);
    return () => clearInterval(id);
  }, [playing, count]);

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="pt-16"
      >
        <div className="relative aspect-video">
          {count === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-line bg-surface text-sm text-muted">
              Loading lectures…
            </div>
          ) : (
            videos.map((video, index) => {
              const depth = (index - active + count) % count;
              const isFront = depth === 0;
              return (
                <motion.div
                  key={video.id}
                  className="absolute inset-0 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_50px_-28px_rgba(0,0,0,0.55)]"
                  style={{ zIndex: 20 - depth, transformOrigin: "center top" }}
                  animate={{
                    y: depth * -28,
                    scale: 1 - depth * 0.04,
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.45, ease: EASE }}
                >
                  {isFront && playing ? (
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (isFront) setPlaying(true);
                        else {
                          setActive(index);
                          setPlaying(false);
                        }
                      }}
                      className="group absolute inset-0 block h-full w-full text-left"
                      aria-label={isFront ? `Play ${video.title}` : `Show ${video.title}`}
                    >
                      <img src={video.thumbnail} alt="" className="h-full w-full object-cover" />
                      <span className={`absolute inset-0 ${isFront ? "bg-black/20 group-hover:bg-black/30" : "bg-black/45"}`} />
                      {isFront && (
                        <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-solid text-solid-fg">
                          <Play size={22} className="ml-0.5" fill="currentColor" />
                        </span>
                      )}
                    </button>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

      </motion.div>
    </div>
  );
}

const HeroSection = () => {
  const { token } = useSelector((state) => state.auth);
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative flex w-full items-start overflow-hidden bg-page lg:min-h-[100dvh] lg:items-center">
      <div className="page-shell relative z-[1] w-full pb-8 pt-24 md:pb-12 md:pt-28 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8 xl:gap-14">
          <div className="space-y-6 text-center md:space-y-7 lg:text-left">
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.04, ease: EASE }}
              className="text-[2.35rem] font-semibold leading-[1.06] tracking-tight text-fg sm:text-5xl md:text-[3.4rem]"
            >
              Prepare with purpose.
              <br />
              <span className="font-medium text-muted">Succeed with clarity.</span>
            </motion.h1>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
              className="mx-auto max-w-[38ch] text-base leading-relaxed text-muted md:text-lg lg:mx-0"
            >
              Exam-style mocks, instant feedback, and a clearer next attempt.
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
              className="flex flex-col justify-center gap-3 pt-1 sm:flex-row lg:justify-start"
            >
              {token ? (
                <>
                  <Link to="/dashboard/enrolled-courses" className="btn-primary">
                    My courses
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="https://www.youtube.com/@awakeningclasses"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    <FaYoutube size={16} className="text-brand" />
                    Lectures
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="btn-primary">
                    Get started
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/mocktest" className="btn-secondary">
                    Browse tests
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          <div className="w-full pb-2 lg:pb-0">
            <LectureStack />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
