'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { createFaq, updateFaq } from './actions';

interface FaqFormProps {
  faq?: {
    id: string;
    question: string;
    answer: string;
    isActive: boolean;
    sortOrder: number;
  };
  onClose: () => void;
}

export function FaqForm({ faq, onClose }: FaqFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = faq
        ? await updateFaq(faq.id, formData)
        : await createFaq(formData);

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
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
        <h2 className="text-xl font-bold text-[#38362d] mb-6">
          {faq ? 'FAQ bearbeiten' : 'Neuen FAQ-Eintrag hinzufügen'}
        </h2>

        <form action={handleSubmit} className="space-y-4">
          <Input
            label="Frage"
            name="question"
            defaultValue={faq?.question || ''}
            placeholder="z.B. Wie läuft der Versand ab?"
            required
          />

          <div>
            <label className="block text-sm font-semibold text-[#38362d] mb-2">
              Antwort<span className="text-[#ef6a27] ml-0.5">*</span>
            </label>
            <textarea
              name="answer"
              defaultValue={faq?.answer || ''}
              rows={6}
              required
              placeholder="Die Antwort kann auch HTML enthalten..."
              className="w-full px-4 py-3 rounded-[10px] bg-white text-[#38362d] placeholder-[#a8a29e] border-2 border-[#e7e5e4] transition-all duration-300 hover:border-[#d6d3d1] focus:border-[#ef6a27] focus:ring-4 focus:ring-[#ef6a27]/10 focus:outline-none resize-vertical"
            />
            <p className="text-xs text-gray-500 mt-1">
              Einfacher Text oder HTML. Wird im Formular als Text angezeigt.
            </p>
          </div>

          <Input
            label="Sortierung"
            name="sortOrder"
            type="number"
            defaultValue={String(faq?.sortOrder ?? 0)}
            hint="Niedrigere Zahlen erscheinen weiter oben"
          />

          {faq && (
            <div className="pt-2">
              <input type="hidden" name="isActive" value={String(faq.isActive)} />
              <Checkbox
                label="Aktiv"
                description="Deaktivierte FAQ-Einträge werden im Formular nicht angezeigt"
                defaultChecked={faq.isActive}
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
              {isPending ? 'Speichern...' : faq ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
