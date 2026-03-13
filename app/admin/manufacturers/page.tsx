import { prisma } from '@/lib/prisma';
import { AdminHeader } from '../AdminHeader';
import { Card } from '@/components/ui/Card';
import { ManufacturerList } from './ManufacturerList';

export default async function ManufacturersPage() {
  const manufacturers = await prisma.manufacturer.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <AdminHeader />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#38362d]">Hersteller verwalten</h1>
          <p className="text-gray-500">Schuh-Hersteller für das Reparaturformular</p>
        </div>

        <Card>
          <ManufacturerList manufacturers={manufacturers.map(m => ({
            id: m.id,
            name: m.name,
            isActive: m.isActive,
            sortOrder: m.sortOrder,
          }))} />
        </Card>
      </main>
    </div>
  );
}
