import { getCountries, getManufacturers, getSoleTypes, getFaqEntries, getAdditionalPrices, getShippingCosts } from '@/lib/config';
import { OrderWizardClient } from './OrderWizardClient';

export default async function OrderWizardPage() {
  // Fetch config from DB (with hardcoded fallback)
  const [countries, manufacturers, soleTypes, faqs, additionalPrices, shippingCosts] = await Promise.all([
    getCountries(),
    getManufacturers(),
    getSoleTypes(),
    getFaqEntries(),
    getAdditionalPrices(),
    getShippingCosts(),
  ]);

  return (
    <OrderWizardClient
      countries={countries}
      manufacturers={manufacturers}
      soleTypes={soleTypes}
      faqs={faqs}
      additionalPrices={additionalPrices}
      shippingCosts={shippingCosts}
    />
  );
}
