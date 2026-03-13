'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CountryForm } from './CountryForm';
import { deleteCountry } from './actions';

interface Country {
  id: string;
  code: string;
  label: string;
  zipPattern: string;
  isActive: boolean;
  sortOrder: number;
}

interface CountryListProps {
  countries: Country[];
}

export function CountryList({ countries }: CountryListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editCountry, setEditCountry] = useState<Country | undefined>();

  const handleEdit = (country: Country) => {
    setEditCountry(country);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditCountry(undefined);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">
          {countries.filter(c => c.isActive).length} aktive Länder
        </p>
        <Button onClick={() => setShowForm(true)} size="sm">
          + Land hinzufügen
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Code</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Bezeichnung</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">PLZ-Regex</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Sortierung</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600 text-sm">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {countries.map((country) => (
              <tr key={country.id} className={`border-b border-gray-100 hover:bg-gray-50 ${!country.isActive ? 'opacity-50' : ''}`}>
                <td className="py-3 px-4">
                  <span className="font-mono font-bold text-[#ef6a27]">{country.code}</span>
                </td>
                <td className="py-3 px-4 font-semibold">{country.label}</td>
                <td className="py-3 px-4">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{country.zipPattern}</code>
                </td>
                <td className="py-3 px-4 text-center text-gray-500">{country.sortOrder}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    country.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {country.isActive ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(country)}>
                    Bearbeiten
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {countries.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Keine Länder vorhanden. Bitte Seed-Script ausführen.
        </p>
      )}

      {showForm && (
        <CountryForm country={editCountry} onClose={handleClose} />
      )}
    </>
  );
}
