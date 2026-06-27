import {
  LandingHeader,
  LandingHero,
  LandingFeatures,
  LandingStats,
  LandingHowItWorks,
  LandingGallery,
  LandingCTA,
  LandingFooter,
} from "@/components/landing";

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <LandingHeader />

      <main className="relative z-10">
        <LandingHero />
        <LandingStats />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingGallery />
        <LandingCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
