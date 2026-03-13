'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { createCountry, updateCountry } from './actions';

interface CountryFormProps {
  country?: {
    id: string;
    code: string;
    label: string;
    zipPattern: string;
    isActive: boolean;
    sortOrder: number;
  };
  onClose: () => void;
}

export function CountryForm({ country, onClose }: CountryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [testZip, setTestZip] = useState('');
  const [zipPattern, setZipPattern] = useState(country?.zipPattern || '');

  const testRegex = () => {
    if (!testZip || !zipPattern) return null;
    try {
      const regex = new RegExp(zipPattern);
      return regex.test(testZip);
    } catch {
      return false;
    }
  };

  const regexResult = testRegex();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = country
        ? await updateCountry(country.id, formData)
        : await createCountry(formData);

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
          {country ? 'Land bearbeiten' : 'Neues Land hinzufügen'}
        </h2>

        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ländercode (ISO)"
              name="code"
              defaultValue={country?.code || ''}
              placeholder="DE"
              maxLength={2}
              required
              disabled={!!country}
            />
            <Input
              label="Sortierung"
              name="sortOrder"
              type="number"
              defaultValue={String(country?.sortOrder ?? 0)}
            />
          </div>

          <Input
            label="Bezeichnung"
            name="label"
            defaultValue={country?.label || ''}
            placeholder="Deutschland"
            required
          />

          <div>
            <Input
              label="PLZ-Regex"
              name="zipPattern"
              value={zipPattern}
              onChange={(e) => setZipPattern(e.target.value)}
              placeholder="^\d{5}$"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Regulärer Ausdruck zur PLZ-Validierung, z.B. {'^\\'}{`d{5}$`} für 5-stellige PLZ
            </p>
          </div>

          {/* Regex Tester */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1">PLZ testen</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={testZip}
                onChange={(e) => setTestZip(e.target.value)}
                placeholder="z.B. 12345"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#ef6a27] focus:outline-none"
              />
              {testZip && regexResult !== null && (
                <span className={`text-sm font-semibold ${regexResult ? 'text-green-600' : 'text-red-600'}`}>
                  {regexResult ? 'Gültig' : 'Ungültig'}
                </span>
              )}
            </div>
          </div>

          {country && (
            <div className="pt-2">
              <input type="hidden" name="isActive" value={String(country.isActive)} />
              <Checkbox
                label="Aktiv"
                description="Deaktivierte Länder werden im Formular nicht angezeigt"
                defaultChecked={country.isActive}
                onChange={(e) => {
                  const hidden = e.target.closest('form')?.querySelector('input[name="isActive"]') as HTMLInputElement;
                  if (hidden) hidden.value = String(e.target.checked);
                }}
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
              {isPending ? 'Speichern...' : country ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
