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
      {/* DRC Flag */}
      <rect x="24" y="22" width="44" height="30" rx="3" fill="#007FFF" />
      {/* Diagonal red stripe */}
      <line x1="24" y1="22" x2="68" y2="52" stroke="#CE1021" strokeWidth="5" />
      {/* Yellow star */}
      <polygon
        points="34,28 36.5,34 43,34 38,37.5 39.5,44 34,40.5 28.5,44 30,37.5 25,34 31.5,34"
        fill="#F7D618"
      />

      {/* COMMUNE DE label */}
      <text x="180" y="30" textAnchor="middle" fill="#a3c4f7" fontSize="8" fontFamily="sans-serif">
        COMMUNE DE
      </text>
      {/* Commune name (large) */}
      <text x="180" y="48" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">
        {commune}
      </text>

      {/* City/commune seal (top right) */}
      <circle cx="318" cy="38" r="16" fill="none" stroke="white" strokeWidth="1.2" opacity="0.7" />
      <circle cx="318" cy="38" r="11" fill="none" stroke="white" strokeWidth="0.6" opacity="0.5" />
      <text x="318" y="42" textAnchor="middle" fill="white" fontSize="4" opacity="0.5">SCEAU</text>

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
