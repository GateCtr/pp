import { db } from "@/db";
import { plateTemplates } from "@/db/schema";
import { desc } from "drizzle-orm";
import type { VariantDesign } from "@/db/schema";
import { StepCollectIllustration, StepValidateIllustration } from "./illustrations/step-illustrations";

export async function LandingHowItWorks() {
  // Fetch first template for step 3 illustration
  const [template] = await db
    .select()
    .from(plateTemplates)
    .orderBy(desc(plateTemplates.creeLe))
    .limit(1);

  let variant: VariantDesign | null = null;
  let flagUrl: string | null = null;
  let sealUrl: string | null = null;

  if (template) {
    const variants = (typeof template.variants === "string"
      ? JSON.parse(template.variants)
      : template.variants) as VariantDesign[];
    if (variants.length > 0) {
      variant = variants[0];
      flagUrl = template.flagUrl;
      sealUrl = template.sealUrl;
    }
  }

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
        {/* Step 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="flex-1 w-full max-w-md">
            <div className="relative p-6 rounded-3xl bg-white/[0.03] border border-white/10">
              <StepCollectIllustration />
            </div>
          </div>
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
              <span className="text-blue-400 font-bold text-lg">01</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-3">Collecte sur le Terrain</h4>
            <p className="text-blue-200/70 text-sm sm:text-base leading-relaxed max-w-md">
              L&apos;agent collecteur se rend sur la parcelle, ouvre l&apos;application sur son smartphone et remplit le formulaire structuré : localisation, propriétaire, ménages, caractéristiques du bâti.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
          <div className="flex-1 w-full max-w-md">
            <div className="relative p-6 rounded-3xl bg-white/[0.03] border border-white/10">
              <StepValidateIllustration />
            </div>
          </div>
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <span className="text-amber-400 font-bold text-lg">02</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-3">Validation & Vérification</h4>
            <p className="text-blue-200/70 text-sm sm:text-base leading-relaxed max-w-md">
              La fiche soumise est vérifiée pour cohérence des données. Les corrections sont demandées si nécessaire avant la validation finale de la parcelle.
            </p>
          </div>
        </div>

        {/* Step 3 — uses real template variant */}
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="flex-1 w-full max-w-md">
            <div className="relative p-6 rounded-3xl bg-white/[0.03] border border-white/10">
              <StepPlaqueFromTemplate variant={variant} flagUrl={flagUrl} sealUrl={sealUrl} />
            </div>
          </div>
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <span className="text-emerald-400 font-bold text-lg">03</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-3">Plaque & QR Code</h4>
            <p className="text-blue-200/70 text-sm sm:text-base leading-relaxed max-w-md">
              Une fois validée, la plaque officielle est générée avec un QR Code unique intégrant le sceau communal. Tout citoyen peut scanner et vérifier les informations de la parcelle.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Step 3 illustration using real template variant
function StepPlaqueFromTemplate({ variant, flagUrl, sealUrl }: {
  variant: VariantDesign | null;
  flagUrl: string | null;
  sealUrl: string | null;
}) {
  // Default fallback if no template exists
  const v = variant || {
    bgColor: "#1a3a7a",
    borderColor: "#ffffff",
    textColor: "#ffffff",
    accentColor: "#87CEEB",
    fontFamily: "Arial, sans-serif",
    shape: "rounded" as const,
    name: "Standard",
  };

  const rx = v.shape === "rectangle" ? "4" : v.shape === "rounded" ? "10" : "18";

  return (
    <div className="flex items-center justify-center py-2">
      <svg viewBox="0 0 360 200" fill="none" className="w-full max-w-[340px]">
        {/* Plaque */}
        <rect x="10" y="10" width="340" height="170" rx={rx} fill={v.borderColor} />
        <rect x="14" y="14" width="332" height="162" rx={String(Math.max(0, Number(rx) - 2))} fill={v.bgColor} />

        {/* Flag */}
        {flagUrl ? (
          <image href={flagUrl} x="24" y="22" width="40" height="28" preserveAspectRatio="xMidYMid meet" />
        ) : (
          <>
            <rect x="24" y="22" width="40" height="28" rx="2" fill="#007FFF" />
            <line x1="24" y1="22" x2="64" y2="50" stroke="#CE1021" strokeWidth="3.5" />
            <polygon points="34,27 36,32 41,32 37,35 38,40 34,37 30,40 31,35 27,32 32,32" fill="#F7D618" />
          </>
        )}

        {/* Seal */}
        <clipPath id="step3seal">
          <circle cx="320" cy="36" r="14" />
        </clipPath>
        {sealUrl ? (
          <image href={sealUrl} x="306" y="22" width="28" height="28" clipPath="url(#step3seal)" preserveAspectRatio="xMidYMid slice" />
        ) : (
          <circle cx="320" cy="36" r="14" fill="none" stroke={v.borderColor} strokeWidth="1" opacity="0.5" />
        )}

        {/* Text */}
        <text x="180" y="30" textAnchor="middle" fill={v.accentColor} fontSize="6" fontFamily={v.fontFamily}>COMMUNE DE</text>
        <text x="180" y="44" textAnchor="middle" fill={v.textColor} fontSize="11" fontWeight="bold" fontFamily={v.fontFamily}>NGIRI NGIRI</text>
        <text x="180" y="62" textAnchor="middle" fill={v.accentColor} fontSize="7" fontWeight="bold" fontFamily={v.fontFamily}>QUARTIER ELENGESA</text>

        {/* Avenue band */}
        <rect x="20" y="68" width="320" height="26" rx="3" fill={v.borderColor} opacity="0.12" />
        <text x="180" y="85" textAnchor="middle" fill={v.textColor} fontSize="11" fontWeight="bold" fontFamily={v.fontFamily}>AVENUE ELENGESA</text>

        {/* N° */}
        <text x="130" y="140" textAnchor="middle" fill={v.accentColor} fontSize="30" fontWeight="bold" fontFamily={v.fontFamily}>N° 6</text>

        {/* QR */}
        <rect x="270" y="102" width="52" height="52" rx="4" fill="white" />
        <rect x="275" y="107" width="9" height="9" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="277" y="109" width="5" height="5" fill="#1e293b" />
        <rect x="308" y="107" width="9" height="9" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="310" y="109" width="5" height="5" fill="#1e293b" />
        <rect x="275" y="138" width="9" height="9" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="277" y="140" width="5" height="5" fill="#1e293b" />
        {/* Seal in QR center */}
        <clipPath id="step3qrSeal">
          <circle cx="296" cy="128" r="7" />
        </clipPath>
        {sealUrl ? (
          <image href={sealUrl} x="289" y="121" width="14" height="14" clipPath="url(#step3qrSeal)" preserveAspectRatio="xMidYMid slice" />
        ) : (
          <circle cx="296" cy="128" r="7" fill="#f0f0f0" stroke="#ddd" strokeWidth="0.5" />
        )}

        {/* Checkmark badge */}
        <circle cx="40" y="155" r="16" fill="#10b98120" stroke="#10b981" strokeWidth="1.5" />
        <path d="M32 155l5 5 10-10" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
