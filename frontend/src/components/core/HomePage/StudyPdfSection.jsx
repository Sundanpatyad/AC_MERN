import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { BiCheckCircle, BiLockAlt } from "react-icons/bi";
import { BsFiletypePdf } from "react-icons/bs";
import { apiConnector } from "../../../services/apiConnector";
import { pdfEndpoints } from "../../../services/apis";

const Skeleton = () => (
  <div className="overflow-hidden rounded-xl border border-line bg-surface animate-pulse">
    <div className="aspect-[16/10] bg-elevated" />
    <div className="space-y-2 p-4">
      <div className="h-3 w-1/3 rounded bg-elevated" />
      <div className="h-4 w-4/5 rounded bg-elevated" />
      <div className="h-3 w-1/2 rounded bg-elevated" />
    </div>
  </div>
);

const StudyPdfSection = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiConnector("GET", `${pdfEndpoints.EXAMS}?sort=latest`)
      .then((response) => {
        if (!cancelled) setExams((response.data?.data || []).slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setExams([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="border-t border-line bg-page pt-10 pb-16 md:pt-[5.5rem] md:pb-[5.5rem]">
      <div className="page-shell">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-fg md:text-4xl">
              Latest study material
            </h2>
            <p className="max-w-lg text-sm text-muted md:text-base">
              New papers for your exam, ready to read inside the library.
            </p>
          </div>
          <Link
            to="/study-material"
            className="inline-flex items-center gap-2 self-start text-sm font-medium text-muted transition-colors hover:text-fg sm:self-auto"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="rounded-2xl bg-surface py-16 text-center">
            <p className="text-sm text-muted">No study material available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {exams.map((exam) => {
              const locked = exam.access === "paid" && !exam.owned;
              return (
                <Link
                  key={exam._id}
                  to={`/study-material?exam=${exam._id}`}
                  className="group overflow-hidden rounded-xl border border-line bg-surface transition hover:border-fg/25 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-elevated">
                    {exam.thumbnail ? (
                      <img
                        src={exam.thumbnail}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-fg/55">
                        <BsFiletypePdf className="text-4xl sm:text-5xl" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                          Study pack
                        </span>
                      </div>
                    )}
                    <div className="absolute right-2 top-2">
                      {locked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                          <BiLockAlt size={12} />
                          ₹{exam.price}
                        </span>
                      ) : exam.access === "paid" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                          <BiCheckCircle size={12} />
                          Unlocked
                        </span>
                      ) : (
                        <span className="rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 p-3.5 sm:p-4">
                    <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                      {exam.category}
                    </p>
                    <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-fg">
                      {exam.name}
                    </h3>
                    <p className="text-xs text-muted">
                      {exam.pdfCount} PDF{exam.pdfCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default StudyPdfSection;
