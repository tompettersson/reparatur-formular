'use client';

import Image from 'next/image';

// Trust-Badges für autorisierte Reparaturdienste
// Zeigt echte Partner-Zertifikate von Vibram, La Sportiva und Scarpa

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Vibram Badge */}
        <div className="flex items-center gap-3 p-3 bg-[#fafaf9] rounded-lg border border-[#e7e5e4]">
          <Image
            src="/logos/vibram-resoler.png"
            alt="Vibram Climbing Authorized Cobbler"
            width={48}
            height={56}
            className="flex-shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#38362d]">
              Vibram Authorized Cobbler
            </p>
            <p className="text-xs text-[#78716c]">
              Climbing-Spezialist
            </p>
          </div>
        </div>

        {/* La Sportiva Badge */}
        <div className="flex items-center gap-3 p-3 bg-[#fafaf9] rounded-lg border border-[#e7e5e4]">
          <Image
            src="/logos/la-sportiva-resoler.png"
            alt="La Sportiva Authorized Resoler"
            width={48}
            height={48}
            className="flex-shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#38362d]">
              La Sportiva Authorized Resoler
            </p>
            <p className="text-xs text-[#78716c]">
              Autorisierter Partner
            </p>
          </div>
        </div>

        {/* Scarpa Badge */}
        <div className="flex items-center gap-3 p-3 bg-[#fafaf9] rounded-lg border border-[#e7e5e4]">
          <Image
            src="/logos/scarpa-resoler.png"
            alt="Scarpa Official Resoler"
            width={40}
            height={56}
            className="flex-shrink-0 object-contain"
          />
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
