interface PlaqueCardProps {
  commune: string;
  quartier: string;
  avenue: string;
  numero: string;
}

export function PlaqueCard({ commune, quartier, avenue, numero }: PlaqueCardProps) {
  return (
    <svg viewBox="0 0 320 160" fill="none" className="w-full">
      {/* Outer white frame */}
      <rect x="4" y="4" width="312" height="152" rx="10" fill="white" />
      {/* Inner blue background */}
      <rect x="10" y="10" width="300" height="140" rx="7" fill="#1e3a8a" />

      {/* DRC Flag (simplified) */}
      <rect x="20" y="18" width="34" height="22" rx="2" fill="#007FFF" />
      <line x1="20" y1="18" x2="54" y2="40" stroke="#CE1021" strokeWidth="3.5" />
      <polygon
        points="28,23 30,27 34,27 31,29 32,33 28,30 24,33 25,29 22,27 26,27"
        fill="#F7D618"
      />

      {/* COMMUNE DE */}
      <text x="160" y="24" textAnchor="middle" fill="#93c5fd" fontSize="7">
        COMMUNE DE
      </text>
      {/* Commune name */}
      <text x="160" y="37" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
        {commune}
      </text>

      {/* City seal */}
      <circle cx="282" cy="30" r="13" fill="none" stroke="white" strokeWidth="0.8" opacity="0.6" />
      <circle cx="282" cy="30" r="9" fill="none" stroke="white" strokeWidth="0.4" opacity="0.4" />
      <circle cx="282" cy="30" r="3" fill="white" opacity="0.4" />

      {/* QUARTIER */}
      <text x="160" y="55" textAnchor="middle" fill="#60a5fa" fontSize="8">
        QUARTIER {quartier}
      </text>

      {/* Divider */}
      <line x1="30" y1="62" x2="240" y2="62" stroke="#3b82f6" strokeWidth="0.4" opacity="0.4" />

      {/* AVENUE */}
      <text x="150" y="85" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
        {avenue}
      </text>

      {/* N° */}
      <text x="120" y="125" textAnchor="middle" fill="white" fontSize="30" fontWeight="bold">
        N° {numero}
      </text>

      {/* QR Code */}
      <rect x="248" y="90" width="44" height="44" rx="4" fill="white" />
      {/* QR pattern */}
      <rect x="253" y="95" width="8" height="8" fill="#1e293b" />
      <rect x="263" y="95" width="4" height="4" fill="#1e293b" />
      <rect x="269" y="95" width="4" height="4" fill="#1e293b" />
      <rect x="279" y="95" width="8" height="8" fill="#1e293b" />
      <rect x="253" y="105" width="4" height="4" fill="#1e293b" />
      <rect x="259" y="107" width="4" height="4" fill="#1e293b" />
      <rect x="269" y="105" width="4" height="4" fill="#1e293b" />
      <rect x="279" y="105" width="4" height="4" fill="#1e293b" />
      <rect x="253" y="113" width="8" height="8" fill="#1e293b" />
      <rect x="265" y="113" width="4" height="4" fill="#1e293b" />
      <rect x="271" y="115" width="4" height="4" fill="#1e293b" />
      <rect x="279" y="113" width="8" height="8" fill="#1e293b" />
      <rect x="255" y="123" width="4" height="4" fill="#1e293b" />
      <rect x="265" y="123" width="4" height="4" fill="#1e293b" />
      <rect x="275" y="123" width="4" height="4" fill="#1e293b" />
      <rect x="283" y="123" width="4" height="4" fill="#1e293b" />
    </svg>
  );
}
