// Preislogik für Kletterschuh-Reparaturen

export type SoleType =
  | 'vibram_xs_grip'
  | 'vibram_xs_grip_2'
  | 'vibram_xs_edge'
  | 'stealth_c4'
  | 'stealth_hf'
  | 'boreal'
  | 'original_la_sportiva'
  | 'original_scarpa';

export type EdgeRubberOption = 'YES' | 'NO' | 'DISCRETION';

// Sohlen-Preise (Stealth ALT entfernt laut Feedback)
export const SOLE_PRICES: Record<SoleType, { price: number; thickness: string; label: string }> = {
  vibram_xs_grip: { price: 32, thickness: '4mm', label: 'Vibram XS Grip' },
  vibram_xs_grip_2: { price: 32, thickness: '4mm', label: 'Vibram XS Grip 2' },
  vibram_xs_edge: { price: 32, thickness: '4mm', label: 'Vibram XS Edge' },
  stealth_c4: { price: 32, thickness: '4mm', label: 'Stealth C4' },
  stealth_hf: { price: 32, thickness: '4mm', label: 'Stealth HF' },
  boreal: { price: 32, thickness: '4mm', label: 'Boreal' },
  original_la_sportiva: { price: 41, thickness: 'variabel', label: 'Original La Sportiva' },
  original_scarpa: { price: 41, thickness: 'variabel', label: 'Original Scarpa' },
};

// Zusatzleistungen
export const ADDITIONAL_PRICES = {
  edgeRubber: 19, // Randgummi
  closure: 20, // Fast Lacing / Verschluss (Paarpreis!)
  disinfection: 3, // NEU: Desinfektion pro Paar
};

// Versandkosten (nur zur Info-Anzeige)
export const SHIPPING_COSTS = {
  germany: { label: 7, return: 7 },
  eu: { label: 15, return: 11 },
  nonEu: { label: 15, return: 15 },
};

// Hersteller-Liste
export const MANUFACTURERS = [
  'La Sportiva',
  'Scarpa',
  'Five Ten',
  'Boreal',
  'Ocun',
  'Red Chili',
  'Tenaya',
  'Evolv',
  'Mad Rock',
  'Butora',
  'Unparallel',
  'So iLL',
  'Andere',
] as const;

export type Manufacturer = typeof MANUFACTURERS[number];

// Schuhgrößen mit halben Größen (24, 24.5, 25, ... 50)
export const SHOE_SIZES = Array.from({ length: 53 }, (_, i) => {
  const size = 24 + i * 0.5;
  return size % 1 === 0 ? size.toString() : size.toFixed(1);
});

// Anzahl-Optionen (0.5 = Einzelschuh, 1 = Paar, etc.)
export const QUANTITY_OPTIONS = [
  { value: '0.5', label: '0,5 (Einzelschuh)' },
  { value: '1', label: '1 (Paar)' },
  { value: '1.5', label: '1,5' },
  { value: '2', label: '2 (Paare)' },
  { value: '2.5', label: '2,5' },
  { value: '3', label: '3 (Paare)' },
  { value: '3.5', label: '3,5' },
  { value: '4', label: '4 (Paare)' },
  { value: '4.5', label: '4,5' },
  { value: '5', label: '5 (Paare)' },
];

// Preisberechnung für eine Position
export interface OrderItemInput {
  quantity: number;
  sole: SoleType | string;
  edgeRubber: EdgeRubberOption;
  closure: boolean;
  disinfection: boolean; // NEU
  trustProfessionals: boolean; // NEU - beeinflusst nur Validierung, nicht Preis
}

export function calculateItemPrice(item: OrderItemInput): number {
  let price = 0;

  // Grundpreis der Sohle (nur wenn ausgewählt)
  if (item.sole) {
    const soleInfo = SOLE_PRICES[item.sole as SoleType];
    if (soleInfo) {
      price += soleInfo.price;
    }
  }

  // Randgummi (nur wenn JA)
  if (item.edgeRubber === 'YES') {
    price += ADDITIONAL_PRICES.edgeRubber;
  }

  // Verschluss (Paarpreis)
  if (item.closure) {
    price += ADDITIONAL_PRICES.closure;
  }

  // NEU: Desinfektion
  if (item.disinfection) {
    price += ADDITIONAL_PRICES.disinfection;
  }

  // Multipliziert mit Anzahl (0.5 = halber Preis für Einzelschuh)
  return price * item.quantity;
}

// Gesamtpreis berechnen
export function calculateTotalPrice(items: OrderItemInput[]): number {
  return items.reduce((total, item) => total + calculateItemPrice(item), 0);
}

// Formatierung
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}
