import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PrintButton } from './PrintButton';
import './print.css';

// Versandadresse kletterschuhe.de (KORRIGIERT: Hadamar statt Efringen-Kirchen)
const SHOP_ADDRESS = {
  name: 'kletterschuhe.de',
  street: 'Franz-Gensler-Str. 7-9',
  zip: '65589',
  city: 'Hadamar',
};

// Sohlen-Namen für Anzeige
const SOLE_NAMES: Record<string, string> = {
  vibram_xs_grip: 'Vibram XS Grip (4mm)',
  vibram_xs_grip_2: 'Vibram XS Grip 2 (4mm)',
  vibram_xs_edge: 'Vibram XS Edge (4mm)',
  stealth_c4: 'Stealth C4 (4mm)',
  stealth_hf: 'Stealth HF (4mm)',
  boreal: 'Boreal (4mm)',
  original: 'Original Sohle',
};

// Randgummi-Optionen
const EDGE_RUBBER_LABELS: Record<string, string> = {
  YES: 'Ja',
  NO: 'Nein',
  DISCRETION: 'Nach Ermessen',
};

interface PrintPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrintPage({ params }: PrintPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  // Format date
  const formattedDate = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(order.createdAt);

  // Calculate total
  const totalPrice = order.items.reduce(
    (sum, item) => sum + Number(item.calculatedPrice),
    0
  );

  return (
    <>
      {/* Print Button (hidden in print) */}
      <div className="no-print fixed top-4 right-4 z-50">
        <PrintButton />
      </div>

      {/* Print Content */}
      <div className="print-page">
        {/* Header */}
        <header className="print-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="logo-circle">
                <span>K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">kletterschuhe.de</h1>
                <p className="text-sm text-gray-500">Reparatur-Auftrag</p>
              </div>
            </div>
            <div className="text-right">
              <div className="order-number">Nr. {order.orderNumber}</div>
              <div className="text-sm text-gray-500">{formattedDate}</div>
            </div>
          </div>
        </header>

        {/* Warning Banner */}
        <div className="warning-banner">
          <strong>DIESEN AUSDRUCK UNBEDINGT ZU DEN SCHUHEN LEGEN!</strong>
        </div>

        {/* Address Section */}
        <div className="address-section">
          <div className="address-box">
            <h3 className="address-title">Versand an:</h3>
            <p className="font-semibold">{SHOP_ADDRESS.name}</p>
            <p>{SHOP_ADDRESS.street}</p>
            <p>{SHOP_ADDRESS.zip} {SHOP_ADDRESS.city}</p>
          </div>
          <div className="address-box">
            <h3 className="address-title">Rechnung an:</h3>
            <p className="font-semibold">
              {order.salutation} {order.firstName} {order.lastName}
            </p>
            <p>{order.street} {order.houseNumber}</p>
            <p>{order.zip} {order.city}</p>
            {order.country && order.country !== 'DE' && (
              <p>{order.country}</p>
            )}
            <p className="text-sm mt-2">
              Tel: {order.phone}<br />
              E-Mail: {order.email}
            </p>
          </div>
          {!order.deliverySame && order.deliveryFirstName && (
            <div className="address-box">
              <h3 className="address-title">Lieferung an:</h3>
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
        </div>

        {/* Items Section */}
        <section className="items-section">
          <h2 className="section-title">Folgende Schuhe werden repariert:</h2>
          <table className="items-table">
            <thead>
              <tr>
                <th>Menge</th>
                <th>Hersteller</th>
                <th>Modell</th>
                <th>Größe</th>
                <th>Sohle</th>
                <th>Randgummi</th>
                <th>Verschluss</th>
                <th className="text-right">KVA</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="text-center">{Number(item.quantity)}</td>
                  <td>{item.manufacturer}</td>
                  <td>
                    {item.model}
                    {item.color && <span className="text-gray-500"> ({item.color})</span>}
                  </td>
                  <td className="text-center">{item.size}</td>
                  <td>{SOLE_NAMES[item.sole] || item.sole}</td>
                  <td>{EDGE_RUBBER_LABELS[item.edgeRubber]}</td>
                  <td className="text-center">{item.closure ? 'Ja' : '-'}</td>
                  <td className="text-right font-semibold">
                    {Number(item.calculatedPrice).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7} className="text-right font-semibold">
                  Geschätzter Gesamtpreis (KVA):
                </td>
                <td className="text-right font-bold text-lg">
                  {totalPrice.toFixed(2)} €
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* Additional Work */}
        {order.items.some(item => item.additionalWork) && (
          <section className="notes-section">
            <h3 className="section-subtitle">Zusatzarbeiten:</h3>
            {order.items.map((item) => (
              item.additionalWork && (
                <p key={item.id} className="note-item">
                  <strong>Schuh:</strong> {item.additionalWork}
                </p>
              )
            ))}
          </section>
        )}

        {/* Packstation/Lieferhinweise */}
        {(order.packstationNumber || order.postNumber || order.deliveryNotes) && (
          <section className="notes-section">
            <h3 className="section-subtitle">Hinweise zur Lieferung:</h3>
            {order.packstationNumber && (
              <p><strong>Packstation:</strong> {order.packstationNumber}</p>
            )}
            {order.postNumber && (
              <p><strong>Postnummer:</strong> {order.postNumber}</p>
            )}
            {order.deliveryNotes && (
              <p><strong>Hinweis:</strong> {order.deliveryNotes}</p>
            )}
          </section>
        )}

        {/* Shipping Info */}
        <section className="shipping-info">
          <h3 className="section-subtitle">Versandkosten (Rückversand):</h3>
          <div className="shipping-grid">
            <div className="shipping-item">
              <span className="shipping-label">Deutschland</span>
              <span className="shipping-price">7,00 €</span>
            </div>
            <div className="shipping-item">
              <span className="shipping-label">EU</span>
              <span className="shipping-price">11,00 €</span>
            </div>
            <div className="shipping-item">
              <span className="shipping-label">Non-EU</span>
              <span className="shipping-price">15,00 €</span>
            </div>
          </div>
          <p className="shipping-note">
            Die Versandkosten werden zum Gesamtpreis hinzugerechnet.
          </p>
        </section>

        {/* Footer */}
        <footer className="print-footer">
          <p>Vielen Dank für Ihren Auftrag!</p>
          <p className="text-sm text-gray-500">
            kletterschuhe.de | Franz-Gensler-Str. 7-9 | 65589 Hadamar
          </p>
        </footer>
      </div>
    </>
  );
}
