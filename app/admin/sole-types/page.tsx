import { prisma } from '@/lib/prisma';
import { AdminHeader } from '../AdminHeader';
import { Card } from '@/components/ui/Card';
import { SoleTypeList } from './SoleTypeList';

export default async function SoleTypesPage() {
  const soleTypes = await prisma.soleType.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <AdminHeader />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#38362d]">Gummisorten verwalten</h1>
          <p className="text-gray-500">Sohlen-Materialien und Preise für das Reparaturformular</p>
        </div>

        <Card>
          <SoleTypeList soleTypes={soleTypes.map(s => ({
            id: s.id,
            key: s.key,
            label: s.label,
            price: Number(s.price),
            thickness: s.thickness,
            isActive: s.isActive,
            sortOrder: s.sortOrder,
          }))} />
        </Card>
      </main>
    </div>
  );
}
