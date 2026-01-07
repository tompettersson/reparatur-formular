'use client';

import { UseFormWatch } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { OrderFormData } from '@/lib/validation';
import { SOLE_PRICES, calculateItemPrice, formatPrice, SoleType, SHIPPING_COSTS } from '@/lib/pricing';

interface SummaryStepProps {
  watch: UseFormWatch<OrderFormData>;
}

export function SummaryStep({ watch }: SummaryStepProps) {
  const formData = watch();

  // Gesamtpreis berechnen
  const totalPrice = formData.items?.reduce((sum, item) => {
    if (!item.sole) return sum;
    return sum + calculateItemPrice({
      quantity: Number(item.quantity) || 1,
      sole: item.sole as SoleType,
      edgeRubber: item.edgeRubber || 'NO',
      closure: item.closure || false,
      hasAdditionalWork: !!item.additionalWork,
    });
  }, 0) || 0;

  const edgeRubberLabels = {
    YES: 'Ja',
    NO: 'Nein',
    DISCRETION: 'Nach Ermessen',
  };

  return (
    <div className="space-y-6">
      {/* Kundendaten */}
      <Card title="Ihre Daten">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-[#38362d] mb-2">Rechnungsadresse</h4>
            <address className="not-italic text-gray-600">
              {formData.salutation} {formData.firstName} {formData.lastName}<br />
              {formData.street}<br />
              {formData.zip} {formData.city}<br />
              <br />
              Tel: {formData.phone}<br />
              E-Mail: {formData.email}
            </address>
          </div>

          <div>
            <h4 className="font-semibold text-[#38362d] mb-2">Lieferadresse</h4>
            {formData.deliverySame ? (
              <p className="text-gray-600">Entspricht der Rechnungsadresse</p>
            ) : (
              <address className="not-italic text-gray-600">
                {formData.deliverySalutation} {formData.deliveryFirstName} {formData.deliveryLastName}<br />
                {formData.deliveryStreet}<br />
                {formData.deliveryZip} {formData.deliveryCity}
              </address>
            )}
          </div>
        </div>

        {formData.stationNotes && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold text-[#38362d] mb-2">Zusätzliche Hinweise</h4>
            <p className="text-gray-600">{formData.stationNotes}</p>
          </div>
        )}
      </Card>

      {/* Schuhe / Positionen */}
      <Card title="Ihre Schuhe">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-semibold text-[#38362d]">Anz.</th>
                <th className="text-left py-2 text-sm font-semibold text-[#38362d]">Hersteller</th>
                <th className="text-left py-2 text-sm font-semibold text-[#38362d]">Modell</th>
                <th className="text-left py-2 text-sm font-semibold text-[#38362d]">Größe</th>
                <th className="text-left py-2 text-sm font-semibold text-[#38362d]">Sohle</th>
                <th className="text-left py-2 text-sm font-semibold text-[#38362d]">Rand</th>
                <th className="text-left py-2 text-sm font-semibold text-[#38362d]">Verschl.</th>
                <th className="text-right py-2 text-sm font-semibold text-[#38362d]">KVA</th>
              </tr>
            </thead>
            <tbody>
              {formData.items?.map((item, index) => {
                const soleInfo = SOLE_PRICES[item.sole as SoleType];
                const itemPrice = item.sole ? calculateItemPrice({
                  quantity: Number(item.quantity) || 1,
                  sole: item.sole as SoleType,
                  edgeRubber: item.edgeRubber || 'NO',
                  closure: item.closure || false,
                  hasAdditionalWork: !!item.additionalWork,
                }) : 0;

                return (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 text-gray-600">{item.quantity}</td>
                    <td className="py-3 text-gray-600">{item.manufacturer}</td>
                    <td className="py-3 text-gray-600">
                      {item.model}
                      {item.color && <span className="text-gray-400"> ({item.color})</span>}
                    </td>
                    <td className="py-3 text-gray-600">{item.size}</td>
                    <td className="py-3 text-gray-600">{soleInfo?.label || item.sole}</td>
                    <td className="py-3 text-gray-600">{edgeRubberLabels[item.edgeRubber as keyof typeof edgeRubberLabels]}</td>
                    <td className="py-3 text-gray-600">{item.closure ? 'Ja' : 'Nein'}</td>
                    <td className="py-3 text-right font-semibold text-[#ef6a27]">{formatPrice(itemPrice)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#ef6a27]">
                <td colSpan={7} className="py-4 text-right font-bold text-lg text-[#38362d]">
                  Gesamtsumme (KVA):
                </td>
                <td className="py-4 text-right font-bold text-xl text-[#ef6a27]">
                  {formatPrice(totalPrice)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Zusatzarbeiten & Bemerkungen */}
        {formData.items?.some(item => item.additionalWork || item.internalNotes) && (
          <div className="mt-4 pt-4 border-t space-y-2">
            {formData.items.map((item, index) => (
              (item.additionalWork || item.internalNotes) && (
                <div key={index} className="text-sm">
                  <span className="font-semibold">Schuh {index + 1}:</span>
                  {item.additionalWork && <span className="text-gray-600"> Zusatz: {item.additionalWork}</span>}
                  {item.internalNotes && <span className="text-gray-400"> | Bemerkung: {item.internalNotes}</span>}
                </div>
              )
            ))}
          </div>
        )}
      </Card>

      {/* Versandkosten Info */}
      <Card title="Versandkosten (Info)" className="bg-blue-50 border-blue-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-semibold text-[#38362d]">Deutschland</p>
            <p className="text-gray-600 text-sm">Versandlabel: {SHIPPING_COSTS.germany.label}€</p>
            <p className="text-gray-600 text-sm">Rückversand: {SHIPPING_COSTS.germany.return}€</p>
          </div>
          <div>
            <p className="font-semibold text-[#38362d]">EU</p>
            <p className="text-gray-600 text-sm">Versandlabel: {SHIPPING_COSTS.eu.label}€</p>
            <p className="text-gray-600 text-sm">Rückversand: {SHIPPING_COSTS.eu.return}€</p>
          </div>
          <div>
            <p className="font-semibold text-[#38362d]">Nicht-EU</p>
            <p className="text-gray-600 text-sm">Versandlabel: {SHIPPING_COSTS.nonEu.label}€</p>
            <p className="text-gray-600 text-sm">Rückversand: {SHIPPING_COSTS.nonEu.return}€</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Die Versandkosten sind nicht im Kostenvoranschlag enthalten.
        </p>
      </Card>

      {/* Hinweis */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="font-semibold text-yellow-800">Wichtiger Hinweis</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Bitte drucken Sie nach dem Absenden den Auftragszettel aus und legen Sie ihn unbedingt zu Ihren Schuhen!
              Der endgültige Preis kann je nach tatsächlichem Reparaturaufwand abweichen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
