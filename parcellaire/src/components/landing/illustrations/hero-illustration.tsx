export function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md">
      {/* Phone mockup */}
      <div className="relative mx-auto w-64 h-[480px] rounded-[2.5rem] border-4 border-white/20 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl shadow-blue-500/10 overflow-hidden">
        {/* Screen notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />

        {/* Screen content */}
        <div className="absolute inset-2 rounded-[2rem] bg-gradient-to-b from-blue-950 to-indigo-950 overflow-hidden">
          {/* App header */}
          <div className="px-4 pt-10 pb-3 flex items-center gap-2 border-b border-white/10">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-white text-xs font-semibold">Lopango</span>
          </div>

          {/* Form preview */}
          <div className="p-4 space-y-3">
            <div className="text-white/80 text-[10px] font-medium mb-2">Nouvelle Parcelle</div>

            {/* Input fields mockup */}
            <div className="h-7 rounded-lg bg-white/10 border border-white/10 flex items-center px-3">
              <span className="text-blue-300/50 text-[9px]">Province</span>
            </div>
            <div className="h-7 rounded-lg bg-white/10 border border-white/10 flex items-center px-3">
              <span className="text-blue-300/50 text-[9px]">Commune</span>
            </div>
            <div className="h-7 rounded-lg bg-white/10 border border-white/10 flex items-center px-3">
              <span className="text-blue-300/50 text-[9px]">N° Avenue / Rue</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-7 rounded-lg bg-white/10 border border-white/10 flex items-center px-3">
                <span className="text-blue-300/50 text-[9px]">Quartier</span>
              </div>
              <div className="h-7 rounded-lg bg-white/10 border border-white/10 flex items-center px-3">
                <span className="text-blue-300/50 text-[9px]">N° Parcelle</span>
              </div>
            </div>

            {/* Button */}
            <div className="h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mt-4">
              <span className="text-white text-[10px] font-medium">Soumettre la Fiche</span>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="absolute bottom-0 inset-x-0 h-12 border-t border-white/10 bg-slate-900/80 backdrop-blur flex items-center justify-around px-4">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
            </div>
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
              <div className="w-3 h-3 rounded bg-white/30" />
            </div>
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
              <div className="w-3 h-3 rounded bg-white/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-500/10 border border-emerald-400/20 backdrop-blur-sm flex items-center justify-center animate-float">
        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
        </svg>
      </div>

      <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-400/20 backdrop-blur-sm flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
        <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  );
}
