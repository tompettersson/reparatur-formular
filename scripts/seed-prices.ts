/**
 * Seed script for PriceSetting table.
 * Seeds Stephan's current prices (Versandkosten mit EUR 7,90 etc.).
 * Idempotent via upsert.
 *
 * Usage: source .env.local && export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/seed-prices.ts
 */

import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing NEON_DATABASE_URL or DATABASE_URL');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const PRICE_SETTINGS = [
  // Additional services
  { key: 'edgeRubber', label: 'Randgummi', value: 19, category: 'additional', sortOrder: 0 },
  { key: 'closure', label: 'Verschluss (Paarpreis)', value: 20, category: 'additional', sortOrder: 1 },
  { key: 'disinfection', label: 'Desinfektion (pro Paar)', value: 3, category: 'additional', sortOrder: 2 },

  // Shipping costs (updated per Stephan's table)
  { key: 'shipping_de_label', label: 'Versandlabel Deutschland', value: 7.90, category: 'shipping', sortOrder: 0 },
  { key: 'shipping_de_return', label: 'Rückversand Deutschland', value: 7.90, category: 'shipping', sortOrder: 1 },
  { key: 'shipping_eu_label', label: 'Versandlabel EU', value: 15.00, category: 'shipping', sortOrder: 2 },
  { key: 'shipping_eu_return', label: 'Rückversand EU', value: 11.00, category: 'shipping', sortOrder: 3 },
  { key: 'shipping_noneu_label', label: 'Versandlabel Nicht-EU / CH', value: 15.00, category: 'shipping', sortOrder: 4 },
  { key: 'shipping_noneu_return', label: 'Rückversand Nicht-EU / CH', value: 15.00, category: 'shipping', sortOrder: 5 },
  { key: 'shipping_free_return_min_pairs', label: 'Kostenfreier Rückversand ab (Paare)', value: 3, category: 'shipping', sortOrder: 6 },
];

async function main() {
  console.log('Seeding price settings...');

  for (const setting of PRICE_SETTINGS) {
    await prisma.priceSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, label: setting.label },
      create: setting,
    });
    console.log(`  ✓ ${setting.key}: ${setting.value}€`);
  }

  console.log(`\nDone! ${PRICE_SETTINGS.length} price settings seeded.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
