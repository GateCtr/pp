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
      <svg viewBox="0 0 280 200" fill="none" className="w-full max-w-[280px]">
        {/* Plate background */}
        <rect x="50" y="30" width="180" height="100" rx="8" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
        {/* Plate header stripe */}
        <rect x="50" y="30" width="180" height="20" rx="8" fill="#1d4ed8" />
        <text x="140" y="44" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">REPUBLIQUE DEMOCRATIQUE DU CONGO</text>
        {/* Plate content */}
        <text x="80" y="68" fill="#93c5fd" fontSize="6">Province:</text>
        <text x="130" y="68" fill="white" fontSize="7" fontWeight="bold">KINSHASA</text>
        <text x="80" y="82" fill="#93c5fd" fontSize="6">Commune:</text>
        <text x="130" y="82" fill="white" fontSize="7" fontWeight="bold">LEMBA</text>
        <text x="80" y="96" fill="#93c5fd" fontSize="6">Quartier:</text>
        <text x="130" y="96" fill="white" fontSize="7" fontWeight="bold">RIGHINI</text>
        <text x="80" y="110" fill="#93c5fd" fontSize="6">Parcelle:</text>
        <text x="130" y="110" fill="white" fontSize="9" fontWeight="bold">N° 42</text>
        {/* QR Code placeholder */}
        <rect x="182" y="58" width="38" height="38" rx="4" fill="white" />
        <rect x="186" y="62" width="6" height="6" fill="#1e293b" />
        <rect x="194" y="62" width="6" height="6" fill="#1e293b" />
        <rect x="202" y="62" width="6" height="6" fill="#1e293b" />
        <rect x="210" y="62" width="6" height="6" fill="#1e293b" />
        <rect x="186" y="70" width="6" height="6" fill="#1e293b" />
        <rect x="202" y="70" width="6" height="6" fill="#1e293b" />
        <rect x="186" y="78" width="6" height="6" fill="#1e293b" />
        <rect x="194" y="78" width="6" height="6" fill="#1e293b" />
        <rect x="210" y="78" width="6" height="6" fill="#1e293b" />
        <rect x="186" y="86" width="6" height="6" fill="#1e293b" />
        <rect x="202" y="86" width="6" height="6" fill="#1e293b" />
        <rect x="210" y="86" width="6" height="6" fill="#1e293b" />
        {/* Scan phone */}
        <rect x="160" y="140" width="50" height="50" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        <rect x="164" y="146" width="42" height="38" rx="4" fill="#0f172a" />
        {/* Scan line */}
        <line x1="170" y1="165" x2="200" y2="165" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="y1" values="155;175;155" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y2" values="155;175;155" dur="2s" repeatCount="indefinite" />
        </line>
        {/* Arrow */}
        <path d="M140 145 L155 155" stroke="#3b82f680" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
      </svg>
    </div>
  );
}
