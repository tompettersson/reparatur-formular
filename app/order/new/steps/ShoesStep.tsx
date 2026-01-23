'use client';

import { ReactNode, useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, Control, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { ShoesFormData, OrderItemFormData } from '@/lib/validation';
import {
  SOLE_PRICES,
  MANUFACTURERS,
  SHOE_SIZES,
  QUANTITY_OPTIONS,
  ADDITIONAL_PRICES,
  calculateItemPrice,
  formatPrice,
  SoleType,
} from '@/lib/pricing';
import { TOOLTIPS } from '@/lib/tooltips';
import { ProductSuggestions } from '@/components/ProductSuggestions';

// Helper component to render tooltip content with simple formatting
function TooltipContent({ title, content }: { title: string; content: string }) {
  const processLine = (line: string, key: number): ReactNode => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-[#fb923c]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const lines = content.split('\n');

  return (
    <div className="space-y-1">
      <strong className="block text-white mb-2">{title}</strong>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const isBullet = line.trim().startsWith('•');

        return (
          <p
            key={i}
            className={`text-white/95 text-[13px] leading-relaxed ${isBullet ? 'pl-2' : ''}`}
          >
            {processLine(line, i)}
          </p>
        );
      })}
    </div>
  );
}

// FAQ Accordion Component
function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Alle wichtigen Infos zum Versand',
      answer: `Schicken Sie Ihre Schuhe gut verpackt an unsere Adresse. Nach Eingang prüfen wir den Zustand und melden uns bei Fragen. Die Reparatur dauert ca. 2-3 Wochen. Der Rückversand erfolgt per DHL.`,
    },
    {
      question: 'Was auswählen wenn ich keine Ahnung habe?',
      answer: `Kein Problem! Aktivieren Sie einfach "Ihr seid die Profis" und wir wählen die beste Option für Ihren Schuh. Wir kontaktieren Sie vor der Reparatur, falls Rückfragen entstehen.`,
    },
    {
      question: 'Welches Gummi für Hallenkletterer?',
      answer: `Für die Halle empfehlen wir Vibram XS Grip 2 - sehr gute Reibung auf Kunstgriffen. Für Boulder mit viel Volumen ist Stealth C4 eine tolle Alternative mit mehr Dämpfung.`,
    },
    {
      question: 'Lohnt sich Randgummi?',
      answer: `Randgummi lohnt sich, wenn der originale Rand bereits verschlissen ist oder Sie Ihre Schuhe stark belasten (Risskletterei, Überhänge). Bei leichtem Hallenklettern oft nicht nötig.`,
    },
  ];

  return (
    <Card
      title="Häufige Fragen"
      subtitle="Hilfe bei der Auswahl"
      variant="default"
    >
      <div className="divide-y divide-[#e7e5e4]">
        {faqs.map((faq, index) => (
          <div key={index} className="py-3">
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between text-left gap-4"
            >
              <span className="text-sm font-semibold text-[#38362d]">
                {faq.question}
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`flex-shrink-0 text-[#78716c] transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {openIndex === index && (
              <p className="mt-2 text-sm text-[#78716c] leading-relaxed animate-fade-in">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

interface ShoesStepProps {
  register: UseFormRegister<ShoesFormData>;
  errors: FieldErrors<ShoesFormData>;
  watch: UseFormWatch<ShoesFormData>;
  control: Control<ShoesFormData>;
}

export function ShoesStep({ register, errors, watch, control }: ShoesStepProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');

  // Optionen für Dropdowns
  const quantityOptions = QUANTITY_OPTIONS.map(opt => ({
    value: opt.value,
    label: opt.label,
  }));

  const manufacturerOptions = MANUFACTURERS.map((m) => ({
    value: m,
    label: m,
  }));

  const sizeOptions = SHOE_SIZES.map((s) => ({
    value: s,
    label: s,
  }));

  const soleOptions = Object.entries(SOLE_PRICES).map(([key, info]) => ({
    value: key,
    label: `${info.label} (${info.thickness}) - ${formatPrice(info.price)}`,
  }));

  const edgeRubberOptions = [
    { value: 'YES', label: `Ja (+${ADDITIONAL_PRICES.edgeRubber}€)` },
    { value: 'NO', label: 'Nein' },
    { value: 'DISCRETION', label: 'Nach Ermessen' },
  ];

  // Preis für einzelne Position berechnen
  const calculatePositionPrice = (item: OrderItemFormData): number => {
    if (!item.sole && !item.trustProfessionals) return 0;
    return calculateItemPrice({
      quantity: Number(item.quantity) || 1,
      sole: item.sole as SoleType,
      edgeRubber: item.edgeRubber || 'NO',
      closure: item.closure || false,
      disinfection: item.disinfection || false,
      trustProfessionals: item.trustProfessionals || false,
    });
  };

  // Gesamtpreis
  const totalPrice = items?.reduce((sum, item) => sum + calculatePositionPrice(item), 0) || 0;

  // Neue Position hinzufügen
  const addItem = () => {
    append({
      quantity: 1,
      manufacturer: '',
      model: '',
      color: '',
      size: '',
      sole: '',
      edgeRubber: 'DISCRETION',
      closure: false,
      disinfection: false,
      trustProfessionals: false,
      additionalWork: '',
      internalNotes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Schuh-Positionen */}
      {fields.map((field, index) => {
        const itemPrice = items?.[index] ? calculatePositionPrice(items[index]) : 0;
        const trustProfessionals = items?.[index]?.trustProfessionals;

        return (
          <Card key={field.id} className="relative">
            {/* Header mit Nummer und Löschen-Button */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-[#38362d]">
                Schuhpaar {index + 1}
              </h4>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-[#ef6a27]">
                  KVA: {formatPrice(itemPrice)}
                </span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Position entfernen"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Anzahl (Schuhpaar) - NEU: mit 0.5 Option */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <label className="text-sm font-semibold text-[#38362d]" style={{ fontFamily: 'var(--font-display)' }}>
                    Schuhpaar<span className="text-[#ef6a27] ml-0.5">*</span>
                  </label>
                  <Tooltip
                    content={
                      <TooltipContent
                        title="Schuhpaar-Auswahl"
                        content="**1 Paar** = beide Schuhe zusammen\n**0,5 (Einzelschuh)** = nur ein Schuh (z.B. bei Verlust oder unterschiedlichem Verschleiß)"
                      />
                    }
                    position="top"
                    trigger="click"
                    maxWidth={280}
                  />
                </div>
                <Select
                  options={quantityOptions}
                  error={errors.items?.[index]?.quantity?.message}
                  {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                />
              </div>

              {/* Hersteller */}
              <Select
                label="Hersteller"
                options={manufacturerOptions}
                placeholder="Bitte wählen..."
                error={errors.items?.[index]?.manufacturer?.message}
                required
                {...register(`items.${index}.manufacturer` as const)}
              />

              {/* Größe - NEU: halbe Größen */}
              <Select
                label="Größe (EU)"
                options={sizeOptions}
                placeholder="Bitte wählen..."
                error={errors.items?.[index]?.size?.message}
                required
                {...register(`items.${index}.size` as const)}
              />

              {/* Modell */}
              <div>
                <Input
                  label="Modell"
                  placeholder="z.B. Solution"
                  error={errors.items?.[index]?.model?.message}
                  required
                  {...register(`items.${index}.model` as const)}
                />
                {/* Produktvorschläge aus dem Shop */}
                <ProductSuggestions
                  manufacturer={items?.[index]?.manufacturer || ''}
                  modelQuery={items?.[index]?.model || ''}
                />
              </div>

              {/* Farbe */}
              <Input
                label="Farbe (optional)"
                placeholder="z.B. Schwarz/Gelb"
                {...register(`items.${index}.color` as const)}
              />

              {/* Platzhalter für 3-Spalten-Grid */}
              <div className="hidden md:block" />
            </div>

            {/* "Profis machen lassen" Checkbox - NEU */}
            <div className="mt-6 p-4 bg-[#f0fdf4] rounded-lg border border-[#22c55e]/20">
              <Checkbox
                label="Ihr seid die Profis - macht was für den Schuh am sinnvollsten ist!"
                description="Wir wählen die beste Kombination aus Gummi und Randgummi für Ihren Schuh. Wir kontaktieren Sie vor der Reparatur."
                {...register(`items.${index}.trustProfessionals` as const)}
              />
            </div>

            {/* Reparatur-Optionen (nur wenn nicht "Profis machen lassen") */}
            {!trustProfessionals && (
              <div className="mt-6 pt-6 border-t border-[#e7e5e4]">
                <h5 className="text-sm font-semibold text-[#38362d] mb-4">Reparatur-Optionen</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sohle/Bauteil */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <label className="text-sm font-semibold text-[#38362d]" style={{ fontFamily: 'var(--font-display)' }}>
                        Gummi / Bauteil<span className="text-[#ef6a27] ml-0.5">*</span>
                      </label>
                      <Tooltip
                        content={<TooltipContent title={TOOLTIPS.sole.title} content={TOOLTIPS.sole.content} />}
                        position="top"
                        trigger="click"
                        maxWidth={320}
                      />
                    </div>
                    <Select
                      options={soleOptions}
                      placeholder="Bitte wählen..."
                      error={errors.items?.[index]?.sole?.message}
                      {...register(`items.${index}.sole` as const)}
                    />
                  </div>

                  {/* Randgummi */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <label className="text-sm font-semibold text-[#38362d]" style={{ fontFamily: 'var(--font-display)' }}>
                        Randgummi<span className="text-[#ef6a27] ml-0.5">*</span>
                      </label>
                      <Tooltip
                        content={<TooltipContent title={TOOLTIPS.edgeRubber.title} content={TOOLTIPS.edgeRubber.content} />}
                        position="top"
                        trigger="click"
                        maxWidth={300}
                      />
                    </div>
                    <Select
                      options={edgeRubberOptions}
                      error={errors.items?.[index]?.edgeRubber?.message}
                      {...register(`items.${index}.edgeRubber` as const)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Zusatzoptionen */}
            <div className="mt-6 pt-6 border-t border-[#e7e5e4]">
              <h5 className="text-sm font-semibold text-[#38362d] mb-4">Zusatzoptionen</h5>
              <div className="space-y-3">
                {/* Verschluss - mit Paarpreis-Hinweis */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    label={`Verschluss reparieren (+${ADDITIONAL_PRICES.closure}€ Paarpreis)`}
                    {...register(`items.${index}.closure` as const)}
                  />
                  <Tooltip
                    content={<TooltipContent title={TOOLTIPS.closure.title} content={TOOLTIPS.closure.content} />}
                    position="top"
                    trigger="click"
                    maxWidth={300}
                  />
                </div>

                {/* Desinfektion - NEU als eigene Option */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    label={`Desinfektion (+${ADDITIONAL_PRICES.disinfection}€ pro Paar)`}
                    description="Antibakterielle Behandlung gegen Gerüche und Bakterien"
                    {...register(`items.${index}.disinfection` as const)}
                  />
                </div>
              </div>
            </div>

            {/* Zusatzarbeiten (Freitext) */}
            <div className="mt-4">
              <div className="flex items-center gap-1.5 mb-1">
                <label className="text-sm font-semibold text-[#38362d]" style={{ fontFamily: 'var(--font-display)' }}>
                  Weitere Zusatzarbeiten (optional)
                </label>
                <Tooltip
                  content={<TooltipContent title={TOOLTIPS.additionalWork.title} content={TOOLTIPS.additionalWork.content} />}
                  position="top"
                  trigger="click"
                  maxWidth={280}
                />
              </div>
              <textarea
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-[#ef6a27] focus:ring-2 focus:ring-[#ef6a27]/20 focus:outline-none resize-none"
                rows={2}
                placeholder="z.B. Fersenschlaufe nähen, Zehenkappe verstärken..."
                {...register(`items.${index}.additionalWork` as const)}
              />
            </div>

            {/* Interne Bemerkung */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#38362d] mb-1">
                Bemerkung / Intern (optional)
              </label>
              <textarea
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-[#ef6a27] focus:ring-2 focus:ring-[#ef6a27]/20 focus:outline-none resize-none"
                rows={2}
                placeholder="Interne Notizen..."
                {...register(`items.${index}.internalNotes` as const)}
              />
            </div>
          </Card>
        );
      })}

      {/* Weiteren Schuh hinzufügen */}
      <Button type="button" variant="outline" onClick={addItem} className="w-full">
        + Weiteres Schuhpaar hinzufügen
      </Button>

      {/* Gesamtsumme */}
      <Card className="bg-[#fff7ed] border-2 border-[#ef6a27]">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-[#38362d]">Kostenvoranschlag (KVA)</span>
          <span className="text-2xl font-bold text-[#ef6a27]">{formatPrice(totalPrice)}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          * Endgültiger Preis kann je nach tatsächlichem Reparaturaufwand abweichen.
          Versandkosten kommen hinzu.
        </p>
      </Card>

      {/* FAQ Accordion */}
      <FAQAccordion />
    </div>
  );
}
