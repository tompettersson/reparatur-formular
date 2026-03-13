import { getCountries, getManufacturers, getSoleTypes, getFaqEntries } from '@/lib/config';
import { OrderWizardClient } from './OrderWizardClient';

export default async function OrderWizardPage() {
  // Fetch config from DB (with hardcoded fallback)
  const [countries, manufacturers, soleTypes, faqs] = await Promise.all([
    getCountries(),
    getManufacturers(),
    getSoleTypes(),
    getFaqEntries(),
  ]);

  return (
    <OrderWizardClient
      countries={countries}
      manufacturers={manufacturers}
      soleTypes={soleTypes}
      faqs={faqs}
    />
  );
}
