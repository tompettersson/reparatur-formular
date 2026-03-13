import { prisma } from '@/lib/prisma';
import { AdminHeader } from '../AdminHeader';
import { Card } from '@/components/ui/Card';
import { FaqList } from './FaqList';

export default async function FaqPage() {
  const faqs = await prisma.faqEntry.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <AdminHeader />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#38362d]">FAQ verwalten</h1>
          <p className="text-gray-500">Häufige Fragen im Reparaturformular</p>
        </div>

        <Card>
          <FaqList faqs={faqs.map(f => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
            isActive: f.isActive,
            sortOrder: f.sortOrder,
          }))} />
        </Card>
      </main>
    </div>
  );
}
