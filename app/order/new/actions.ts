'use server';

import { prisma } from '@/lib/prisma';
import { orderSchema, OrderFormData } from '@/lib/validation';
import { calculateItemPrice } from '@/lib/pricing';
import { revalidatePath } from 'next/cache';
import { searchProducts } from '@/lib/shopware';
import type { ProductSuggestion } from '@/lib/shopware';
import { redirect } from 'next/navigation';
import {
  sendEmail,
  orderConfirmationEmail,
  adminNewOrderEmail,
} from '@/lib/email';

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
        houseNumber: validatedData.houseNumber,
        zip: validatedData.zip,
        city: validatedData.city,
        country: validatedData.country,
        phone: validatedData.phone,
        email: validatedData.email,

        // Lieferadresse
        deliverySame: validatedData.deliverySame,
        deliverySalutation: validatedData.deliverySalutation,
        deliveryFirstName: validatedData.deliveryFirstName,
        deliveryLastName: validatedData.deliveryLastName,
        deliveryStreet: validatedData.deliveryStreet,
        deliveryHouseNumber: validatedData.deliveryHouseNumber,
        deliveryZip: validatedData.deliveryZip,
        deliveryCity: validatedData.deliveryCity,
        deliveryCountry: validatedData.deliveryCountry,

        // Packstation/DHL (NEU: separate Felder)
        packstationNumber: validatedData.packstationNumber,
        postNumber: validatedData.postNumber,
        deliveryNotes: validatedData.deliveryNotes,

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
            sole: item.sole || '', // Kann leer sein bei "Profis machen lassen"
            edgeRubber: item.edgeRubber,
            closure: item.closure,
            disinfection: item.disinfection,
            trustProfessionals: item.trustProfessionals,
            additionalWork: item.additionalWork,
            internalNotes: item.internalNotes,
            calculatedPrice: calculateItemPrice({
              quantity: item.quantity,
              sole: item.sole as any,
              edgeRubber: item.edgeRubber,
              closure: item.closure,
              disinfection: item.disinfection,
              trustProfessionals: item.trustProfessionals,
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

    // Send confirmation emails (non-blocking)
    const baseUrl = process.env.NEXTAUTH_URL || 'https://reparatur.kletterschuhe.de';
    const emailData = {
      orderNumber: order.orderNumber,
      customerName: `${validatedData.firstName} ${validatedData.lastName}`,
      email: validatedData.email,
      items: order.items.map((item) => ({
        quantity: Number(item.quantity),
        manufacturer: item.manufacturer,
        model: item.model,
        calculatedPrice: Number(item.calculatedPrice),
      })),
      totalPrice,
      printUrl: `${baseUrl}/order/${order.id}/print`,
    };

    // Send customer confirmation email
    const customerEmail = orderConfirmationEmail(emailData);
    sendEmail(customerEmail).catch((err) =>
      console.error('Failed to send customer confirmation:', err)
    );

    // Send admin notification (if configured)
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      const adminNotification = adminNewOrderEmail(emailData, adminEmail);
      sendEmail(adminNotification).catch((err) =>
        console.error('Failed to send admin notification:', err)
      );
    }

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

// Kundendaten für E-Mail-Autofill
export type CustomerData = {
  found: boolean;
  firstName?: string;
  lastName?: string;
  salutation?: string;
  street?: string;
  houseNumber?: string;
  zip?: string;
  city?: string;
  country?: string;
  phone?: string;
  deliverySame?: boolean;
  deliverySalutation?: string;
  deliveryFirstName?: string;
  deliveryLastName?: string;
  deliveryStreet?: string;
  deliveryHouseNumber?: string;
  deliveryZip?: string;
  deliveryCity?: string;
  deliveryCountry?: string;
};

export async function findCustomerByEmail(email: string): Promise<CustomerData> {
  try {
    // Validate email format
    if (!email || !email.includes('@')) {
      return { found: false };
    }

    // Find most recent submitted order for this email
    const order = await prisma.order.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        status: 'SUBMITTED', // Only look at submitted orders, not drafts
      },
      orderBy: { createdAt: 'desc' },
      select: {
        salutation: true,
        firstName: true,
        lastName: true,
        street: true,
        houseNumber: true,
        zip: true,
        city: true,
        country: true,
        phone: true,
        deliverySame: true,
        deliverySalutation: true,
        deliveryFirstName: true,
        deliveryLastName: true,
        deliveryStreet: true,
        deliveryHouseNumber: true,
        deliveryZip: true,
        deliveryCity: true,
        deliveryCountry: true,
      },
    });

    if (!order) {
      return { found: false };
    }

    return {
      found: true,
      salutation: order.salutation,
      firstName: order.firstName,
      lastName: order.lastName,
      street: order.street,
      houseNumber: order.houseNumber,
      zip: order.zip,
      city: order.city,
      country: order.country,
      phone: order.phone,
      deliverySame: order.deliverySame,
      deliverySalutation: order.deliverySalutation || undefined,
      deliveryFirstName: order.deliveryFirstName || undefined,
      deliveryLastName: order.deliveryLastName || undefined,
      deliveryStreet: order.deliveryStreet || undefined,
      deliveryHouseNumber: order.deliveryHouseNumber || undefined,
      deliveryZip: order.deliveryZip || undefined,
      deliveryCity: order.deliveryCity || undefined,
      deliveryCountry: order.deliveryCountry || undefined,
    };
  } catch (error) {
    console.error('Error finding customer:', error);
    return { found: false };
  }
}


/**
 * Suche nach Produkten im kletterschuhe.de Shop
 * READ-ONLY - Nur für Produktvorschläge im Formular
 *
 * @param manufacturer - Hersteller (z.B. "La Sportiva")
 * @param query - Suchbegriff (z.B. "Solution")
 * @returns Array von Produktvorschlägen
 */
export async function searchShopwareProducts(
  manufacturer: string,
  query: string
): Promise<ProductSuggestion[]> {
  try {
    // Mindestens 2 Zeichen für Suche
    if (!query || query.length < 2) {
      return [];
    }

    const suggestions = await searchProducts(manufacturer, query);
    return suggestions;
  } catch (error) {
    console.error('Error searching Shopware products:', error);
    return [];
  }
}
