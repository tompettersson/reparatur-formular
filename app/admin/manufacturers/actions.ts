'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type ManufacturerActionResult = {
  success: boolean;
  error?: string;
};

export async function createManufacturer(formData: FormData): Promise<ManufacturerActionResult> {
  try {
    const name = (formData.get('name') as string)?.trim();
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;

    if (!name || name.length < 2) {
      return { success: false, error: 'Name muss mindestens 2 Zeichen haben' };
    }

    await prisma.manufacturer.create({
      data: { name, sortOrder },
    });

    revalidatePath('/admin/manufacturers');
    revalidatePath('/order/new');
    return { success: true };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return { success: false, error: 'Dieser Hersteller existiert bereits' };
    }
    console.error('Error creating manufacturer:', error);
    return { success: false, error: 'Fehler beim Erstellen' };
  }
}

export async function updateManufacturer(id: string, formData: FormData): Promise<ManufacturerActionResult> {
  try {
    const name = (formData.get('name') as string)?.trim();
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;
    const isActive = formData.get('isActive') === 'true';

    if (!name || name.length < 2) {
      return { success: false, error: 'Name muss mindestens 2 Zeichen haben' };
    }

    await prisma.manufacturer.update({
      where: { id },
      data: { name, sortOrder, isActive },
    });

    revalidatePath('/admin/manufacturers');
    revalidatePath('/order/new');
    return { success: true };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return { success: false, error: 'Dieser Hersteller-Name existiert bereits' };
    }
    console.error('Error updating manufacturer:', error);
    return { success: false, error: 'Fehler beim Aktualisieren' };
  }
}

export async function deleteManufacturer(id: string): Promise<ManufacturerActionResult> {
  try {
    await prisma.manufacturer.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath('/admin/manufacturers');
    revalidatePath('/order/new');
    return { success: true };
  } catch (error) {
    console.error('Error deleting manufacturer:', error);
    return { success: false, error: 'Fehler beim Deaktivieren' };
  }
}
