import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AdminHeader } from '../../AdminHeader';
import { StatusChangeForm, STATUS_CONFIG } from './StatusChangeForm';
import { OrderStatus } from '@/app/generated/prisma/client';

const SOLE_NAMES: Record<string, string> = {
  vibram_xs_grip: 'Vibram XS Grip (4mm)',
  vibram_xs_grip_2: 'Vibram XS Grip 2 (4mm)',
  vibram_xs_edge: 'Vibram XS Edge (4mm)',
  stealth_c4: 'Stealth C4 (4mm)',
  stealth_hf: 'Stealth HF (4mm)',
  boreal: 'Boreal (4mm)',
  original: 'Original Sohle',
};

const EDGE_RUBBER_LABELS: Record<string, string> = {
  YES: 'Ja',
  NO: 'Nein',
  DISCRETION: 'Nach Ermessen',
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      statusChanges: {
        orderBy: { changedAt: 'desc' },
        take: 10,
      },
      history: {
        orderBy: { changedAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!order) {
    notFound();
  }

  const formattedDate = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(order.createdAt);

  const formatHistoryDate = (date: Date) =>
    new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);

  // Check if order can be edited (not completed or cancelled)
  const canEdit = !['COMPLETED', 'CANCELLED'].includes(order.status);

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <AdminHeader />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-gray-600 hover:text-[#ef6a27] mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zur Übersicht
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#38362d]">
              Auftrag #{order.orderNumber}
            </h1>
            <p className="text-gray-500">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusChangeForm
              orderId={order.id}
              currentStatus={order.status as OrderStatus}
            />
            {canEdit && (
              <Link href={`/admin/orders/${order.id}/edit`}>
                <Button variant="secondary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Bearbeiten
                </Button>
              </Link>
            )}
            <Link href={`/order/${order.id}/print`} target="_blank">
              <Button>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Drucken
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <Card title="Kundendaten" className="lg:col-span-1">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold">
                  {order.salutation} {order.firstName} {order.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Adresse</p>
                <p>{order.street} {order.houseNumber}</p>
                <p>{order.zip} {order.city}</p>
                {order.country && order.country !== 'DE' && (
                  <p>{order.country}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Kontakt</p>
                <p>Tel: {order.phone}</p>
                <p>E-Mail: {order.email}</p>
              </div>
              {!order.deliverySame && order.deliveryFirstName && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">Abweichende Lieferadresse</p>
                  <p className="font-semibold">
                    {order.deliverySalutation} {order.deliveryFirstName} {order.deliveryLastName}
                  </p>
                  <p>{order.deliveryStreet} {order.deliveryHouseNumber}</p>
                  <p>{order.deliveryZip} {order.deliveryCity}</p>
                  {order.deliveryCountry && order.deliveryCountry !== 'DE' && (
                    <p>{order.deliveryCountry}</p>
                  )}
                </div>
              )}
              {(order.packstationNumber || order.postNumber || order.deliveryNotes) && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">Lieferhinweise</p>
                  {order.packstationNumber && (
                    <p className="text-gray-700">Packstation: {order.packstationNumber}</p>
                  )}
                  {order.postNumber && (
                    <p className="text-gray-700">Postnummer: {order.postNumber}</p>
                  )}
                  {order.deliveryNotes && (
                    <p className="text-gray-700">{order.deliveryNotes}</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Items */}
          <Card title="Schuhe / Positionen" className="lg:col-span-2">
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-lg">
                        {Number(item.quantity)}x {item.manufacturer} {item.model}
                        {item.color && (
                          <span className="text-gray-500 font-normal"> ({item.color})</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">Größe: {item.size}</p>
                    </div>
                    <p className="text-xl font-bold text-[#ef6a27]">
                      {Number(item.calculatedPrice).toFixed(2)} €
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Sohle</p>
                      <p className="font-semibold text-sm">
                        {SOLE_NAMES[item.sole] || item.sole}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Randgummi</p>
                      <p className="font-semibold text-sm">
                        {EDGE_RUBBER_LABELS[item.edgeRubber]}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Verschluss</p>
                      <p className="font-semibold text-sm">{item.closure ? 'Ja' : 'Nein'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Desinfektion</p>
                      <p className="font-semibold text-sm">{item.disinfection ? 'Ja' : 'Nein'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Profis machen lassen</p>
                      <p className="font-semibold text-sm">{item.trustProfessionals ? 'Ja' : 'Nein'}</p>
                    </div>
                  </div>

                  {item.additionalWork && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Zusatzarbeiten</p>
                      <p className="text-sm">{item.additionalWork}</p>
                    </div>
                  )}

                  {item.internalNotes && (
                    <div className="mt-4 pt-4 border-t border-gray-200 bg-yellow-50 -mx-4 -mb-4 p-4 rounded-b-lg">
                      <p className="text-xs text-yellow-700">Interne Bemerkung</p>
                      <p className="text-sm text-yellow-800">{item.internalNotes}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">Gesamtsumme (KVA)</span>
                <span className="text-2xl font-bold text-[#ef6a27]">
                  {order.totalPrice
                    ? new Intl.NumberFormat('de-DE', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(Number(order.totalPrice))
                    : '-'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Status History */}
        {order.statusChanges.length > 0 && (
          <Card title="Status-Verlauf" className="mt-6">
            <div className="space-y-3">
              {order.statusChanges.map((change) => {
                const fromConfig = STATUS_CONFIG[change.fromStatus as OrderStatus];
                const toConfig = STATUS_CONFIG[change.toStatus as OrderStatus];
                return (
                  <div key={change.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-gray-300" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${fromConfig?.color || 'bg-gray-100'}`}>
                          {fromConfig?.label || change.fromStatus}
                        </span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${toConfig?.color || 'bg-gray-100'}`}>
                          {toConfig?.label || change.toStatus}
                        </span>
                      </div>
                      {change.comment && (
                        <p className="text-sm text-gray-600 mt-1">{change.comment}</p>
                      )}
                      {change.trackingNumber && (
                        <p className="text-sm text-blue-600 mt-1">
                          Tracking: {change.trackingCarrier} {change.trackingNumber}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatHistoryDate(change.changedAt)} · {change.changedBy}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Edit History */}
        {order.history.length > 0 && (
          <Card title="Änderungs-Protokoll" className="mt-6">
            <div className="space-y-3">
              {order.history.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-orange-300" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{entry.field}</span> geändert
                    </p>
                    {entry.oldValue && entry.newValue && entry.field !== 'items' && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="line-through">{entry.oldValue}</span>
                        {' → '}
                        <span className="text-gray-700">{entry.newValue}</span>
                      </p>
                    )}
                    {entry.field === 'items' && (
                      <p className="text-xs text-gray-500 mt-0.5">Positionen wurden geändert</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatHistoryDate(entry.changedAt)} · {entry.changedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Consents */}
        <Card title="Einwilligungen" className="mt-6">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              {order.gdprAccepted ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span>Datenschutz</span>
            </div>
            <div className="flex items-center gap-2">
              {order.agbAccepted ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span>AGB</span>
            </div>
            <div className="flex items-center gap-2">
              {order.newsletter ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className={order.newsletter ? '' : 'text-gray-500'}>Newsletter</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
