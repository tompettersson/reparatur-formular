import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AdminHeader } from '../AdminHeader';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Entwurf', color: 'bg-gray-100 text-gray-700' },
  SUBMITTED: { label: 'Eingereicht', color: 'bg-blue-100 text-blue-700' },
  RECEIVED: { label: 'Eingetroffen', color: 'bg-indigo-100 text-indigo-700' },
  INSPECTED: { label: 'Begutachtet', color: 'bg-purple-100 text-purple-700' },
  REPAIRING: { label: 'In Reparatur', color: 'bg-yellow-100 text-yellow-800' },
  READY: { label: 'Fertig', color: 'bg-green-100 text-green-700' },
  SHIPPED: { label: 'Versendet', color: 'bg-teal-100 text-teal-700' },
  COMPLETED: { label: 'Abgeschlossen', color: 'bg-green-600 text-white' },
  CANCELLED: { label: 'Storniert', color: 'bg-red-100 text-red-700' },
  ON_HOLD: { label: 'Rückfrage', color: 'bg-orange-100 text-orange-700' },
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalOrders = orders.length;
  const submittedOrders = orders.filter((o) => o.status === 'SUBMITTED').length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.totalPrice ? Number(order.totalPrice) : 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#ef6a27]">{totalOrders}</p>
              <p className="text-sm text-gray-500">Aufträge gesamt</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{submittedOrders}</p>
              <p className="text-sm text-gray-500">Eingereicht</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#3ca1ac]">
                {new Intl.NumberFormat('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(totalRevenue)}
              </p>
              <p className="text-sm text-gray-500">Umsatz (KVA)</p>
            </div>
          </Card>
        </div>

        {/* Orders Table */}
        <Card title="Aufträge">
          {orders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Noch keine Aufträge vorhanden.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Nr.</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Kunde</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Datum</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Schuhe</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">KVA</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#ef6a27]">
                          #{order.orderNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold">
                            {order.firstName} {order.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{order.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Intl.DateTimeFormat('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(order.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            STATUS_LABELS[order.status]?.color || 'bg-gray-100'
                          }`}
                        >
                          {STATUS_LABELS[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">{order.items.length} Paar</span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {order.totalPrice
                          ? new Intl.NumberFormat('de-DE', {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(Number(order.totalPrice))
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              Details
                            </Button>
                          </Link>
                          <Link href={`/order/${order.id}/print`} target="_blank">
                            <Button variant="ghost" size="sm">
                              Drucken
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
