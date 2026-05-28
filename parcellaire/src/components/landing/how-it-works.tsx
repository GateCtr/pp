import { StepCollectIllustration, StepValidateIllustration, StepPlaqueIllustration } from "./illustrations/step-illustrations";

const steps = [
  {
    number: "01",
    title: "Collecte sur le Terrain",
    description: "L'agent collecteur se rend sur la parcelle, ouvre l'application sur son smartphone et remplit le formulaire structuré : localisation, propriétaire, ménages, caractéristiques du bâti.",
    illustration: StepCollectIllustration,
    accent: "blue",
  },
  {
    number: "02",
    title: "Validation Administrative",
    description: "La fiche soumise apparaît en brouillon. L'administrateur vérifie la cohérence des données, peut demander des corrections ou valider la parcelle pour génération.",
    illustration: StepValidateIllustration,
    accent: "amber",
  },
  {
    number: "03",
    title: "Plaque & QR Code",
    description: "Dès validation, une plaque parcellaire officielle est automatiquement générée avec un QR Code unique. Tout citoyen peut scanner et vérifier les informations.",
    illustration: StepPlaqueIllustration,
    accent: "emerald",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="etapes" className="container mx-auto px-4 sm:px-6 py-20">
      <div className="text-center mb-16 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
          <span className="text-blue-300/80 text-xs font-medium">Processus</span>
        </div>
        <h3 className="text-2xl sm:text-4xl font-bold text-white mb-4">
          De la parcelle à la plaque<br />
          <span className="text-gradient">en 3 étapes simples</span>
        </h3>
        <p className="text-blue-200/60 max-w-lg mx-auto text-sm sm:text-base">
          Un processus clair et traçable, du terrain jusqu&apos;à la plaque officielle
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-16 lg:space-y-24">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex flex-col ${i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-8 lg:gap-16`}
          >
            {/* Illustration */}
            <div className="flex-1 w-full max-w-md">
              <div className="relative p-6 rounded-3xl bg-white/[0.03] border border-white/10">
                <step.illustration />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-${step.accent}-500/10 border border-${step.accent}-500/20 mb-4`}>
                <span className={`text-${step.accent}-400 font-bold text-lg`}>{step.number}</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-3">{step.title}</h4>
              <p className="text-blue-200/70 text-sm sm:text-base leading-relaxed max-w-md">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
