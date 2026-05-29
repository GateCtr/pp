import { PlaqueCard } from "./illustrations/plaque-card";

const plaques = [
  {
    commune: "NGIRI NGIRI",
    quartier: "ELENGESA",
    avenue: "AVENUE ELENGESA",
    numero: "6",
  },
  {
    commune: "LEMBA",
    quartier: "RIGHINI",
    avenue: "AVENUE SHABA",
    numero: "42",
  },
  {
    commune: "KINTAMBO",
    quartier: "MAKELELE",
    avenue: "AVENUE KABINDA",
    numero: "15",
  },
  {
    commune: "MATETE",
    quartier: "TOMBA",
    avenue: "AVENUE KIKWIT",
    numero: "23",
  },
];

export function LandingGallery() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-20">
      <div className="text-center mb-14 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
          <span className="text-blue-300/80 text-xs font-medium">Templates & Variantes</span>
        </div>
        <h3 className="text-2xl sm:text-4xl font-bold text-white mb-4">
          Des plaques personnalisables<br />
          <span className="text-gradient">selon vos besoins</span>
        </h3>
        <p className="text-blue-200/60 max-w-lg mx-auto text-sm sm:text-base">
          L&apos;administrateur choisit un template et une variante pour chaque parcelle.
          Couleurs, polices et formes sont entièrement configurables.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto stagger-children">
        {plaques.map((plaque, i) => (
          <div
            key={i}
            className="group rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] p-4 transition-all duration-300"
          >
            <PlaqueCard {...plaque} />
          </div>
        ))}
      </div>
    </section>
  );
}
