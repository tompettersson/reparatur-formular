'use client';

// Trust-Badges für autorisierte Reparaturdienste
// Zeigt echte Partner-Zertifikate von La Sportiva und Scarpa

// La Sportiva Authorized Resoler Badge - rundes Design mit Berg-Logo
function LaSportivaBadge() {
  return (
    <svg viewBox="0 0 80 80" className="w-12 h-12 flex-shrink-0">
      {/* Äußerer Ring */}
      <circle cx="40" cy="40" r="38" fill="none" stroke="#1a1a1a" strokeWidth="2" />
      <circle cx="40" cy="40" r="35" fill="none" stroke="#1a1a1a" strokeWidth="1" />

      {/* Berg-Symbol oben */}
      <path d="M40 12 L50 28 L30 28 Z" fill="#1a1a1a" />
      <text x="40" y="24" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">▲</text>

      {/* LA SPORTIVA Text */}
      <text x="40" y="38" textAnchor="middle" fontSize="6" fill="#1a1a1a" fontWeight="bold" fontFamily="Arial, sans-serif">
        LA SPORTIVA
      </text>

      {/* Trennlinie */}
      <line x1="15" y1="44" x2="65" y2="44" stroke="#1a1a1a" strokeWidth="0.5" />

      {/* AUTHORIZED RESOLER Text */}
      <text x="40" y="52" textAnchor="middle" fontSize="5" fill="#1a1a1a" fontFamily="Arial, sans-serif">
        AUTHORIZED
      </text>
      <text x="40" y="60" textAnchor="middle" fontSize="5" fill="#1a1a1a" fontFamily="Arial, sans-serif">
        RESOLER
      </text>
    </svg>
  );
}

// Scarpa Official Resoler Badge - rechteckiges türkises Design
function ScarpaBadge() {
  return (
    <svg viewBox="0 0 70 80" className="w-11 h-12 flex-shrink-0">
      {/* Hintergrund */}
      <rect x="2" y="2" width="66" height="76" rx="4" fill="#00a5b5" />

      {/* Weißer Rahmen */}
      <rect x="5" y="5" width="60" height="70" rx="2" fill="none" stroke="white" strokeWidth="1" />

      {/* S Symbol */}
      <text x="35" y="35" textAnchor="middle" fontSize="24" fill="white" fontWeight="bold" fontFamily="Arial, sans-serif">
        S
      </text>

      {/* SCARPA Text */}
      <text x="35" y="50" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold" fontFamily="Arial, sans-serif">
        SCARPA
      </text>

      {/* Trennlinie */}
      <line x1="12" y1="55" x2="58" y2="55" stroke="white" strokeWidth="0.5" />

      {/* OFFICIAL RESOLER Text */}
      <text x="35" y="64" textAnchor="middle" fontSize="5" fill="white" fontFamily="Arial, sans-serif">
        OFFICIAL
      </text>
      <text x="35" y="72" textAnchor="middle" fontSize="5" fill="white" fontFamily="Arial, sans-serif">
        RESOLER
      </text>
    </svg>
  );
}

export function TrustBadges() {
  return (
    <div className="mt-6 pt-6 border-t border-[#e7e5e4]">
      <div className="flex items-center gap-2 mb-4">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <span className="text-sm font-semibold text-[#38362d]">
          Autorisierter Reparaturpartner
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* La Sportiva Badge */}
        <div className="flex items-center gap-3 p-3 bg-[#fafaf9] rounded-lg border border-[#e7e5e4]">
          <LaSportivaBadge />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#38362d]">
              La Sportiva Authorized Resoler
            </p>
            <p className="text-xs text-[#78716c]">
              Autorisierter Reparaturpartner
            </p>
          </div>
        </div>

        {/* Scarpa Badge */}
        <div className="flex items-center gap-3 p-3 bg-[#fafaf9] rounded-lg border border-[#e7e5e4]">
          <ScarpaBadge />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#38362d]">
              Scarpa Official Resoler
            </p>
            <p className="text-xs text-[#78716c]">
              Offizieller Reparaturservice
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-[#78716c] mt-3 text-center">
        Wir verwenden ausschließlich Originalmaterialien und arbeiten nach höchsten Qualitätsstandards.
      </p>
    </div>
  );
}
