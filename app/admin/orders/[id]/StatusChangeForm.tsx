'use client';

import { useState, useTransition } from 'react';
import { OrderStatus } from '@/app/generated/prisma/client';
import { updateOrderStatus } from '../actions';
import { Button } from '@/components/ui/Button';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; next: OrderStatus[] }> = {
  DRAFT: {
    label: 'Entwurf',
    color: 'bg-gray-100 text-gray-700',
    next: ['SUBMITTED', 'CANCELLED'],
  },
  SUBMITTED: {
    label: 'Eingereicht',
    color: 'bg-blue-100 text-blue-700',
    next: ['RECEIVED', 'CANCELLED', 'ON_HOLD'],
  },
  RECEIVED: {
    label: 'Eingetroffen',
    color: 'bg-indigo-100 text-indigo-700',
    next: ['INSPECTED', 'CANCELLED', 'ON_HOLD'],
  },
  INSPECTED: {
    label: 'Begutachtet',
    color: 'bg-purple-100 text-purple-700',
    next: ['REPAIRING', 'CANCELLED', 'ON_HOLD'],
  },
  REPAIRING: {
    label: 'In Reparatur',
    color: 'bg-yellow-100 text-yellow-800',
    next: ['READY', 'CANCELLED', 'ON_HOLD'],
  },
  READY: {
    label: 'Fertig',
    color: 'bg-green-100 text-green-700',
    next: ['SHIPPED', 'ON_HOLD'],
  },
  SHIPPED: {
    label: 'Versendet',
    color: 'bg-teal-100 text-teal-700',
    next: ['COMPLETED'],
  },
  COMPLETED: {
    label: 'Abgeschlossen',
    color: 'bg-green-600 text-white',
    next: [],
  },
  CANCELLED: {
    label: 'Storniert',
    color: 'bg-red-100 text-red-700',
    next: [],
  },
  ON_HOLD: {
    label: 'Wartend (Rückfrage)',
    color: 'bg-orange-100 text-orange-700',
    next: ['RECEIVED', 'INSPECTED', 'REPAIRING', 'CANCELLED'],
  },
};

interface StatusChangeFormProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function StatusChangeForm({ orderId, currentStatus }: StatusChangeFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [comment, setComment] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('DHL');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const config = STATUS_CONFIG[currentStatus];
  const availableStatuses = config.next;

  const handleStatusChange = async () => {
    if (!selectedStatus) return;

    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus({
        orderId,
        newStatus: selectedStatus,
        comment: comment || undefined,
        trackingNumber: selectedStatus === 'SHIPPED' ? trackingNumber : undefined,
        trackingCarrier: selectedStatus === 'SHIPPED' ? trackingCarrier : undefined,
      });

      if (result.success) {
        setIsOpen(false);
        setSelectedStatus(null);
        setComment('');
        setTrackingNumber('');
      } else {
        setError(result.error);
      }
    });
  };

  if (availableStatuses.length === 0) {
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  }

  return (
    <div className="relative">
      {/* Current Status Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${config.color} hover:ring-2 hover:ring-offset-2 hover:ring-gray-300 transition-all`}
      >
        {config.label}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Modal */}
          <div className="absolute right-0 top-full mt-2 z-20 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Status ändern</h3>

            {/* Status Options */}
            <div className="space-y-2 mb-4">
              {availableStatuses.map((status) => {
                const statusConfig = STATUS_CONFIG[status];
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                      selectedStatus === status
                        ? 'border-[#ef6a27] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tracking Info for SHIPPED */}
            {selectedStatus === 'SHIPPED' && (
              <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Versanddienstleister
                  </label>
                  <select
                    value={trackingCarrier}
                    onChange={(e) => setTrackingCarrier(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ef6a27] focus:border-transparent"
                  >
                    <option value="DHL">DHL</option>
                    <option value="DPD">DPD</option>
                    <option value="Hermes">Hermes</option>
                    <option value="GLS">GLS</option>
                    <option value="UPS">UPS</option>
                    <option value="Andere">Andere</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sendungsnummer
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="z.B. 00340434..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ef6a27] focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Comment */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kommentar (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Grund für die Änderung..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ef6a27] focus:border-transparent resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={!selectedStatus || isPending}
                className="flex-1"
              >
                {isPending ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Export for use in other components
export { STATUS_CONFIG };
