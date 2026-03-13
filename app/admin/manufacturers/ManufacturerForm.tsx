'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { createManufacturer, updateManufacturer } from './actions';

interface ManufacturerFormProps {
  manufacturer?: {
    id: string;
    name: string;
    isActive: boolean;
    sortOrder: number;
  };
  onClose: () => void;
}

export function ManufacturerForm({ manufacturer, onClose }: ManufacturerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(manufacturer?.isActive ?? true);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = manufacturer
        ? await updateManufacturer(manufacturer.id, formData)
        : await createManufacturer(formData);

      if (result.success) {
        onClose();
        router.refresh();
      } else {
        setError(result.error || 'Unbekannter Fehler');
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-[#38362d] mb-6">
          {manufacturer ? 'Hersteller bearbeiten' : 'Neuen Hersteller hinzufügen'}
        </h2>

        <form action={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            defaultValue={manufacturer?.name || ''}
            placeholder="z.B. La Sportiva"
            required
          />

          <Input
            label="Sortierung"
            name="sortOrder"
            type="number"
            defaultValue={String(manufacturer?.sortOrder ?? 0)}
            hint="Niedrigere Zahlen erscheinen weiter oben. 'Andere' sollte immer 999 sein."
          />

          {manufacturer && (
            <div className="pt-2">
              <input type="hidden" name="isActive" value={String(isActive)} />
              <Checkbox
                label="Aktiv"
                description="Deaktivierte Hersteller werden im Formular nicht angezeigt"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Speichern...' : manufacturer ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
