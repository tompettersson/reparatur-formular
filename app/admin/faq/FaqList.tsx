'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FaqForm } from './FaqForm';

interface Faq {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
}

interface FaqListProps {
  faqs: Faq[];
}

export function FaqList({ faqs }: FaqListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editFaq, setEditFaq] = useState<Faq | undefined>();

  const handleEdit = (faq: Faq) => {
    setEditFaq(faq);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditFaq(undefined);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">
          {faqs.filter(f => f.isActive).length} aktive FAQ-Einträge
        </p>
        <Button onClick={() => setShowForm(true)} size="sm">
          + FAQ hinzufügen
        </Button>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className={`p-4 rounded-lg border ${
              faq.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[#38362d]">{faq.question}</h3>
                  <span className="text-xs text-gray-400">#{faq.sortOrder}</span>
                  {!faq.isActive && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                      Inaktiv
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{faq.answer}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleEdit(faq)}>
                Bearbeiten
              </Button>
            </div>
          </div>
        ))}
      </div>

      {faqs.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Keine FAQ-Einträge vorhanden. Bitte Seed-Script ausführen.
        </p>
      )}

      {showForm && (
        <FaqForm faq={editFaq} onClose={handleClose} />
      )}
    </>
  );
}
