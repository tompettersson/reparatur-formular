'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ManufacturerForm } from './ManufacturerForm';

interface Manufacturer {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

interface ManufacturerListProps {
  manufacturers: Manufacturer[];
}

export function ManufacturerList({ manufacturers }: ManufacturerListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editManufacturer, setEditManufacturer] = useState<Manufacturer | undefined>();

  const handleEdit = (mfr: Manufacturer) => {
    setEditManufacturer(mfr);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditManufacturer(undefined);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">
          {manufacturers.filter(m => m.isActive).length} aktive Hersteller
        </p>
        <Button onClick={() => setShowForm(true)} size="sm">
          + Hersteller hinzufügen
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Name</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Sortierung</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600 text-sm">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {manufacturers.map((mfr) => (
              <tr key={mfr.id} className={`border-b border-gray-100 hover:bg-gray-50 ${!mfr.isActive ? 'opacity-50' : ''}`}>
                <td className="py-3 px-4 font-semibold">{mfr.name}</td>
                <td className="py-3 px-4 text-center text-gray-500">{mfr.sortOrder}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    mfr.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {mfr.isActive ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(mfr)}>
                    Bearbeiten
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {manufacturers.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Keine Hersteller vorhanden. Bitte Seed-Script ausführen.
        </p>
      )}

      {showForm && (
        <ManufacturerForm manufacturer={editManufacturer} onClose={handleClose} />
      )}
    </>
  );
}
