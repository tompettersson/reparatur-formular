'use client';

import { ReactNode } from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, Control, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { ShoesFormData, OrderItemFormData } from '@/lib/validation';
import { SOLE_PRICES, MANUFACTURERS, SHOE_SIZES, calculateItemPrice, formatPrice, SoleType } from '@/lib/pricing';
import { TOOLTIPS } from '@/lib/tooltips';

// Helper component to render tooltip content with simple formatting
function TooltipContent({ title, content }: { title: string; content: string }) {
  // Process content safely - split into segments and render as React elements
  const processLine = (line: string, key: number): ReactNode => {
    // Split by bold markers
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
  const quantityOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
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
    { value: 'YES', label: 'Ja (+19€)' },
    { value: 'NO', label: 'Nein' },
    { value: 'DISCRETION', label: 'Nach Ermessen' },
  ];

  // Preis für einzelne Position berechnen
  const calculatePositionPrice = (item: OrderItemFormData): number => {
    if (!item.sole) return 0;
    return calculateItemPrice({
      quantity: Number(item.quantity) || 1,
      sole: item.sole as SoleType,
      edgeRubber: item.edgeRubber || 'NO',
      closure: item.closure || false,
      hasAdditionalWork: !!item.additionalWork,
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
      additionalWork: '',
      internalNotes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Info-Videos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Sohlen-Typen erklärt', 'Randgummi - Ja oder Nein?', 'Verschluss-Reparatur', 'Zusatzarbeiten'].map((title, i) => (
          <Card key={i} className="bg-gray-50">
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs">{title}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Schuh-Positionen */}
      {fields.map((field, index) => {
        const itemPrice = items?.[index] ? calculatePositionPrice(items[index]) : 0;

        return (
          <Card key={field.id} className="relative">
            {/* Header mit Nummer und Löschen-Button */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-[#38362d]">
                Schuh {index + 1}
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
              {/* Anzahl */}
              <Select
                label="Anzahl"
                options={quantityOptions}
                error={errors.items?.[index]?.quantity?.message}
                required
                {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
              />

              {/* Hersteller */}
              <Select
                label="Hersteller"
                options={manufacturerOptions}
                placeholder="Bitte wählen..."
                error={errors.items?.[index]?.manufacturer?.message}
                required
                {...register(`items.${index}.manufacturer` as const)}
              />

              {/* Größe */}
              <Select
                label="Größe"
                options={sizeOptions}
                placeholder="Bitte wählen..."
                error={errors.items?.[index]?.size?.message}
                required
                {...register(`items.${index}.size` as const)}
              />

              {/* Modell */}
              <Input
                label="Modell"
                placeholder="z.B. Solution"
                error={errors.items?.[index]?.model?.message}
                required
                {...register(`items.${index}.model` as const)}
              />

              {/* Farbe */}
              <Input
                label="Farbe (optional)"
                placeholder="z.B. Schwarz/Gelb"
                {...register(`items.${index}.color` as const)}
              />

              {/* Sohle */}
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

              {/* Verschluss */}
              <div className="flex items-end pb-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    label="Verschluss reparieren (+20€)"
                    {...register(`items.${index}.closure` as const)}
                  />
                  <Tooltip
                    content={<TooltipContent title={TOOLTIPS.closure.title} content={TOOLTIPS.closure.content} />}
                    position="top"
                    trigger="click"
                    maxWidth={300}
                  />
                </div>
              </div>
            </div>

            {/* Zusatzarbeiten */}
            <div className="mt-4">
              <div className="flex items-center gap-1.5 mb-1">
                <label className="text-sm font-semibold text-[#38362d]" style={{ fontFamily: 'var(--font-display)' }}>
                  Zusatzarbeiten (optional, +3€)
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
                placeholder="z.B. Desinfektion, Reinigung..."
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
        + Weiteren Schuh hinzufügen
      </Button>

      {/* Gesamtsumme */}
      <Card className="bg-gradient-to-r from-[#efa335]/10 to-[#ef6a27]/10 border-2 border-[#ef6a27]">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-[#38362d]">Kostenvoranschlag (KVA)</span>
          <span className="text-2xl font-bold text-[#ef6a27]">{formatPrice(totalPrice)}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          * Endgültiger Preis kann je nach tatsächlichem Reparaturaufwand abweichen
        </p>
      </Card>
    </div>
  );
}
