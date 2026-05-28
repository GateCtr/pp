interface PlaqueCardProps {
  commune: string;
  quartier: string;
  avenue: string;
  numero: string;
}

export function PlaqueCard({ commune, quartier, avenue, numero }: PlaqueCardProps) {
  return (
    <svg viewBox="0 0 360 200" fill="none" className="w-full">
      {/* ===== Outer white rounded frame ===== */}
      <rect x="4" y="4" width="352" height="192" rx="12" fill="white" />
      {/* ===== Inner blue plate ===== */}
      <rect x="12" y="12" width="336" height="176" rx="8" fill="#1a3a7a" />

      {/* ===== TOP SECTION: Commune header ===== */}
      {/* DRC Flag - using real image */}
      <image
        href="/drc.jpg"
        x="24"
        y="22"
        width="44"
        height="30"
        rx="3"
        clipPath="inset(0% round 3)"
      />

      {/* COMMUNE DE label */}
      <text x="180" y="30" textAnchor="middle" fill="#a3c4f7" fontSize="8" fontFamily="sans-serif">
        COMMUNE DE
      </text>
      {/* Commune name (large) */}
      <text x="180" y="48" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">
        {commune}
      </text>

      {/* City/commune seal (top right) - using real image in circular frame */}
      <circle cx="318" cy="38" r="16" fill="white" />
      <image
        href="/city.jpg"
        x="302"
        y="22"
        width="32"
        height="32"
        clipPath="circle(16 16 16)"
      />

      {/* QUARTIER line (blue lighter text) */}
      <text x="180" y="70" textAnchor="middle" fill="#7db8f9" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
        QUARTIER {quartier}
      </text>

      {/* ===== MIDDLE SECTION: Avenue (white background band) ===== */}
      <rect x="22" y="80" width="316" height="36" rx="4" fill="#e8edf5" />
      <text x="180" y="104" textAnchor="middle" fill="#1a3a7a" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
        {avenue}
      </text>

      {/* ===== BOTTOM SECTION: Numéro + QR Code ===== */}
      {/* Numéro (large, blue text) */}
      <text x="140" y="160" textAnchor="middle" fill="#4da3ff" fontSize="36" fontWeight="bold" fontFamily="sans-serif">
        N° {numero}
      </text>

      {/* QR Code (bottom right, white background) */}
      <rect x="278" y="124" width="52" height="52" rx="4" fill="white" />
      {/* QR corner markers */}
      <rect x="284" y="130" width="12" height="12" rx="1" fill="none" stroke="#1e293b" strokeWidth="2" />
      <rect x="287" y="133" width="6" height="6" fill="#1e293b" />
      <rect x="312" y="130" width="12" height="12" rx="1" fill="none" stroke="#1e293b" strokeWidth="2" />
      <rect x="315" y="133" width="6" height="6" fill="#1e293b" />
      <rect x="284" y="158" width="12" height="12" rx="1" fill="none" stroke="#1e293b" strokeWidth="2" />
      <rect x="287" y="161" width="6" height="6" fill="#1e293b" />
      {/* QR data pattern */}
      <rect x="300" y="145" width="4" height="4" fill="#1e293b" />
      <rect x="306" y="145" width="4" height="4" fill="#1e293b" />
      <rect x="312" y="145" width="4" height="4" fill="#1e293b" />
      <rect x="300" y="151" width="4" height="4" fill="#1e293b" />
      <rect x="308" y="153" width="4" height="4" fill="#1e293b" />
      <rect x="300" y="158" width="4" height="4" fill="#1e293b" />
      <rect x="306" y="160" width="4" height="4" fill="#1e293b" />
      <rect x="314" y="158" width="4" height="4" fill="#1e293b" />
      <rect x="320" y="160" width="4" height="4" fill="#1e293b" />
      <rect x="300" y="166" width="4" height="4" fill="#1e293b" />
      <rect x="312" y="166" width="4" height="4" fill="#1e293b" />
      <rect x="320" y="166" width="4" height="4" fill="#1e293b" />
    </svg>
  );
}
