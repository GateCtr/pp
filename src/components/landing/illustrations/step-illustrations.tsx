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
        {/* ===== PLAQUE: fidèle au modèle officiel ===== */}
        {/* Outer white frame */}
        <rect x="20" y="10" width="260" height="130" rx="10" fill="white" />
        {/* Inner blue plate */}
        <rect x="26" y="16" width="248" height="118" rx="7" fill="#1a3a7a" />

        {/* DRC Flag - using real image */}
        <image
          href="/drc.jpg"
          x="34"
          y="22"
          width="34"
          height="22"
          rx="2"
          clipPath="inset(0% round 2)"
        />

        {/* COMMUNE DE */}
        <text x="150" y="28" textAnchor="middle" fill="#a3c4f7" fontSize="5.5">COMMUNE DE</text>
        {/* Commune name */}
        <text x="150" y="40" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">NGIRI NGIRI</text>

        {/* City/commune seal (top right) - using real image in circular frame */}
        <circle cx="246" cy="33" r="11" fill="white" />
        <image
          href="/city.jpg"
          x="235"
          y="22"
          width="22"
          height="22"
          clipPath="circle(11 11 11)"
        />

        {/* QUARTIER */}
        <text x="150" y="55" textAnchor="middle" fill="#7db8f9" fontSize="7" fontWeight="bold">QUARTIER ELENGESA</text>

        {/* White band for avenue */}
        <rect x="32" y="60" width="236" height="24" rx="3" fill="#e8edf5" />
        <text x="150" y="76" textAnchor="middle" fill="#1a3a7a" fontSize="11" fontWeight="bold">AVENUE ELENGESA</text>

        {/* N° (large, blue) */}
        <text x="110" y="115" textAnchor="middle" fill="#4da3ff" fontSize="24" fontWeight="bold">N° 6</text>

        {/* QR Code */}
        <rect x="218" y="90" width="38" height="38" rx="3" fill="white" />
        {/* QR corners */}
        <rect x="222" y="94" width="8" height="8" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="224" y="96" width="4" height="4" fill="#1e293b" />
        <rect x="244" y="94" width="8" height="8" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="246" y="96" width="4" height="4" fill="#1e293b" />
        <rect x="222" y="116" width="8" height="8" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="224" y="118" width="4" height="4" fill="#1e293b" />
        {/* QR data */}
        <rect x="234" y="106" width="3" height="3" fill="#1e293b" />
        <rect x="239" y="106" width="3" height="3" fill="#1e293b" />
        <rect x="244" y="106" width="3" height="3" fill="#1e293b" />
        <rect x="234" y="111" width="3" height="3" fill="#1e293b" />
        <rect x="244" y="111" width="3" height="3" fill="#1e293b" />
        <rect x="234" y="116" width="3" height="3" fill="#1e293b" />
        <rect x="239" y="118" width="3" height="3" fill="#1e293b" />
        <rect x="246" y="116" width="3" height="3" fill="#1e293b" />
        <rect x="250" y="118" width="3" height="3" fill="#1e293b" />

        {/* ===== Phone scanning ===== */}
        <rect x="200" y="155" width="52" height="55" rx="10" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        <rect x="205" y="161" width="42" height="43" rx="6" fill="#0f172a" />
        {/* Camera viewfinder */}
        <path d="M212 167 L212 171 L216 171" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M240 167 L240 171 L236 171" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M212 198 L212 194 L216 194" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M240 198 L240 194 L236 194" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Scan line */}
        <line x1="214" y1="182" x2="238" y2="182" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
          <animate attributeName="y1" values="169;196;169" dur="2s" repeatCount="indefinite" />
          <animate attributeName="y2" values="169;196;169" dur="2s" repeatCount="indefinite" />
        </line>

        {/* Arrow QR → phone */}
        <path d="M240 132 C248 145, 232 152, 228 155" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" fill="none" opacity="0.6" />

        {/* Checkmark badge */}
        <circle cx="56" cy="170" r="18" fill="#10b98120" stroke="#10b981" strokeWidth="1.5" />
        <path d="M47 170l6 6 12-12" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="56" y="196" textAnchor="middle" fill="#10b981" fontSize="6" fontWeight="medium">Vérifié</text>
      </svg>
    </div>
  );
}
