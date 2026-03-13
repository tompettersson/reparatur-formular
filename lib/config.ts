/**
 * Configuration library - fetches master data from DB with hardcoded fallbacks.
 *
 * All functions are async and should be called from Server Components or Server Actions.
 * If DB is empty or unreachable, falls back to hardcoded defaults from validation.ts / pricing.ts.
 */

import { prisma } from '@/lib/prisma';
import { SUPPORTED_COUNTRIES } from '@/lib/validation';
import { SOLE_PRICES, MANUFACTURERS } from '@/lib/pricing';

// ============================================
// Types (shared between server and client)
// ============================================

export interface CountryConfig {
  code: string;
  label: string;
  zipPattern: string; // Regex as string
}

export interface ManufacturerConfig {
  name: string;
}

export interface SoleTypeConfig {
  key: string;
  label: string;
  price: number;
  thickness: string;
}

export interface FaqEntryConfig {
  id: string;
  question: string;
  answer: string;
}

// ============================================
// Fetching functions with fallback
// ============================================

export async function getCountries(): Promise<CountryConfig[]> {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { code: true, label: true, zipPattern: true },
    });

    if (countries.length > 0) {
      return countries;
    }
  } catch (error) {
    console.error('Failed to fetch countries from DB, using fallback:', error);
  }

  // Fallback to hardcoded
  return SUPPORTED_COUNTRIES.map((c) => ({
    code: c.code,
    label: c.label,
    zipPattern: c.zipRegex.source,
  }));
}

export async function getManufacturers(): Promise<ManufacturerConfig[]> {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { name: true },
    });

    if (manufacturers.length > 0) {
      return manufacturers;
    }
  } catch (error) {
    console.error('Failed to fetch manufacturers from DB, using fallback:', error);
  }

  // Fallback to hardcoded
  return MANUFACTURERS.map((name) => ({ name }));
}

export async function getSoleTypes(): Promise<SoleTypeConfig[]> {
  try {
    const soleTypes = await prisma.soleType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { key: true, label: true, price: true, thickness: true },
    });

    if (soleTypes.length > 0) {
      return soleTypes.map((s) => ({
        key: s.key,
        label: s.label,
        price: Number(s.price),
        thickness: s.thickness,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch sole types from DB, using fallback:', error);
  }

  // Fallback to hardcoded
  return Object.entries(SOLE_PRICES).map(([key, info]) => ({
    key,
    label: info.label,
    price: info.price,
    thickness: info.thickness,
  }));
}

export async function getFaqEntries(): Promise<FaqEntryConfig[]> {
  try {
    const faqs = await prisma.faqEntry.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, question: true, answer: true },
    });

    if (faqs.length > 0) {
      return faqs;
    }
  } catch (error) {
    console.error('Failed to fetch FAQ entries from DB, using fallback:', error);
  }

  // Fallback to hardcoded
  return [
    {
      id: 'fallback-1',
      question: 'Alle wichtigen Infos zum Versand',
      answer: 'Schicken Sie Ihre Schuhe gut verpackt an unsere Adresse. Nach Eingang prüfen wir den Zustand und melden uns bei Fragen. Die Reparatur dauert ca. 2-3 Wochen. Der Rückversand erfolgt per DHL.',
    },
    {
      id: 'fallback-2',
      question: 'Was auswählen wenn ich keine Ahnung habe?',
      answer: 'Kein Problem! Wählen Sie bei Gummi/Bauteil einfach "Vibram XS Grip 2" – das passt für die meisten Schuhe. Bei Randgummi wählen Sie "Nach Ermessen" und wir entscheiden für Sie. Wir kontaktieren Sie vor der Reparatur, falls Rückfragen entstehen.',
    },
    {
      id: 'fallback-3',
      question: 'Welches Gummi für Hallenkletterer?',
      answer: 'Für die Halle empfehlen wir Vibram XS Grip 2 - sehr gute Reibung auf Kunstgriffen. Für Boulder mit viel Volumen ist Stealth C4 eine tolle Alternative mit mehr Dämpfung.',
    },
    {
      id: 'fallback-4',
      question: 'Lohnt sich Randgummi?',
      answer: 'Randgummi lohnt sich, wenn der originale Rand bereits verschlissen ist oder Sie Ihre Schuhe stark belasten (Risskletterei, Überhänge). Bei leichtem Hallenklettern oft nicht nötig.',
    },
  ];
}

/**
 * Build a price map from DB sole types for use in price calculation.
 * Returns Record<soleKey, price>.
 */
export async function getSolePriceMap(): Promise<Record<string, number>> {
  const soleTypes = await getSoleTypes();
  const map: Record<string, number> = {};
  for (const st of soleTypes) {
    map[st.key] = st.price;
  }
  return map;
}

/**
 * Build a label map from DB sole types for display.
 * Returns Record<soleKey, "Label (thickness)">.
 */
export async function getSoleLabelMap(): Promise<Record<string, string>> {
  const soleTypes = await getSoleTypes();
  const map: Record<string, string> = {};
  for (const st of soleTypes) {
    map[st.key] = `${st.label} (${st.thickness})`;
  }
  return map;
}
