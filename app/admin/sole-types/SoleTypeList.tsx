'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SoleTypeForm } from './SoleTypeForm';

interface SoleType {
  id: string;
  key: string;
  label: string;
  price: number;
  thickness: string;
  isActive: boolean;
  sortOrder: number;
}

interface SoleTypeListProps {
  soleTypes: SoleType[];
}

export function SoleTypeList({ soleTypes }: SoleTypeListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editSoleType, setEditSoleType] = useState<SoleType | undefined>();

  const handleEdit = (st: SoleType) => {
    setEditSoleType(st);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditSoleType(undefined);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">
          {soleTypes.filter(s => s.isActive).length} aktive Gummisorten
        </p>
        <Button onClick={() => setShowForm(true)} size="sm">
          + Gummisorte hinzufügen
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Key</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Bezeichnung</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600 text-sm">Preis</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Stärke</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Sort.</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600 text-sm">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {soleTypes.map((st) => (
              <tr key={st.id} className={`border-b border-gray-100 hover:bg-gray-50 ${!st.isActive ? 'opacity-50' : ''}`}>
                <td className="py-3 px-4">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{st.key}</code>
                </td>
                <td className="py-3 px-4 font-semibold">{st.label}</td>
                <td className="py-3 px-4 text-right font-mono text-[#ef6a27] font-semibold">
                  {formatPrice(st.price)}
                </td>
                <td className="py-3 px-4 text-center text-gray-500">{st.thickness}</td>
                <td className="py-3 px-4 text-center text-gray-500">{st.sortOrder}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    st.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {st.isActive ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(st)}>
                    Bearbeiten
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {soleTypes.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Keine Gummisorten vorhanden. Bitte Seed-Script ausführen.
        </p>
      )}

      {showForm && (
        <SoleTypeForm soleType={editSoleType} onClose={handleClose} />
      )}
    </>
  );
}
