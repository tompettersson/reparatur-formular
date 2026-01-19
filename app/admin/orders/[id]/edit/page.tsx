import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { AdminHeader } from '../../../AdminHeader';
import { OrderEditForm } from './OrderEditForm';

interface EditOrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  // Prevent editing completed or cancelled orders
  if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
    redirect(`/admin/orders/${id}`);
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <AdminHeader />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href={`/admin/orders/${id}`}
          className="inline-flex items-center text-gray-600 hover:text-[#ef6a27] mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zum Auftrag
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#38362d]">
            Auftrag #{order.orderNumber} bearbeiten
          </h1>
          <p className="text-gray-500">Änderungen werden im Protokoll erfasst</p>
        </div>

        <OrderEditForm order={order} />
      </main>
    </div>
  );
}
