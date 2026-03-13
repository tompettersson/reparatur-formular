'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { updatePriceSettings } from './actions';

interface PriceSettingsFormProps {
  settings: Record<string, number>;
}

export function PriceSettingsForm({ settings }: PriceSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updatePriceSettings(formData);
      if (result.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Unbekannter Fehler');
      }
    });
  };

  return (
    <form action={handleSubmit}>
      {/* Zusatzleistungen */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#38362d] mb-4 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Zusatzleistungen (Preise in EUR)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Randgummi"
            name="edgeRubber"
            type="number"
            step="0.01"
            min="0"
            defaultValue={String(settings['edgeRubber'] ?? 19)}
            required
          />
          <Input
            label="Verschluss (Paarpreis)"
            name="closure"
            type="number"
            step="0.01"
            min="0"
            defaultValue={String(settings['closure'] ?? 20)}
            required
          />
          <Input
            label="Desinfektion (pro Paar)"
            name="disinfection"
            type="number"
            step="0.01"
            min="0"
            defaultValue={String(settings['disinfection'] ?? 3)}
            required
          />
        </div>
      </div>

      {/* Versandkosten */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#38362d] mb-4 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          Versandkosten (Preise in EUR)
        </h2>

        <div className="space-y-4">
          {/* Deutschland */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Deutschland</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Versandlabel (Einsenden)"
                name="shipping_de_label"
                type="number"
                step="0.01"
                min="0"
                defaultValue={String(settings['shipping_de_label'] ?? 7)}
                required
              />
              <Input
                label="Rückversand"
                name="shipping_de_return"
                type="number"
                step="0.01"
                min="0"
                defaultValue={String(settings['shipping_de_return'] ?? 7)}
                required
              />
            </div>
          </div>

          {/* EU */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">EU-Länder</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Versandlabel (Einsenden)"
                name="shipping_eu_label"
                type="number"
                step="0.01"
                min="0"
                defaultValue={String(settings['shipping_eu_label'] ?? 15)}
                required
              />
              <Input
                label="Rückversand"
                name="shipping_eu_return"
                type="number"
                step="0.01"
                min="0"
                defaultValue={String(settings['shipping_eu_return'] ?? 11)}
                required
              />
            </div>
          </div>

          {/* Non-EU */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Nicht-EU / Schweiz</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Versandlabel (Einsenden)"
                name="shipping_noneu_label"
                type="number"
                step="0.01"
                min="0"
                defaultValue={String(settings['shipping_noneu_label'] ?? 15)}
                required
              />
              <Input
                label="Rückversand"
                name="shipping_noneu_return"
                type="number"
                step="0.01"
                min="0"
                defaultValue={String(settings['shipping_noneu_return'] ?? 15)}
                required
              />
            </div>
          </div>

          {/* Free return threshold */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Sonstiges</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Kostenfreier Rückversand ab (Paare)"
                name="shipping_free_return_min_pairs"
                type="number"
                step="1"
                min="1"
                defaultValue={String(settings['shipping_free_return_min_pairs'] ?? 3)}
                hint="Ab dieser Anzahl Paare ist der Rückversand innerhalb DE kostenlos"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">
          Preise erfolgreich gespeichert!
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Speichern...' : 'Preise speichern'}
        </Button>
      </div>
    </form>
  );
}
