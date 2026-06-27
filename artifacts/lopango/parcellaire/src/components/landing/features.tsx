import { Smartphone, Wifi, Shield, QrCode, MapPin, Users } from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Collecte Mobile",
    description: "Formulaire multi-étapes optimisé pour smartphone. Les agents collectent directement sur le terrain.",
    gradient: "from-blue-400/20 to-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    icon: Wifi,
    title: "Mode Hors-ligne",
    description: "Application PWA fonctionnelle sans connexion internet. Les données se synchronisent automatiquement.",
    gradient: "from-emerald-400/20 to-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    icon: QrCode,
    title: "Plaques QR Code",
    description: "Génération automatique de plaques parcellaires avec QR Code pour vérification instantanée.",
    gradient: "from-violet-400/20 to-violet-500/10",
    iconColor: "text-violet-400",
  },
  {
    icon: Shield,
    title: "Données Sécurisées",
    description: "Double authentification admin/collecteur. Chaque fiche est vérifiée avant validation officielle.",
    gradient: "from-amber-400/20 to-amber-500/10",
    iconColor: "text-amber-400",
  },
  {
    icon: MapPin,
    title: "Géolocalisation",
    description: "Localisation précise de chaque parcelle avec coordonnées GPS intégrées au formulaire.",
    gradient: "from-rose-400/20 to-rose-500/10",
    iconColor: "text-rose-400",
  },
  {
    icon: Users,
    title: "Multi-ménages",
    description: "Jusqu'à 10 ménages enregistrés par parcelle avec informations détaillées de chaque occupant.",
    gradient: "from-cyan-400/20 to-cyan-500/10",
    iconColor: "text-cyan-400",
  },
];

export function LandingFeatures() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-20">
      <div className="text-center mb-14 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
          <span className="text-blue-300/80 text-xs font-medium">Fonctionnalités</span>
        </div>
        <h3 className="text-2xl sm:text-4xl font-bold text-white mb-4">
          Tout ce qu&apos;il faut pour<br />
          <span className="text-gradient">la cartographie terrain</span>
        </h3>
        <p className="text-blue-200/60 max-w-lg mx-auto text-sm sm:text-base">
          Une solution complète pensée pour les réalités du terrain en RDC
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto stagger-children">
        {features.map((feature, i) => (
          <div
            key={i}
            className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
            </div>
            <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
            <p className="text-blue-200/60 text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
