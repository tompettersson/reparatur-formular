import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AdminHeader } from '../../AdminHeader';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Entwurf', color: 'bg-gray-100 text-gray-700' },
  SUBMITTED: { label: 'Eingereicht', color: 'bg-green-100 text-green-700' },
};

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
    include: { items: true },
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#38362d]">
              Auftrag #{order.orderNumber}
            </h1>
            <p className="text-gray-500">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                STATUS_LABELS[order.status]?.color || 'bg-gray-100'
              }`}
            >
              {STATUS_LABELS[order.status]?.label || order.status}
            </span>
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
                <p>{order.street}</p>
                <p>{order.zip} {order.city}</p>
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
                  <p>{order.deliveryStreet}</p>
                  <p>{order.deliveryZip} {order.deliveryCity}</p>
                </div>
              )}
              {order.stationNotes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">Lieferhinweise</p>
                  <p className="text-gray-700">{order.stationNotes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Items */}
          <Card title="Schuhe / Positionen" className="lg:col-span-2">
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-lg">
                        {item.quantity}x {item.manufacturer} {item.model}
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
