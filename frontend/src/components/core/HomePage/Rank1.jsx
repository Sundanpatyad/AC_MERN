import { Play } from 'lucide-react'
import rank from '../../../assets/Logo/rank1.png'

export default function RankOneStoryBlack() {
  return (
    <section className="section-pad border-t border-line bg-page">
      <div className="page-shell">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <a
            href="https://youtu.be/zZqPFZo8IUo?si=MbeDgOr_YtO9bH_x"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block w-full max-w-xl mx-auto lg:mx-0"
          >
            <div className="relative rounded-2xl overflow-hidden bg-surface aspect-video">
              <img
                src={rank}
                alt="Rank 1 JKSSB Patwari Exam 2024"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-solid flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105">
                  <Play className="w-5 h-5 text-solid-fg fill-current ml-0.5" />
                </div>
              </div>
            </div>
          </a>

          <div className="space-y-5 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-semibold text-fg tracking-tight leading-tight">
              Rank 1 in JKSSB 2024
            </h2>
            <p className="text-base text-muted leading-relaxed max-w-md mx-auto lg:mx-0">
              Hear how one of our students secured the top rank in the JKSSB Patwari exam through focused practice.
            </p>
            <a
              href="https://youtu.be/zZqPFZo8IUo?si=MbeDgOr_YtO9bH_x"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex"
            >
              Watch interview
              <Play size={14} className="fill-current" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
