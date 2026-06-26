import { db } from "@/db";
import { plateTemplates } from "@/db/schema";
import { desc } from "drizzle-orm";
import type { VariantDesign } from "@/db/schema";

// Server component — fetches real templates from DB
export async function LandingGallery() {
  const templates = await db
    .select()
    .from(plateTemplates)
    .orderBy(desc(plateTemplates.creeLe))
    .limit(5);

  // Collect all variants from all templates
  const allVariants: { commune: string; quartier: string; avenue: string; numero: string; variant: VariantDesign; flagUrl: string | null; sealUrl: string | null }[] = [];

  const sampleData = [
    { commune: "MATADI", quartier: "MVUZI", avenue: "AVENUE DE L'INDÉPENDANCE", numero: "6" },
    { commune: "BOMA", quartier: "KALAMU", avenue: "AVENUE DU FLEUVE CONGO", numero: "42" },
    { commune: "MBANZA-NGUNGU", quartier: "NZANZA", avenue: "AVENUE LUFIMI", numero: "15" },
    { commune: "LUKULA", quartier: "NTOMBO", avenue: "AVENUE NZINGA", numero: "23" },
    { commune: "KINZADI", quartier: "SOYO", avenue: "AVENUE PATRICE LUMUMBA", numero: "8" },
  ];

  let dataIndex = 0;
  for (const template of templates) {
    const variants = (typeof template.variants === "string"
      ? JSON.parse(template.variants)
      : template.variants) as VariantDesign[];

    for (const variant of variants) {
      allVariants.push({
        ...sampleData[dataIndex % sampleData.length],
        variant,
        flagUrl: template.flagUrl,
        sealUrl: template.sealUrl,
      });
      dataIndex++;
    }
  }

  // If no templates exist, show default examples
  if (allVariants.length === 0) {
    const defaultVariants: VariantDesign[] = [
      { name: "Standard", bgColor: "#1a3a7a", borderColor: "#ffffff", textColor: "#ffffff", accentColor: "#87CEEB", fontFamily: "Arial, sans-serif", shape: "rounded" },
      { name: "Vert", bgColor: "#1b5e20", borderColor: "#e8f5e9", textColor: "#ffffff", accentColor: "#a5d6a7", fontFamily: "Arial, sans-serif", shape: "rounded" },
      { name: "Violet", bgColor: "#4a148c", borderColor: "#f3e5f5", textColor: "#ffffff", accentColor: "#ce93d8", fontFamily: "Arial, sans-serif", shape: "rounded-lg" },
      { name: "Rouge", bgColor: "#b71c1c", borderColor: "#ffebee", textColor: "#ffffff", accentColor: "#ef9a9a", fontFamily: "Arial, sans-serif", shape: "rectangle" },
    ];
    for (let i = 0; i < defaultVariants.length; i++) {
      allVariants.push({ ...sampleData[i], variant: defaultVariants[i], flagUrl: null, sealUrl: null });
    }
  }

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
          Chaque plaque est unique, normalisée et vérifiable instantanément via QR Code.
          Couleurs, polices et formes sont entièrement configurables.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto stagger-children">
        {allVariants.slice(0, 4).map((item, i) => (
          <div
            key={i}
            className="group rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] p-4 transition-all duration-300"
          >
            <VariantPlaque {...item} />
            <p className="text-center text-[10px] text-blue-300/40 mt-2 font-medium">
              {item.variant.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function VariantPlaque({ commune, quartier, avenue, numero, variant, flagUrl, sealUrl }: {
  commune: string; quartier: string; avenue: string; numero: string;
  variant: VariantDesign; flagUrl: string | null; sealUrl: string | null;
}) {
  const rx = variant.shape === "rectangle" ? "4" : variant.shape === "rounded" ? "10" : "18";

  return (
    <svg viewBox="0 0 360 180" className="w-full">
      {/* Outer frame */}
      <rect x="2" y="2" width="356" height="176" rx={rx} fill={variant.borderColor} />
      {/* Inner bg */}
      <rect x="6" y="6" width="348" height="168" rx={String(Math.max(0, Number(rx) - 2))} fill={variant.bgColor} />

      {/* Flag */}
      {flagUrl ? (
        <image href={flagUrl} x="16" y="14" width="44" height="30" preserveAspectRatio="xMidYMid meet" />
      ) : (
        <>
          <rect x="16" y="14" width="44" height="30" rx="2" fill="#007FFF" />
          <line x1="16" y1="14" x2="60" y2="44" stroke="#CE1021" strokeWidth="4" />
          <polygon points="26,19 28,25 34,25 29,28 31,34 26,30 21,34 23,28 18,25 24,25" fill="#F7D618" />
        </>
      )}

      {/* Seal (always round) */}
      <clipPath id={`seal-${commune}`}>
        <circle cx="326" cy="30" r="16" />
      </clipPath>
      {sealUrl ? (
        <image href={sealUrl} x="310" y="14" width="32" height="32" clipPath={`url(#seal-${commune})`} preserveAspectRatio="xMidYMid slice" />
      ) : (
        <circle cx="326" cy="30" r="16" fill="none" stroke={variant.borderColor} strokeWidth="1" opacity="0.5" />
      )}

      {/* Text */}
      <text x="180" y="24" textAnchor="middle" fill={variant.accentColor} fontSize="6" fontFamily={variant.fontFamily}>COMMUNE DE</text>
      <text x="180" y="38" textAnchor="middle" fill={variant.textColor} fontSize="11" fontWeight="bold" fontFamily={variant.fontFamily}>{commune}</text>
      <text x="180" y="56" textAnchor="middle" fill={variant.accentColor} fontSize="8" fontWeight="bold" fontFamily={variant.fontFamily}>QUARTIER {quartier}</text>

      {/* Avenue band */}
      <rect x="14" y="64" width="332" height="28" rx="3" fill={variant.borderColor} opacity="0.12" />
      <text x="180" y="82" textAnchor="middle" fill={variant.textColor} fontSize="12" fontWeight="bold" fontFamily={variant.fontFamily}>{avenue}</text>

      {/* ── Bottom section: N° centré + QR aligné sur la même ligne à droite ── */}
      {/* N° — centré pleine largeur, gros */}
      <text x="180" y="147" textAnchor="middle" fill={variant.accentColor} fontSize="44" fontWeight="bold" fontFamily={variant.fontFamily}>N° {numero}</text>

      {/* QR — 56×56, droite, centre vertical = 133 (même ligne que N°) */}
      <rect x="291" y="105" width="56" height="56" rx="4" fill="white" />
      {/* TL corner */}
      <rect x="294" y="108" width="11" height="11" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
      <rect x="296" y="110" width="7" height="7" fill="#1e293b" />
      {/* TR corner */}
      <rect x="333" y="108" width="11" height="11" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
      <rect x="335" y="110" width="7" height="7" fill="#1e293b" />
      {/* BL corner */}
      <rect x="294" y="147" width="11" height="11" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
      <rect x="296" y="149" width="7" height="7" fill="#1e293b" />
      {/* Seal in QR center */}
      <clipPath id={`qrSeal-${commune}`}>
        <circle cx="319" cy="133" r="7" />
      </clipPath>
      {sealUrl ? (
        <image href={sealUrl} x="312" y="126" width="14" height="14" clipPath={`url(#qrSeal-${commune})`} preserveAspectRatio="xMidYMid slice" />
      ) : (
        <circle cx="319" cy="133" r="7" fill="#f0f0f0" stroke="#ddd" strokeWidth="0.5" />
      )}
    </svg>
  );
}
