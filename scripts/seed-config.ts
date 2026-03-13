/**
 * Seed-Script für Stammdaten (Länder, Hersteller, Gummisorten, FAQ)
 * Migriert die hardcoded Daten in die neuen Datenbank-Tabellen.
 *
 * Verwendung: npx tsx scripts/seed-config.ts
 *
 * Idempotent: Verwendet upsert(), kann beliebig oft ausgeführt werden.
 */

import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ NEON_DATABASE_URL oder DATABASE_URL nicht gesetzt');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ============================================
// Länder (aus lib/validation.ts SUPPORTED_COUNTRIES)
// ============================================
const COUNTRIES = [
  { code: 'DE', label: 'Deutschland', zipPattern: '^\\d{5}$', sortOrder: 0 },
  { code: 'AT', label: 'Österreich', zipPattern: '^\\d{4}$', sortOrder: 1 },
  { code: 'CH', label: 'Schweiz', zipPattern: '^\\d{4}$', sortOrder: 2 },
  { code: 'NL', label: 'Niederlande', zipPattern: '^\\d{4}\\s?[A-Za-z]{2}$', sortOrder: 3 },
  { code: 'BE', label: 'Belgien', zipPattern: '^\\d{4}$', sortOrder: 4 },
  { code: 'FR', label: 'Frankreich', zipPattern: '^\\d{5}$', sortOrder: 5 },
  { code: 'IT', label: 'Italien', zipPattern: '^\\d{5}$', sortOrder: 6 },
  { code: 'PL', label: 'Polen', zipPattern: '^\\d{2}-\\d{3}$', sortOrder: 7 },
  { code: 'CZ', label: 'Tschechien', zipPattern: '^\\d{3}\\s?\\d{2}$', sortOrder: 8 },
  { code: 'LU', label: 'Luxemburg', zipPattern: '^\\d{4}$', sortOrder: 9 },
  { code: 'LI', label: 'Liechtenstein', zipPattern: '^\\d{4}$', sortOrder: 10 },
];

// ============================================
// Hersteller (aus lib/pricing.ts MANUFACTURERS)
// ============================================
const MANUFACTURERS = [
  { name: 'La Sportiva', sortOrder: 0 },
  { name: 'Scarpa', sortOrder: 1 },
  { name: 'Five Ten', sortOrder: 2 },
  { name: 'Boreal', sortOrder: 3 },
  { name: 'Ocun', sortOrder: 4 },
  { name: 'Red Chili', sortOrder: 5 },
  { name: 'Tenaya', sortOrder: 6 },
  { name: 'Evolv', sortOrder: 7 },
  { name: 'Mad Rock', sortOrder: 8 },
  { name: 'Butora', sortOrder: 9 },
  { name: 'Unparallel', sortOrder: 10 },
  { name: 'So iLL', sortOrder: 11 },
  { name: 'Andere', sortOrder: 999 },
];

// ============================================
// Gummisorten (aus lib/pricing.ts SOLE_PRICES)
// ============================================
const SOLE_TYPES = [
  { key: 'vibram_xs_grip', label: 'Vibram XS Grip', price: 32, thickness: '4mm', sortOrder: 0 },
  { key: 'vibram_xs_grip_2', label: 'Vibram XS Grip 2', price: 32, thickness: '4mm', sortOrder: 1 },
  { key: 'vibram_xs_edge', label: 'Vibram XS Edge', price: 32, thickness: '4mm', sortOrder: 2 },
  { key: 'stealth_c4', label: 'Stealth C4', price: 32, thickness: '4mm', sortOrder: 3 },
  { key: 'stealth_hf', label: 'Stealth HF', price: 32, thickness: '4mm', sortOrder: 4 },
  { key: 'boreal', label: 'Boreal', price: 32, thickness: '4mm', sortOrder: 5 },
  { key: 'original_la_sportiva', label: 'Original La Sportiva', price: 41, thickness: 'variabel', sortOrder: 6 },
  { key: 'original_scarpa', label: 'Original Scarpa', price: 41, thickness: 'variabel', sortOrder: 7 },
];

