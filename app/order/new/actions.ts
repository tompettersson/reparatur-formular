'use server';

import { prisma } from '@/lib/prisma';
import { orderSchema, OrderFormData } from '@/lib/validation';
import { calculateItemPrice } from '@/lib/pricing';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type ActionResult = {
  success: boolean;
  error?: string;
  orderId?: string;
};

// Auftrag erstellen
export async function createOrder(formData: OrderFormData): Promise<ActionResult> {
  try {
    // Validierung
    const validatedData = orderSchema.parse(formData);

    // Auftrag mit Positionen erstellen
    const order = await prisma.order.create({
      data: {
        // Kundendaten
        salutation: validatedData.salutation,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        street: validatedData.street,
        zip: validatedData.zip,
        city: validatedData.city,
        phone: validatedData.phone,
        email: validatedData.email,

        // Lieferadresse
        deliverySame: validatedData.deliverySame,
        deliverySalutation: validatedData.deliverySalutation,
        deliveryFirstName: validatedData.deliveryFirstName,
        deliveryLastName: validatedData.deliveryLastName,
        deliveryStreet: validatedData.deliveryStreet,
        deliveryZip: validatedData.deliveryZip,
        deliveryCity: validatedData.deliveryCity,

        // Zusatz
        stationNotes: validatedData.stationNotes,

        // Einwilligungen
        gdprAccepted: Boolean(validatedData.gdprAccepted),
        agbAccepted: Boolean(validatedData.agbAccepted),
        newsletter: Boolean(validatedData.newsletter),

        // Status
        status: 'SUBMITTED',

        // Positionen
        items: {
          create: validatedData.items.map((item) => ({
            quantity: item.quantity,
            manufacturer: item.manufacturer,
            model: item.model,
            color: item.color || '',
            size: item.size,
            sole: item.sole,
            edgeRubber: item.edgeRubber,
            closure: item.closure,
            additionalWork: item.additionalWork,
            internalNotes: item.internalNotes,
            calculatedPrice: calculateItemPrice({
              quantity: item.quantity,
              sole: item.sole as any,
              edgeRubber: item.edgeRubber,
              closure: item.closure,
              hasAdditionalWork: !!item.additionalWork,
            }),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Gesamtpreis berechnen und speichern
    const totalPrice = order.items.reduce(
      (sum, item) => sum + Number(item.calculatedPrice),
      0
    );

    await prisma.order.update({
      where: { id: order.id },
      data: { totalPrice },
    });

    revalidatePath('/admin/orders');

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Error creating order:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten' };
  }
}

// Auftrag als Draft speichern (für Session-Recovery)
export async function saveDraft(formData: Partial<OrderFormData>): Promise<ActionResult> {
  try {
    // Minimale Validierung für Draft
    if (!formData.email) {
      return { success: false, error: 'E-Mail-Adresse wird benötigt' };
    }

    const order = await prisma.order.create({
      data: {
        salutation: formData.salutation || 'Herr',
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        street: formData.street || '',
        zip: formData.zip || '',
        city: formData.city || '',
        phone: formData.phone || '',
        email: formData.email,
        deliverySame: formData.deliverySame ?? true,
        gdprAccepted: Boolean(formData.gdprAccepted) || false,
        agbAccepted: Boolean(formData.agbAccepted) || false,
        newsletter: Boolean(formData.newsletter) || false,
        status: 'DRAFT',
      },
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Error saving draft:', error);
    return { success: false, error: 'Draft konnte nicht gespeichert werden' };
  }
}

// Auftrag abrufen
export async function getOrder(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}
