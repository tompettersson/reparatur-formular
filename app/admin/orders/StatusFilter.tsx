'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const STATUS_OPTIONS = [
  { value: '', label: 'Alle Status' },
  { value: 'SUBMITTED', label: 'Eingereicht', color: 'bg-blue-100 text-blue-700' },
  { value: 'RECEIVED', label: 'Eingetroffen', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'INSPECTED', label: 'Begutachtet', color: 'bg-purple-100 text-purple-700' },
  { value: 'PAID', label: 'Bezahlt', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'REPAIRING', label: 'In Reparatur', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'READY', label: 'Fertig', color: 'bg-green-100 text-green-700' },
  { value: 'SHIPPED', label: 'Versendet', color: 'bg-teal-100 text-teal-700' },
  { value: 'RETURNED', label: 'Retourniert', color: 'bg-gray-200 text-gray-600' },
  { value: 'COMPLETED', label: 'Abgeschlossen', color: 'bg-green-600 text-white' },
  { value: 'CANCELLED', label: 'Storniert', color: 'bg-red-100 text-red-700' },
  { value: 'ON_HOLD', label: 'Rückfrage', color: 'bg-orange-100 text-orange-700' },
];

export function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || '';

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    router.push(`/admin/orders?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleChange(opt.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            currentStatus === opt.value
              ? opt.color || 'bg-[#ef6a27] text-white'
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
          } ${currentStatus === opt.value ? 'ring-2 ring-offset-1 ring-gray-300' : ''}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
