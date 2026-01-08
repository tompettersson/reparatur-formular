/**
 * Tooltip content for repair form fields
 * German language - kletterschuhe.de
 */

export const TOOLTIPS = {
  // Sole type (Gummi/Bauteil)
  sole: {
    title: 'Sohlentypen im Überblick',
    content: `
**Vibram XS Grip / Grip 2** (4mm)
Weicher Gummi für maximale Reibung. Ideal für Bouldern und technisches Klettern.

**Vibram XS Edge** (4mm)
Steiferer Gummi für präzises Kantentreten. Perfekt für kleine Leisten.

**Stealth C4 / HF** (4mm)
Five Ten's Allround-Gummi. Guter Kompromiss aus Grip und Haltbarkeit.

**Boreal** (4mm)
Bewährter Gummi mit ausgewogenen Eigenschaften.

**Original** (variabel)
Originalbesohlung durch La Sportiva / Scarpa. Höherer Preis, original wie vom Werk.
    `.trim(),
  },

  // Edge rubber (Randgummi)
  edgeRubber: {
    title: 'Randgummi-Reparatur',
    content: `
Das **Randgummi** ist der Gummi an der Seite des Schuhs zwischen Sohle und Obermaterial.

**Ja (+19€)**
Beschädigtes Randgummi wird ausgetauscht. Empfohlen bei sichtbaren Rissen oder Löchern.

**Nein**
Nur Sohle wird erneuert. Wählen Sie dies, wenn das Randgummi noch intakt ist.

**Nach Ermessen**
Unser Team prüft den Zustand und entscheidet, ob ein Austausch notwendig ist. Kostenpflichtig nur bei Austausch.
    `.trim(),
  },

  // Closure system (Verschluss)
  closure: {
    title: 'Verschluss-Reparatur',
    content: `
Diese Option gilt für das **La Sportiva Fast Lacing System** und ähnliche Schnellverschlüsse.

**Was wird repariert:**
• Gerissene oder ausgeleierte Zugbänder
• Defekte Klemmen und Ösen
• Beschädigte Verschluss-Mechaniken

**Hinweis:** Für Klettverschlüsse oder normale Schnürungen wählen Sie diese Option nicht – beschreiben Sie das Problem stattdessen unter "Zusatzarbeiten".
    `.trim(),
  },

  // Manufacturer selection
  manufacturer: {
    title: 'Hersteller-Auswahl',
    content: `
Die Hersteller-Auswahl hilft uns bei der optimalen Gummi-Empfehlung.

**La Sportiva / Scarpa:**
Option für Original-Besohlung verfügbar (41€).

**Five Ten:**
Stealth-Gummi empfohlen für authentisches Gefühl.

**Andere Hersteller:**
Vibram-Gummis sind universell einsetzbar.
    `.trim(),
  },

  // Additional work
  additionalWork: {
    title: 'Zusatzarbeiten',
    content: `
Hier können Sie weitere Reparatur-Wünsche angeben:

• **Desinfektion** – Behandlung gegen Gerüche
• **Reinigung** – Professionelle Komplettreinigung
• **Nähte** – Reparatur aufgegangener Nähte
• **Fersenpads** – Austausch abgenutzter Pads
• **Zehenbox** – Reparatur beschädigter Zehenbereiche

**Kosten:** +3€ pauschal für Zusatzarbeiten.
    `.trim(),
  },
};

// Helper to render tooltip content with basic markdown
export function formatTooltipContent(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}
