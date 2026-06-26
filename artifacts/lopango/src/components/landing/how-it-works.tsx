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
      <svg viewBox="0 0 360 240" fill="none" className="w-full max-w-[340px]">
        {/* Plaque */}
        <rect x="10" y="10" width="340" height="130" rx={rx} fill={v.borderColor} />
        <rect x="14" y="14" width="332" height="122" rx={String(Math.max(0, Number(rx) - 2))} fill={v.bgColor} />

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
        <text x="180" y="44" textAnchor="middle" fill={v.textColor} fontSize="11" fontWeight="bold" fontFamily={v.fontFamily}>MATADI</text>
        <text x="180" y="62" textAnchor="middle" fill={v.accentColor} fontSize="7" fontWeight="bold" fontFamily={v.fontFamily}>QUARTIER MVUZI</text>

        {/* Avenue band */}
        <rect x="20" y="68" width="320" height="26" rx="3" fill={v.borderColor} opacity="0.12" />
        <text x="180" y="85" textAnchor="middle" fill={v.textColor} fontSize="11" fontWeight="bold" fontFamily={v.fontFamily}>AVENUE DE L&apos;INDÉPENDANCE</text>

        {/* ── Bottom section: N° centré + QR aligné même ligne à droite ── */}
        {/* N° — centré pleine largeur, baseline y=122, centre visuel ~y=109 */}
        <text x="180" y="122" textAnchor="middle" fill={v.accentColor} fontSize="26" fontWeight="bold" fontFamily={v.fontFamily}>N° 6</text>

        {/* QR — 26×26, droite, y=102 → y=128, centre vertical=115 ≈ centre N° */}
        <rect x="316" y="102" width="26" height="26" rx="2" fill="white" />
        {/* TL corner */}
        <rect x="319" y="105" width="5" height="5" rx="1" fill="none" stroke="#1e293b" strokeWidth="1" />
        <rect x="320" y="106" width="3" height="3" fill="#1e293b" />
        {/* TR corner */}
        <rect x="334" y="105" width="5" height="5" rx="1" fill="none" stroke="#1e293b" strokeWidth="1" />
        <rect x="335" y="106" width="3" height="3" fill="#1e293b" />
        {/* BL corner */}
        <rect x="319" y="120" width="5" height="5" rx="1" fill="none" stroke="#1e293b" strokeWidth="1" />
        <rect x="320" y="121" width="3" height="3" fill="#1e293b" />
        {/* Seal in QR center */}
        <clipPath id="step3qrSeal">
          <circle cx="329" cy="115" r="3.5" />
        </clipPath>
        {sealUrl ? (
          <image href={sealUrl} x="325.5" y="111.5" width="7" height="7" clipPath="url(#step3qrSeal)" preserveAspectRatio="xMidYMid slice" />
        ) : (
          <circle cx="329" cy="115" r="3.5" fill="#f0f0f0" stroke="#ddd" strokeWidth="0.5" />
        )}

        {/* ===== Phone scanning animation ===== */}
        <rect x="230" y="160" width="56" height="70" rx="10" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        <rect x="235" y="167" width="46" height="56" rx="6" fill="#0f172a" />
        {/* Camera viewfinder corners */}
        <path d="M242 173 L242 177 L246 177" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M274 173 L274 177 L270 177" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M242 217 L242 213 L246 213" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M274 217 L274 213 L270 213" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Animated scan line */}
        <line x1="244" y1="195" x2="272" y2="195" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
          <animate attributeName="y1" values="175;215;175" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y2" values="175;215;175" dur="2s" repeatCount="indefinite" />
        </line>

        {/* Arrow from QR bottom to phone */}
        <path d="M329 128 C329 146, 284 154, 266 158" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" fill="none" opacity="0.6" />

        {/* Checkmark badge */}
        <circle cx="60" cy="185" r="18" fill="#10b98120" stroke="#10b981" strokeWidth="1.5" />
        <path d="M51 185l6 6 12-12" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="60" y="210" textAnchor="middle" fill="#10b981" fontSize="6" fontWeight="medium">Vérifié</text>
      </svg>
    </div>
  );
}
