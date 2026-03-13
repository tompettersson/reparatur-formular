import { prisma } from '@/lib/prisma';
import { AdminHeader } from '../AdminHeader';
import { Card } from '@/components/ui/Card';
import { CountryList } from './CountryList';

export default async function CountriesPage() {
  const countries = await prisma.country.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <AdminHeader />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#38362d]">Länder verwalten</h1>
          <p className="text-gray-500">Versandländer und PLZ-Validierung</p>
        </div>

        <Card>
          <CountryList countries={countries.map(c => ({
            id: c.id,
            code: c.code,
            label: c.label,
            zipPattern: c.zipPattern,
            isActive: c.isActive,
            sortOrder: c.sortOrder,
          }))} />
        </Card>
      </main>
    </div>
  );
}
