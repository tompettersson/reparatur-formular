import { prisma } from '@/lib/prisma';
import { AdminHeader } from '../AdminHeader';
import { Card } from '@/components/ui/Card';
import { PriceSettingsForm } from './PriceSettingsForm';
import { ADDITIONAL_PRICES, SHIPPING_COSTS } from '@/lib/pricing';

export default async function SettingsPage() {
  // Fetch existing price settings from DB
  const dbSettings = await prisma.priceSetting.findMany();

  // Build settings map with DB values + hardcoded fallbacks
  const settings: Record<string, number> = {
    edgeRubber: ADDITIONAL_PRICES.edgeRubber,
    closure: ADDITIONAL_PRICES.closure,
    disinfection: ADDITIONAL_PRICES.disinfection,
    shipping_de_label: SHIPPING_COSTS.germany.label,
    shipping_de_return: SHIPPING_COSTS.germany.return,
    shipping_eu_label: SHIPPING_COSTS.eu.label,
    shipping_eu_return: SHIPPING_COSTS.eu.return,
    shipping_noneu_label: SHIPPING_COSTS.nonEu.label,
    shipping_noneu_return: SHIPPING_COSTS.nonEu.return,
    shipping_free_return_min_pairs: 3,
  };

  // Override with DB values
  for (const s of dbSettings) {
    settings[s.key] = Number(s.value);
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <AdminHeader />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#38362d]">Preise & Versandkosten</h1>
          <p className="text-gray-500">Zusatzleistungen und Versandkosten für das Reparaturformular</p>
        </div>

        <Card>
          <PriceSettingsForm settings={settings} />
        </Card>
      </main>
    </div>
  );
}
