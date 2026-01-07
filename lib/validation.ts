import { z } from 'zod';

// Kundendaten Schema (Step 1)
export const customerSchema = z.object({
  salutation: z.enum(['Herr', 'Frau', 'Divers']),
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen haben'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen haben'),
  street: z.string().min(3, 'Bitte geben Sie eine gültige Straße ein'),
  zip: z.string().regex(/^\d{4,5}$/, 'Bitte geben Sie eine gültige PLZ ein'),
  city: z.string().min(2, 'Bitte geben Sie einen gültigen Ort ein'),
  phone: z.string().min(6, 'Bitte geben Sie eine gültige Telefonnummer ein'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),

  // Lieferadresse
  deliverySame: z.boolean(),
  deliverySalutation: z.enum(['Herr', 'Frau', 'Divers']).optional(),
  deliveryFirstName: z.string().optional(),
  deliveryLastName: z.string().optional(),
  deliveryStreet: z.string().optional(),
  deliveryZip: z.string().optional(),
  deliveryCity: z.string().optional(),

  // Zusatz
  stationNotes: z.string().optional(),

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
    if (!data.deliverySame) {
      return (
        data.deliveryFirstName &&
        data.deliveryLastName &&
        data.deliveryStreet &&
        data.deliveryZip &&
        data.deliveryCity
      );
    }
    return true;
  },
  {
    message: 'Bitte füllen Sie die Lieferadresse vollständig aus',
    path: ['deliveryFirstName'],
  }
);

// Schuh/Position Schema (Step 2)
export const orderItemSchema = z.object({
  quantity: z.number().min(1).max(10),
  manufacturer: z.string().min(1, 'Bitte wählen Sie einen Hersteller'),
  model: z.string().min(1, 'Bitte geben Sie das Modell ein'),
  color: z.string().optional(),
  size: z.string().min(1, 'Bitte wählen Sie eine Größe'),
  sole: z.string().min(1, 'Bitte wählen Sie eine Sohle'),
  edgeRubber: z.enum(['YES', 'NO', 'DISCRETION']),
  closure: z.boolean().default(false),
  additionalWork: z.string().optional(),
  internalNotes: z.string().optional(),
});

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
