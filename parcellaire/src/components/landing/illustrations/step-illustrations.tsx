export function StepCollectIllustration() {
  return (
    <div className="flex items-center justify-center py-4">
      <svg viewBox="0 0 280 200" fill="none" className="w-full max-w-[280px]">
        {/* Phone body */}
        <rect x="90" y="10" width="100" height="180" rx="16" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <rect x="96" y="20" width="88" height="160" rx="12" fill="#0f172a" />
        {/* Screen content - form fields */}
        <rect x="104" y="40" width="72" height="10" rx="3" fill="#1e3a5f" />
        <rect x="104" y="56" width="72" height="10" rx="3" fill="#1e3a5f" />
        <rect x="104" y="72" width="72" height="10" rx="3" fill="#1e3a5f" />
        <rect x="104" y="88" width="34" height="10" rx="3" fill="#1e3a5f" />
        <rect x="142" y="88" width="34" height="10" rx="3" fill="#1e3a5f" />
        {/* Submit button */}
        <rect x="104" y="110" width="72" height="14" rx="5" fill="#3b82f6" />
        <text x="140" y="120" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">Soumettre</text>
        {/* Location pin */}
        <circle cx="50" cy="80" r="18" fill="#3b82f620" stroke="#3b82f6" strokeWidth="1.5" />
        <path d="M50 72c-3.3 0-6 2.7-6 6 0 4.5 6 10 6 10s6-5.5 6-10c0-3.3-2.7-6-6-6z" fill="#3b82f6" />
        <circle cx="50" cy="78" r="2" fill="white" />
        {/* Signal waves */}
        <path d="M220 60c4 0 7 3 7 7" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M220 53c8 0 14 6 14 14" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M220 46c12 0 21 9 21 21" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
        {/* Person silhouette */}
        <circle cx="50" cy="140" r="8" fill="#64748b" />
        <path d="M38 170c0-7 5-12 12-12s12 5 12 12" fill="#64748b" />
      </svg>
    </div>
  );
}


export function StepValidateIllustration() {
  return (
    <div className="flex items-center justify-center py-4">
      <svg viewBox="0 0 280 200" fill="none" className="w-full max-w-[280px]">
        {/* Desktop screen */}
        <rect x="40" y="20" width="200" height="130" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <rect x="48" y="28" width="184" height="110" rx="4" fill="#0f172a" />
        {/* Screen - Dashboard */}
        <rect x="56" y="36" width="60" height="8" rx="2" fill="#1e3a5f" />
        {/* Table rows */}
        <rect x="56" y="52" width="168" height="12" rx="2" fill="#1e3a5f" />
        <rect x="56" y="68" width="168" height="12" rx="2" fill="#1e3a5f" />
        <rect x="56" y="84" width="168" height="12" rx="2" fill="#1e3a5f" />
        {/* Validate button on row */}
        <rect x="186" y="54" width="30" height="8" rx="3" fill="#10b981" />
        <rect x="186" y="70" width="30" height="8" rx="3" fill="#f59e0b" />
        <rect x="186" y="86" width="30" height="8" rx="3" fill="#10b981" />
        {/* Stand */}
        <rect x="120" y="150" width="40" height="6" rx="2" fill="#475569" />
        <rect x="130" y="156" width="20" height="14" rx="1" fill="#334155" />
        {/* Checkmark badge */}
        <circle cx="240" cy="50" r="16" fill="#10b98120" stroke="#10b981" strokeWidth="1.5" />
        <path d="M233 50l4 4 8-8" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* X badge */}
        <circle cx="240" cy="90" r="12" fill="#ef444420" stroke="#ef4444" strokeWidth="1.5" />
        <path d="M236 86l8 8m0-8l-8 8" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}


