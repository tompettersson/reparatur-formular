import Link from 'next/link';
import Image from 'next/image';
import { getOrder } from '../../new/actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// Tool icon for repair service
const ToolIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f5f5f4] flex items-center justify-center">
        <Card className="max-w-md text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">Auftrag nicht gefunden</h1>
          <p className="text-gray-600 mb-4">Der angeforderte Auftrag konnte nicht gefunden werden.</p>
          <Link href="/order/new">
            <Button>Neuen Auftrag erstellen</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f4]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Image
              src="/kletterschuhe-logo.png"
              alt="kletterschuhe.de"
              width={160}
              height={36}
              className="h-7 w-auto"
            />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ef6a27] text-white rounded-full text-xs font-medium">
              <ToolIcon />
              <span>Reparaturservice</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        <Card className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#38362d] mb-2">
            Vielen Dank für Ihren Auftrag!
          </h1>
          <p className="text-gray-600 mb-4">
            Ihr Auftrag wurde erfolgreich übermittelt.
          </p>
          <div className="inline-block bg-gray-100 rounded-lg px-4 py-2">
            <span className="text-sm text-gray-500">Auftragsnummer:</span>
            <span className="ml-2 font-mono font-bold text-[#ef6a27]">
              #{order.orderNumber}
            </span>
          </div>
        </Card>

        {/* Important Notice */}
        <Card className="bg-yellow-50 border-2 border-yellow-400 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-yellow-900 mb-2">
                WICHTIG: Auftragszettel ausdrucken!
              </h2>
              <p className="text-yellow-800 mb-4">
                Bitte drucken Sie den Auftragszettel aus und legen Sie ihn unbedingt zu Ihren Schuhen.
                Ohne Auftragszettel kann Ihr Paket nicht zugeordnet werden!
              </p>
              <Link href={`/order/${id}/print`}>
                <Button variant="primary" size="lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Auftragszettel drucken
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Order Summary */}
        <Card title="Ihre Bestellung">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold">{order.firstName} {order.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">E-Mail</p>
                <p className="font-semibold">{order.email}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">Schuhe ({order.items.length})</p>
              {order.items.map((item, index) => (
                <div key={item.id} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700">
                    {item.quantity}x {item.manufacturer} {item.model} (Gr. {item.size})
                  </span>
                  <span className="font-semibold text-[#ef6a27]">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(item.calculatedPrice))}
                  </span>
                </div>
              ))}
            </div>

            {order.totalPrice && (
              <div className="border-t pt-4 flex justify-between">
                <span className="font-bold text-lg">Kostenvoranschlag (KVA)</span>
                <span className="font-bold text-xl text-[#ef6a27]">
                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(order.totalPrice))}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Next Steps */}
        <Card title="Nächste Schritte" className="mt-8">
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li><strong>Auftragszettel drucken</strong> und zu den Schuhen legen</li>
            <li><strong>Schuhe verpacken</strong> - gut gepolstert in einem stabilen Karton</li>
            <li><strong>Versandlabel erstellen</strong> - Adresse siehe Auftragszettel</li>
            <li><strong>Paket abschicken</strong> - über den Paketdienst Ihrer Wahl</li>
            <li><strong>Reparatur abwarten</strong> - wir melden uns nach Eingang bei Ihnen</li>
          </ol>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-8">
          <Link href={`/order/${id}/print`}>
            <Button variant="outline">
              Auftragszettel erneut drucken
            </Button>
          </Link>
          <Link href="/order/new">
            <Button variant="secondary">
              Neuen Auftrag erstellen
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} kletterschuhe.de - Alle Rechte vorbehalten</p>
        </div>
      </footer>
    </div>
  );
}
