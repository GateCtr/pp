const testimonials = [
  {
    quote:
      "Avant, je remplissais des formulaires papier qui se perdaient. Maintenant tout est sur mon téléphone, même sans internet. Un gain de temps incroyable.",
    name: "Agent Mbemba",
    role: "Collecteur terrain — Matadi",
    avatar: "AM",
  },
  {
    quote:
      "La validation est instantanée. Je vois les fiches arriver en temps réel et je peux vérifier les données directement. Plus de dossiers qui traînent.",
    name: "Chef de Bureau Kalala",
    role: "Administrateur — Commune de Mbanza-Ngungu",
    avatar: "CK",
  },
  {
    quote:
      "Le QR Code sur la plaque permet à tout le monde de vérifier. C'est transparent, c'est moderne, et ça rassure les propriétaires.",
    name: "Mme Lukusa",
    role: "Propriétaire parcellaire — Boma",
    avatar: "ML",
  },
];

export function LandingTestimonials() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-20">
      <div className="text-center mb-14 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
          <span className="text-blue-300/80 text-xs font-medium">Témoignages</span>
        </div>
        <h3 className="text-2xl sm:text-4xl font-bold text-white mb-4">
          Ce qu&apos;ils en disent
        </h3>
        <p className="text-blue-200/60 max-w-lg mx-auto text-sm sm:text-base">
          Des retours du terrain qui confirment l&apos;impact de la digitalisation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto stagger-children">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
          >
            {/* Quote mark */}
            <div className="text-4xl text-blue-500/20 font-serif leading-none mb-3">&ldquo;</div>

            <p className="text-blue-200/70 text-sm leading-relaxed mb-6">
              {t.quote}
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{t.avatar}</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{t.name}</p>
                <p className="text-blue-300/50 text-xs">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