export function StepPlaqueIllustration() {
  return (
    <div className="flex items-center justify-center py-4">
      <svg viewBox="0 0 340 220" fill="none" className="w-full max-w-[340px]">
        {/* Plaque - outer border (white frame) */}
        <rect x="20" y="10" width="260" height="140" rx="10" fill="white" />
        {/* Plaque - inner blue background */}
        <rect x="26" y="16" width="248" height="128" rx="7" fill="#1e3a8a" />

        {/* DRC Flag (simplified) */}
        <rect x="36" y="24" width="36" height="24" rx="2" fill="#007FFF" />
        <line x1="36" y1="24" x2="72" y2="48" stroke="#CE1021" strokeWidth="4" />
        <polygon points="44,30 46,34 50,34 47,37 48,41 44,38 40,41 41,37 38,34 42,34" fill="#F7D618" />

        {/* COMMUNE DE text */}
        <text x="150" y="30" textAnchor="middle" fill="#93c5fd" fontSize="6" fontWeight="normal">COMMUNE DE</text>
        {/* Commune name */}
        <text x="150" y="42" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">NGIRI NGIRI</text>

        {/* City seal (simplified circle) */}
        <circle cx="244" cy="36" r="14" fill="none" stroke="white" strokeWidth="1" opacity="0.7" />
        <circle cx="244" cy="36" r="10" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
        <circle cx="244" cy="36" r="3" fill="white" opacity="0.5" />

        {/* QUARTIER */}
        <text x="150" y="58" textAnchor="middle" fill="#60a5fa" fontSize="7" fontWeight="medium">QUARTIER ELENGESA</text>

        {/* Divider line */}
        <line x1="40" y1="64" x2="220" y2="64" stroke="#3b82f6" strokeWidth="0.5" opacity="0.4" />

        {/* AVENUE (main street name - large) */}
        <text x="140" y="84" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">AVENUE ELENGESA</text>

        {/* N° (house number - largest) */}
        <text x="120" y="120" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold">N° 6</text>

        {/* QR Code (bottom right) */}
        <rect x="218" y="92" width="40" height="40" rx="3" fill="white" />
        {/* QR pattern */}
        <rect x="222" y="96" width="8" height="8" fill="#1e293b" />
        <rect x="232" y="96" width="4" height="4" fill="#1e293b" />
        <rect x="238" y="96" width="4" height="4" fill="#1e293b" />
        <rect x="246" y="96" width="8" height="8" fill="#1e293b" />
        <rect x="222" y="106" width="4" height="4" fill="#1e293b" />
        <rect x="228" y="106" width="4" height="4" fill="#1e293b" />
        <rect x="238" y="106" width="4" height="4" fill="#1e293b" />
        <rect x="246" y="106" width="4" height="4" fill="#1e293b" />
        <rect x="222" y="112" width="8" height="8" fill="#1e293b" />
        <rect x="234" y="112" width="4" height="4" fill="#1e293b" />
        <rect x="240" y="112" width="4" height="4" fill="#1e293b" />
        <rect x="246" y="112" width="8" height="8" fill="#1e293b" />
        <rect x="222" y="122" width="4" height="4" fill="#1e293b" />
        <rect x="232" y="122" width="4" height="4" fill="#1e293b" />
        <rect x="244" y="122" width="4" height="4" fill="#1e293b" />
        <rect x="250" y="122" width="4" height="4" fill="#1e293b" />

        {/* Phone scanning the QR code */}
        <rect x="200" y="160" width="52" height="52" rx="10" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        <rect x="205" y="166" width="42" height="40" rx="6" fill="#0f172a" />
        {/* Camera viewfinder corners */}
        <path d="M212 172 L212 176 L216 176" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M240 172 L240 176 L236 176" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M212 200 L212 196 L216 196" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M240 200 L240 196 L236 196" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Scan line animated */}
        <line x1="214" y1="186" x2="238" y2="186" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
          <animate attributeName="y1" values="174;198;174" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y2" values="174;198;174" dur="2s" repeatCount="indefinite" />
        </line>

        {/* Arrow from QR to phone */}
        <path d="M242 136 C248 148, 230 155, 226 160" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" fill="none" opacity="0.6" />

        {/* Checkmark badge */}
        <circle cx="56" cy="170" r="18" fill="#10b98120" stroke="#10b981" strokeWidth="1.5" />
        <path d="M47 170l6 6 12-12" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="56" y="196" textAnchor="middle" fill="#10b981" fontSize="6" fontWeight="medium">Vérifié</text>
      </svg>
    </div>
  );
}
