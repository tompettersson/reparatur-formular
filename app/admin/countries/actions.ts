'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type CountryActionResult = {
  success: boolean;
  error?: string;
};

export async function createCountry(formData: FormData): Promise<CountryActionResult> {
  try {
    const code = (formData.get('code') as string)?.toUpperCase().trim();
    const label = (formData.get('label') as string)?.trim();
    const zipPattern = (formData.get('zipPattern') as string)?.trim();
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;

    if (!code || code.length !== 2) {
      return { success: false, error: 'Ländercode muss genau 2 Buchstaben haben' };
    }
    if (!label) {
      return { success: false, error: 'Bezeichnung ist erforderlich' };
    }
    if (!zipPattern) {
      return { success: false, error: 'PLZ-Regex ist erforderlich' };
    }

    // Validate regex
    try {
      new RegExp(zipPattern);
    } catch {
      return { success: false, error: 'Ungültiger regulärer Ausdruck für PLZ' };
    }

    await prisma.country.create({
      data: { code, label, zipPattern, sortOrder },
    });

    revalidatePath('/admin/countries');
    revalidatePath('/order/new');
    return { success: true };
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return { success: false, error: 'Dieser Ländercode existiert bereits' };
    }
    console.error('Error creating country:', error);
    return { success: false, error: 'Fehler beim Erstellen' };
  }
}

export async function updateCountry(id: string, formData: FormData): Promise<CountryActionResult> {
  try {
    const label = (formData.get('label') as string)?.trim();
    const zipPattern = (formData.get('zipPattern') as string)?.trim();
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;
    const isActive = formData.get('isActive') === 'true';

    if (!label) {
      return { success: false, error: 'Bezeichnung ist erforderlich' };
    }
    if (!zipPattern) {
      return { success: false, error: 'PLZ-Regex ist erforderlich' };
    }

    try {
      new RegExp(zipPattern);
    } catch {
      return { success: false, error: 'Ungültiger regulärer Ausdruck für PLZ' };
    }

    await prisma.country.update({
      where: { id },
      data: { label, zipPattern, sortOrder, isActive },
    });

    revalidatePath('/admin/countries');
    revalidatePath('/order/new');
    return { success: true };
  } catch (error) {
    console.error('Error updating country:', error);
    return { success: false, error: 'Fehler beim Aktualisieren' };
  }
}

export async function deleteCountry(id: string): Promise<CountryActionResult> {
  try {
    // Soft delete - just deactivate
    await prisma.country.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath('/admin/countries');
    revalidatePath('/order/new');
    return { success: true };
  } catch (error) {
    console.error('Error deleting country:', error);
    return { success: false, error: 'Fehler beim Deaktivieren' };
  }
}
