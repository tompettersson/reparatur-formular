'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type FaqActionResult = {
  success: boolean;
  error?: string;
};

export async function createFaq(formData: FormData): Promise<FaqActionResult> {
  try {
    const question = (formData.get('question') as string)?.trim();
    const answer = (formData.get('answer') as string)?.trim();
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;

    if (!question || question.length < 5) {
      return { success: false, error: 'Frage muss mindestens 5 Zeichen haben' };
    }
    if (!answer || answer.length < 10) {
      return { success: false, error: 'Antwort muss mindestens 10 Zeichen haben' };
    }

    await prisma.faqEntry.create({
      data: { question, answer, sortOrder },
    });

    revalidatePath('/admin/faq');
    revalidatePath('/order/new');
    return { success: true };
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return { success: false, error: 'Fehler beim Erstellen' };
  }
}

export async function updateFaq(id: string, formData: FormData): Promise<FaqActionResult> {
  try {
    const question = (formData.get('question') as string)?.trim();
    const answer = (formData.get('answer') as string)?.trim();
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;
    const isActive = formData.get('isActive') === 'true';

    if (!question || question.length < 5) {
      return { success: false, error: 'Frage muss mindestens 5 Zeichen haben' };
    }
    if (!answer || answer.length < 10) {
      return { success: false, error: 'Antwort muss mindestens 10 Zeichen haben' };
    }

    await prisma.faqEntry.update({
      where: { id },
      data: { question, answer, sortOrder, isActive },
    });

    revalidatePath('/admin/faq');
    revalidatePath('/order/new');
    return { success: true };
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return { success: false, error: 'Fehler beim Aktualisieren' };
  }
}

export async function deleteFaq(id: string): Promise<FaqActionResult> {
  try {
    await prisma.faqEntry.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath('/admin/faq');
    revalidatePath('/order/new');
    return { success: true };
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return { success: false, error: 'Fehler beim Deaktivieren' };
  }
}
