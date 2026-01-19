'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { OrderStatus, EdgeRubber } from '@/app/generated/prisma/client';
import { z } from 'zod';
import { sendEmail, statusUpdateEmail } from '@/lib/email';

// Status labels for emails
const STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: 'Entwurf',
  SUBMITTED: 'Eingereicht',
  RECEIVED: 'Eingetroffen',
  INSPECTED: 'Begutachtet',
  REPAIRING: 'In Reparatur',
  READY: 'Fertig',
  SHIPPED: 'Versendet',
  COMPLETED: 'Abgeschlossen',
  CANCELLED: 'Storniert',
  ON_HOLD: 'Wartend (Rückfrage)',
};

// ============================================
// Type Definitions
// ============================================

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

// ============================================
// Status Management
// ============================================

const statusChangeSchema = z.object({
  orderId: z.string(),
  newStatus: z.nativeEnum(OrderStatus),
  comment: z.string().optional(),
  trackingNumber: z.string().optional(),
  trackingCarrier: z.string().optional(),
});

export async function updateOrderStatus(
  input: z.infer<typeof statusChangeSchema>
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: 'Nicht autorisiert' };
  }

  const parsed = statusChangeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Ungültige Eingabe' };
  }

  const { orderId, newStatus, comment, trackingNumber, trackingCarrier } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        orderNumber: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!order) {
      return { success: false, error: 'Auftrag nicht gefunden' };
    }

    const fromStatus = order.status;

    // Update order status and create status change record
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      }),
      prisma.orderStatusChange.create({
        data: {
          orderId,
          fromStatus,
          toStatus: newStatus,
          comment,
          trackingNumber: newStatus === 'SHIPPED' ? trackingNumber : null,
          trackingCarrier: newStatus === 'SHIPPED' ? trackingCarrier : null,
          changedBy: session.user.email,
        },
      }),
    ]);

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');

    // Send status update email to customer (for relevant status changes)
    const emailStatuses: OrderStatus[] = ['RECEIVED', 'INSPECTED', 'REPAIRING', 'READY', 'SHIPPED', 'ON_HOLD'];
    if (emailStatuses.includes(newStatus)) {
      const emailData = statusUpdateEmail({
        orderNumber: order.orderNumber,
        customerName: `${order.firstName} ${order.lastName}`,
        email: order.email,
        newStatus,
        statusLabel: STATUS_LABELS[newStatus],
        comment,
        trackingNumber,
        trackingCarrier,
      });

      sendEmail(emailData).catch((err) =>
        console.error('Failed to send status update email:', err)
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'Fehler beim Aktualisieren des Status' };
  }
}

// ============================================
// Order Editing
// ============================================

const customerUpdateSchema = z.object({
  salutation: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  street: z.string(),
  zip: z.string(),
  city: z.string(),
  phone: z.string(),
  email: z.string().email(),
  deliverySame: z.boolean(),
  deliverySalutation: z.string().optional().nullable(),
  deliveryFirstName: z.string().optional().nullable(),
  deliveryLastName: z.string().optional().nullable(),
  deliveryStreet: z.string().optional().nullable(),
  deliveryZip: z.string().optional().nullable(),
  deliveryCity: z.string().optional().nullable(),
  stationNotes: z.string().optional().nullable(),
});

const itemUpdateSchema = z.object({
  id: z.string(),
  quantity: z.number().min(1).max(10),
  manufacturer: z.string(),
  model: z.string(),
  color: z.string().optional().nullable(),
  size: z.string(),
  sole: z.string(),
  edgeRubber: z.nativeEnum(EdgeRubber),
  closure: z.boolean(),
  additionalWork: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  calculatedPrice: z.number(),
});

const orderUpdateSchema = z.object({
  orderId: z.string(),
  customer: customerUpdateSchema,
  items: z.array(itemUpdateSchema),
  totalPrice: z.number(),
});

export async function updateOrder(
  input: z.infer<typeof orderUpdateSchema>
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, error: 'Nicht autorisiert' };
  }

  const parsed = orderUpdateSchema.safeParse(input);
  if (!parsed.success) {
    console.error('Validation error:', parsed.error);
    return { success: false, error: 'Ungültige Eingabe' };
  }

  const { orderId, customer, items, totalPrice } = parsed.data;

  try {
    // Get current order for comparison
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!currentOrder) {
      return { success: false, error: 'Auftrag nicht gefunden' };
    }

    // Track changes for history
    const historyEntries: Array<{
      orderId: string;
      field: string;
      oldValue: string | null;
      newValue: string | null;
      changedBy: string;
    }> = [];

    // Compare customer fields
    const customerFields = [
      'salutation', 'firstName', 'lastName', 'street', 'zip', 'city',
      'phone', 'email', 'deliverySame', 'deliverySalutation', 'deliveryFirstName',
      'deliveryLastName', 'deliveryStreet', 'deliveryZip', 'deliveryCity', 'stationNotes'
    ] as const;

    for (const field of customerFields) {
      const oldVal = currentOrder[field];
      const newVal = customer[field];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        historyEntries.push({
          orderId,
          field,
          oldValue: oldVal != null ? String(oldVal) : null,
          newValue: newVal != null ? String(newVal) : null,
          changedBy: session.user.email,
        });
      }
    }

    // Compare items (simplified - just note if items changed)
    const itemsChanged = JSON.stringify(currentOrder.items) !== JSON.stringify(
      items.map(i => ({
        ...i,
        calculatedPrice: i.calculatedPrice.toString(),
      }))
    );

    if (itemsChanged) {
      historyEntries.push({
        orderId,
        field: 'items',
        oldValue: JSON.stringify(currentOrder.items.map(i => ({
          manufacturer: i.manufacturer,
          model: i.model,
          quantity: i.quantity,
          calculatedPrice: Number(i.calculatedPrice),
        }))),
        newValue: JSON.stringify(items.map(i => ({
          manufacturer: i.manufacturer,
          model: i.model,
          quantity: i.quantity,
          calculatedPrice: i.calculatedPrice,
        }))),
        changedBy: session.user.email,
      });
    }

    // Perform update in transaction
    await prisma.$transaction(async (tx) => {
      // Update customer data
      await tx.order.update({
        where: { id: orderId },
        data: {
          ...customer,
          totalPrice,
        },
      });

      // Update items
      for (const item of items) {
        await tx.orderItem.update({
          where: { id: item.id },
          data: {
            quantity: item.quantity,
            manufacturer: item.manufacturer,
            model: item.model,
            color: item.color,
            size: item.size,
            sole: item.sole,
            edgeRubber: item.edgeRubber,
            closure: item.closure,
            additionalWork: item.additionalWork,
            internalNotes: item.internalNotes,
            calculatedPrice: item.calculatedPrice,
          },
        });
      }

      // Create history entries
      if (historyEntries.length > 0) {
        await tx.orderHistory.createMany({
          data: historyEntries,
        });
      }
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');

    return { success: true };
  } catch (error) {
    console.error('Error updating order:', error);
    return { success: false, error: 'Fehler beim Speichern der Änderungen' };
  }
}

// ============================================
// Fetch Order with History
// ============================================

export async function getOrderWithHistory(orderId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }

  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      history: {
        orderBy: { changedAt: 'desc' },
        take: 50,
      },
      statusChanges: {
        orderBy: { changedAt: 'desc' },
        take: 20,
      },
    },
  });
}
