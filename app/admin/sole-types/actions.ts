'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type SoleTypeActionResult = {
  success: boolean;
  error?: string;
  orderCount?: number;
};

export async function createSoleType(formData: FormData): Promise<SoleTypeActionResult> {
  try {
    const key = (formData.get('key') as string)?.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const label = (formData.get('label') as string)?.trim();
    const price = parseFloat(formData.get('price') as string);
    const thickness = (formData.get('thickness') as string)?.trim();
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;

    if (!key || key.length < 2) {
      return { success: false, error: 'Schlüssel muss mindestens 2 Zeichen haben' };
    }
    if (!label) {
      return { success: false, error: 'Bezeichnung ist erforderlich' };
    }
    if (isNaN(price) || price < 0) {
      return { success: false, error: 'Ungültiger Preis' };
    }
    if (!thickness) {
      return { success: false, error: 'Stärke ist erforderlich' };
    }

    await prisma.soleType.create({
      data: { key, label, price, thickness, sortOrder },
    });

    revalidatePath('/admin/sole-types');
    revalidatePath('/order/new');
    return { success: true };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return { success: false, error: 'Dieser Schlüssel existiert bereits' };
    }
    console.error('Error creating sole type:', error);
    return { success: false, error: 'Fehler beim Erstellen' };
  }
}

export async function updateSoleType(id: string, formData: FormData): Promise<SoleTypeActionResult> {
  try {
    const label = (formData.get('label') as string)?.trim();
    const price = parseFloat(formData.get('price') as string);
    const thickness = (formData.get('thickness') as string)?.trim();
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;
    const isActive = formData.get('isActive') === 'true';

    if (!label) {
      return { success: false, error: 'Bezeichnung ist erforderlich' };
    }
    if (isNaN(price) || price < 0) {
      return { success: false, error: 'Ungültiger Preis' };
    }
    if (!thickness) {
      return { success: false, error: 'Stärke ist erforderlich' };
    }

    await prisma.soleType.update({
      where: { id },
      data: { label, price, thickness, sortOrder, isActive },
    });

    revalidatePath('/admin/sole-types');
    revalidatePath('/order/new');
    return { success: true };
  } catch (error) {
    console.error('Error updating sole type:', error);
    return { success: false, error: 'Fehler beim Aktualisieren' };
  }
}

export async function checkSoleTypeUsage(key: string): Promise<number> {
  try {
    const count = await prisma.orderItem.count({
      where: { sole: key },
    });
    return count;
  } catch {
    return 0;
  }
}

export async function deleteSoleType(id: string): Promise<SoleTypeActionResult> {
  try {
    const soleType = await prisma.soleType.findUnique({ where: { id } });
    if (!soleType) {
      return { success: false, error: 'Gummisorte nicht gefunden' };
    }

    // Check if referenced by existing orders
    const orderCount = await prisma.orderItem.count({
      where: { sole: soleType.key },
    });

    // Soft delete
    await prisma.soleType.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath('/admin/sole-types');
    revalidatePath('/order/new');
    return { success: true, orderCount };
  } catch (error) {
    console.error('Error deleting sole type:', error);
    return { success: false, error: 'Fehler beim Deaktivieren' };
  }
}
