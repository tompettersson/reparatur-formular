import { z } from 'zod';

// Unterstützte Länder für den Versand
export const SUPPORTED_COUNTRIES = [
  { code: 'DE', label: 'Deutschland', zipRegex: /^\d{5}$/ },
  { code: 'AT', label: 'Österreich', zipRegex: /^\d{4}$/ },
  { code: 'CH', label: 'Schweiz', zipRegex: /^\d{4}$/ },
  { code: 'NL', label: 'Niederlande', zipRegex: /^\d{4}\s?[A-Z]{2}$/i },
  { code: 'BE', label: 'Belgien', zipRegex: /^\d{4}$/ },
  { code: 'FR', label: 'Frankreich', zipRegex: /^\d{5}$/ },
  { code: 'IT', label: 'Italien', zipRegex: /^\d{5}$/ },
  { code: 'PL', label: 'Polen', zipRegex: /^\d{2}-\d{3}$/ },
  { code: 'CZ', label: 'Tschechien', zipRegex: /^\d{3}\s?\d{2}$/ },
  { code: 'LU', label: 'Luxemburg', zipRegex: /^\d{4}$/ },
  { code: 'LI', label: 'Liechtenstein', zipRegex: /^\d{4}$/ },
] as const;

export type CountryCode = typeof SUPPORTED_COUNTRIES[number]['code'];

// PLZ-Validierung je nach Land
function validateZipForCountry(zip: string, countryCode: string): boolean {
  const country = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
  if (!country) {
    // Fallback: mindestens 3 Zeichen
    return zip.length >= 3;
  }
  return country.zipRegex.test(zip);
}

// Kundendaten Schema (Step 1)
export const customerSchema = z.object({
  salutation: z.enum(['Herr', 'Frau', 'Divers']),
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen haben'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen haben'),

  // Adresse getrennt: Straße + Hausnummer
  street: z.string().min(3, 'Bitte geben Sie eine gültige Straße ein'),
  houseNumber: z.string().min(1, 'Bitte geben Sie eine Hausnummer ein'),

  zip: z.string().min(3, 'Bitte geben Sie eine gültige PLZ ein'),
  city: z.string().min(2, 'Bitte geben Sie einen gültigen Ort ein'),
  country: z.string().min(2, 'Bitte wählen Sie ein Land').default('DE'),

  phone: z.string().min(6, 'Bitte geben Sie eine gültige Telefonnummer ein'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),

  // Lieferadresse
  deliverySame: z.boolean(),
  deliverySalutation: z.enum(['Herr', 'Frau', 'Divers']).optional(),
  deliveryFirstName: z.string().optional(),
  deliveryLastName: z.string().optional(),
  deliveryStreet: z.string().optional(),
  deliveryHouseNumber: z.string().optional(),
  deliveryZip: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryCountry: z.string().optional(),

  // Packstation/DHL (separate Felder)
  packstationNumber: z.string().optional(),
  postNumber: z.string().optional(),
  deliveryNotes: z.string().optional(),

  // Einwilligungen
  gdprAccepted: z.boolean().refine((val) => val === true, {
    message: 'Bitte akzeptieren Sie die Datenschutzerklärung',
  }),
  agbAccepted: z.boolean().refine((val) => val === true, {
    message: 'Bitte akzeptieren Sie die AGB',
  }),
  newsletter: z.boolean().default(false),
}).refine(
  (data) => {
    // PLZ-Validierung für Rechnungsadresse
    return validateZipForCountry(data.zip, data.country);
  },
  {
    message: 'PLZ ist für das gewählte Land ungültig',
    path: ['zip'],
  }
).refine(
  (data) => {
    if (!data.deliverySame) {
      return (
        data.deliveryFirstName &&
        data.deliveryLastName &&
        data.deliveryStreet &&
        data.deliveryHouseNumber &&
        data.deliveryZip &&
        data.deliveryCity &&
        data.deliveryCountry
      );
    }
    return true;
  },
  {
    message: 'Bitte füllen Sie die Lieferadresse vollständig aus',
    path: ['deliveryFirstName'],
  }
).refine(
  (data) => {
    // PLZ-Validierung für Lieferadresse (wenn abweichend)
    if (!data.deliverySame && data.deliveryZip && data.deliveryCountry) {
      return validateZipForCountry(data.deliveryZip, data.deliveryCountry);
    }
    return true;
  },
  {
    message: 'PLZ ist für das gewählte Land ungültig',
    path: ['deliveryZip'],
  }
);

// Schuh/Position Schema (Step 2)
export const orderItemSchema = z.object({
  // NEU: 0.5 = Einzelschuh, 1 = Paar
  quantity: z.number().min(0.5).max(10).multipleOf(0.5),
  manufacturer: z.string().min(1, 'Bitte wählen Sie einen Hersteller'),
  model: z.string().min(1, 'Bitte geben Sie das Modell ein'),
  color: z.string().optional(),
  // NEU: Halbe Größen (24, 24.5, 25, ...)
  size: z.string().min(1, 'Bitte wählen Sie eine Größe'),
  sole: z.string().min(1, 'Bitte wählen Sie eine Sohle'),
  edgeRubber: z.enum(['YES', 'NO', 'DISCRETION']),
  closure: z.boolean().default(false),
  // NEU: Desinfektion als eigene Option
  disinfection: z.boolean().default(false),
  // NEU: "Profis machen lassen" - macht Bauteil+Randgummi optional
  trustProfessionals: z.boolean().default(false),
  additionalWork: z.string().optional(),
  internalNotes: z.string().optional(),
}).refine(
  (data) => {
    // Wenn "Profis machen lassen" nicht aktiv, müssen sole und edgeRubber ausgefüllt sein
    if (!data.trustProfessionals) {
      return data.sole && data.edgeRubber;
    }
    return true;
  },
  {
    message: 'Bitte wählen Sie Sohle und Randgummi oder aktivieren Sie "Profis machen lassen"',
    path: ['sole'],
  }
);

export const shoesSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Bitte fügen Sie mindestens einen Schuh hinzu'),
});

// Gesamtes Formular
export const orderSchema = customerSchema.merge(shoesSchema);

// Types
export type CustomerFormData = z.infer<typeof customerSchema>;
export type OrderItemFormData = z.infer<typeof orderItemSchema>;
export type ShoesFormData = z.infer<typeof shoesSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
