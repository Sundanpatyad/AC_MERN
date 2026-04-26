import React from 'react'
import YourComponent from '../../ui/InitialLoader'

const InstructorSection = () => {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 right-0 w-[40%] h-[60%] bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Divider */}
        <div className="w-full h-px bg-white/[0.05] mb-24" />

        <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-32">

          {/* Loader / Animation */}
          <div className="flex-1 flex justify-center w-full">
            <div className="relative w-full max-w-md aspect-square glass rounded-[3rem] flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
              <YourComponent />
              
              {/* Decorative rings */}
              <div className="absolute inset-8 border border-white/[0.03] rounded-[2.5rem] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-16 border border-white/[0.02] rounded-[2rem] pointer-events-none group-hover:scale-125 transition-transform duration-700 delay-75" />
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-[10px] font-bold uppercase tracking-widest text-white/50">
                Ready to excel?
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
                Master Your Future<br />
                <span className="text-white/40 font-light italic">Start your journey today</span>
              </h2>
            </div>
            
            <p className="text-lg text-white/40 leading-relaxed max-w-md mx-auto lg:mx-0 font-light">
              Don't just study, prepare with purpose. Our mock tests are meticulously crafted to provide the most authentic exam experience.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
               <div className="px-6 py-3 rounded-2xl glass text-sm font-medium text-white/60">Real-time Analytics</div>
               <div className="px-6 py-3 rounded-2xl glass text-sm font-medium text-white/60">Expert Curated</div>
               <div className="px-6 py-3 rounded-2xl glass text-sm font-medium text-white/60">Mobile Ready</div>
            </div>
          </div>

        </div>

        {/* Brand tagline */}
        <div className="mt-32 text-center relative">
          <div className="absolute inset-0 flex items-center justify-center blur-3xl opacity-20 pointer-events-none">
             <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase select-none">
                Awakening
             </h2>
          </div>
          <h2 className="relative text-6xl md:text-9xl lg:text-[10rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white/[0.08] to-transparent tracking-tighter select-none leading-none">
            AWAKENING
          </h2>
        </div>

      </div>
    </section>
  )
}

export default InstructorSection
