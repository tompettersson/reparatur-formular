'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type PriceSettingActionResult = {
  success: boolean;
  error?: string;
};

export async function updatePriceSettings(formData: FormData): Promise<PriceSettingActionResult> {
  try {
    // Parse all price settings from form
    const entries: { key: string; label: string; value: number; category: string; sortOrder: number }[] = [];

    // Additional prices
    const additionalKeys = [
      { key: 'edgeRubber', label: 'Randgummi', sort: 0 },
      { key: 'closure', label: 'Verschluss (Paarpreis)', sort: 1 },
      { key: 'disinfection', label: 'Desinfektion (pro Paar)', sort: 2 },
    ];

    for (const item of additionalKeys) {
      const val = parseFloat(formData.get(item.key) as string);
      if (isNaN(val) || val < 0) {
        return { success: false, error: `Ungültiger Preis für ${item.label}` };
      }
      entries.push({ key: item.key, label: item.label, value: val, category: 'additional', sortOrder: item.sort });
    }

    // Shipping costs
    const shippingKeys = [
      { key: 'shipping_de_label', label: 'Versandlabel Deutschland', sort: 0 },
      { key: 'shipping_de_return', label: 'Rückversand Deutschland', sort: 1 },
      { key: 'shipping_eu_label', label: 'Versandlabel EU', sort: 2 },
      { key: 'shipping_eu_return', label: 'Rückversand EU', sort: 3 },
      { key: 'shipping_noneu_label', label: 'Versandlabel Nicht-EU / CH', sort: 4 },
      { key: 'shipping_noneu_return', label: 'Rückversand Nicht-EU / CH', sort: 5 },
      { key: 'shipping_free_return_min_pairs', label: 'Kostenfreier Rückversand ab (Paare)', sort: 6 },
    ];

    for (const item of shippingKeys) {
      const val = parseFloat(formData.get(item.key) as string);
      if (isNaN(val) || val < 0) {
        return { success: false, error: `Ungültiger Wert für ${item.label}` };
      }
      entries.push({ key: item.key, label: item.label, value: val, category: 'shipping', sortOrder: item.sort });
    }

    // Upsert all settings
    for (const entry of entries) {
      await prisma.priceSetting.upsert({
        where: { key: entry.key },
        update: { value: entry.value, label: entry.label },
        create: {
          key: entry.key,
          label: entry.label,
          value: entry.value,
          category: entry.category,
          sortOrder: entry.sortOrder,
        },
      });
    }

    revalidatePath('/admin/settings');
    revalidatePath('/order/new');
    return { success: true };
  } catch (error) {
    console.error('Error updating price settings:', error);
    return { success: false, error: 'Fehler beim Speichern der Preise' };
  }
}
