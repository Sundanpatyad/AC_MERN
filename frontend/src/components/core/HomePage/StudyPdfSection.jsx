import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { apiConnector } from "../../../services/apiConnector";
import { pdfEndpoints } from "../../../services/apis";

const Skeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[16/10] rounded-xl bg-elevated" />
    <div className="mt-3 h-4 w-3/4 rounded-md bg-elevated" />
    <div className="mt-2 h-3 w-1/3 rounded-md bg-elevated" />
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="rounded-2xl bg-surface py-16 text-center">
            <p className="text-sm text-muted">No study material available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {exams.map((exam) => {
              const price = exam.access === "paid" && exam.price ? `₹${exam.price}` : "Free";
              return (
                <Link
                  key={exam._id}
                  to={`/study-material?exam=${exam._id}`}
                  className="group flex flex-col rounded-2xl border border-line bg-surface p-5"
                >
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">
                    {exam.category}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-fg">
                    {exam.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {exam.pdfCount} PDF{exam.pdfCount === 1 ? "" : "s"}
                    {" · "}
                    {price}
                  </p>
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
