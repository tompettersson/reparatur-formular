'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { createSoleType, updateSoleType, checkSoleTypeUsage } from './actions';

interface SoleTypeFormProps {
  soleType?: {
    id: string;
    key: string;
    label: string;
    price: number;
    thickness: string;
    isActive: boolean;
    sortOrder: number;
  };
  onClose: () => void;
}

export function SoleTypeForm({ soleType, onClose }: SoleTypeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deactivateWarning, setDeactivateWarning] = useState<string | null>(null);

  const handleActiveChange = async (checked: boolean) => {
    if (!checked && soleType) {
      const count = await checkSoleTypeUsage(soleType.key);
      if (count > 0) {
        setDeactivateWarning(`Achtung: ${count} bestehende Aufträge verwenden diese Gummisorte. Sie werden davon nicht betroffen, aber neue Aufträge können sie nicht mehr auswählen.`);
      } else {
        setDeactivateWarning(null);
      }
    } else {
      setDeactivateWarning(null);
    }
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = soleType
        ? await updateSoleType(soleType.id, formData)
        : await createSoleType(formData);

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
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-[#38362d] mb-6">
          {soleType ? 'Gummisorte bearbeiten' : 'Neue Gummisorte hinzufügen'}
        </h2>

        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Schlüssel (Key)"
              name="key"
              defaultValue={soleType?.key || ''}
              placeholder="vibram_xs_grip"
              required
              disabled={!!soleType}
              hint="Wird in der Datenbank gespeichert, nicht änderbar"
            />
            <Input
              label="Sortierung"
              name="sortOrder"
              type="number"
              defaultValue={String(soleType?.sortOrder ?? 0)}
            />
          </div>

          <Input
            label="Bezeichnung"
            name="label"
            defaultValue={soleType?.label || ''}
            placeholder="Vibram XS Grip"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Preis (EUR)"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={String(soleType?.price ?? '')}
              placeholder="32.00"
              required
            />
            <Input
              label="Stärke"
              name="thickness"
              defaultValue={soleType?.thickness || ''}
              placeholder="4mm"
              required
            />
          </div>

          {soleType && (
            <div className="pt-2">
              <input type="hidden" name="isActive" value={String(soleType.isActive)} />
              <Checkbox
                label="Aktiv"
                description="Deaktivierte Gummisorten werden im Formular nicht angezeigt"
                defaultChecked={soleType.isActive}
                onChange={(e) => {
                  const hidden = e.target.closest('form')?.querySelector('input[name="isActive"]') as HTMLInputElement;
                  if (hidden) hidden.value = String(e.target.checked);
                  handleActiveChange(e.target.checked);
                }}
              />
            </div>
          )}

          {deactivateWarning && (
            <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
              {deactivateWarning}
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
              {isPending ? 'Speichern...' : soleType ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
