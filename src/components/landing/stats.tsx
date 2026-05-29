import { MapPin, Users, QrCode, Building2 } from "lucide-react";

const stats = [
  {
    icon: MapPin,
    value: "100%",
    label: "Digital",
    description: "Processus entièrement numérique",
    color: "blue",
  },
  {
    icon: Building2,
    value: "26",
    label: "Provinces",
    description: "Couverture nationale RDC",
    color: "indigo",
  },
  {
    icon: QrCode,
    value: "∞",
    label: "Plaques",
    description: "Génération illimitée",
    color: "emerald",
  },
  {
    icon: Users,
    value: "10",
    label: "Ménages/Parcelle",
    description: "Capacité multi-occupants",
    color: "amber",
  },
];

export function LandingStats() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 p-8 sm:p-12 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Conçu pour le terrain congolais
              </h3>
              <p className="text-blue-200/60 text-sm sm:text-base max-w-md mx-auto">
                Une solution adaptée aux réalités de la RDC : couverture réseau limitée,
                multiplicité des ménages, besoin de traçabilité
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-blue-200/80 text-sm font-medium">{stat.label}</p>
                  <p className="text-blue-300/40 text-xs mt-1">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