// ============================================
// FAQ (aus app/order/new/steps/ShoesStep.tsx)
// ============================================
const FAQ_ENTRIES = [
  {
    question: 'Alle wichtigen Infos zum Versand',
    answer: 'Schicken Sie Ihre Schuhe gut verpackt an unsere Adresse. Nach Eingang prüfen wir den Zustand und melden uns bei Fragen. Die Reparatur dauert ca. 2-3 Wochen. Der Rückversand erfolgt per DHL.',
    sortOrder: 0,
  },
  {
    question: 'Was auswählen wenn ich keine Ahnung habe?',
    answer: 'Kein Problem! Wählen Sie bei Gummi/Bauteil einfach "Vibram XS Grip 2" – das passt für die meisten Schuhe. Bei Randgummi wählen Sie "Nach Ermessen" und wir entscheiden für Sie. Wir kontaktieren Sie vor der Reparatur, falls Rückfragen entstehen.',
    sortOrder: 1,
  },
  {
    question: 'Welches Gummi für Hallenkletterer?',
    answer: 'Für die Halle empfehlen wir Vibram XS Grip 2 - sehr gute Reibung auf Kunstgriffen. Für Boulder mit viel Volumen ist Stealth C4 eine tolle Alternative mit mehr Dämpfung.',
    sortOrder: 2,
  },
  {
    question: 'Lohnt sich Randgummi?',
    answer: 'Randgummi lohnt sich, wenn der originale Rand bereits verschlissen ist oder Sie Ihre Schuhe stark belasten (Risskletterei, Überhänge). Bei leichtem Hallenklettern oft nicht nötig.',
    sortOrder: 3,
  },
];

async function main() {
  console.log('🌱 Seeding Stammdaten...\n');

  // Countries
  console.log('🌍 Länder...');
  for (const country of COUNTRIES) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {
        label: country.label,
        zipPattern: country.zipPattern,
        sortOrder: country.sortOrder,
      },
      create: {
        code: country.code,
        label: country.label,
        zipPattern: country.zipPattern,
        sortOrder: country.sortOrder,
      },
    });
    console.log(`  ✓ ${country.code} - ${country.label}`);
  }

  // Manufacturers
  console.log('\n🏭 Hersteller...');
  for (const mfr of MANUFACTURERS) {
    await prisma.manufacturer.upsert({
      where: { name: mfr.name },
      update: { sortOrder: mfr.sortOrder },
      create: {
        name: mfr.name,
        sortOrder: mfr.sortOrder,
      },
    });
    console.log(`  ✓ ${mfr.name}`);
  }

  // Sole Types
  console.log('\n👟 Gummisorten...');
  for (const sole of SOLE_TYPES) {
    await prisma.soleType.upsert({
      where: { key: sole.key },
      update: {
        label: sole.label,
        price: sole.price,
        thickness: sole.thickness,
        sortOrder: sole.sortOrder,
      },
      create: {
        key: sole.key,
        label: sole.label,
        price: sole.price,
        thickness: sole.thickness,
        sortOrder: sole.sortOrder,
      },
    });
    console.log(`  ✓ ${sole.label} (${sole.price}€)`);
  }

  // FAQ Entries (use question as unique identifier via findFirst + create/update)
  console.log('\n❓ FAQ-Einträge...');
  for (const faq of FAQ_ENTRIES) {
    const existing = await prisma.faqEntry.findFirst({
      where: { question: faq.question },
    });

    if (existing) {
      await prisma.faqEntry.update({
        where: { id: existing.id },
        data: {
          answer: faq.answer,
          sortOrder: faq.sortOrder,
        },
      });
    } else {
      await prisma.faqEntry.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          sortOrder: faq.sortOrder,
        },
      });
    }
    console.log(`  ✓ ${faq.question}`);
  }

  console.log('\n✅ Seeding abgeschlossen!');
}

main()
  .catch((error) => {
    console.error('❌ Seeding fehlgeschlagen:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
