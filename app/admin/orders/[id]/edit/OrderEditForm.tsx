'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { updateOrder } from '../../actions';
import {
  SOLE_PRICES,
  MANUFACTURERS,
  SHOE_SIZES,
  ADDITIONAL_PRICES,
  calculateItemPrice,
  formatPrice,
  type SoleType,
  type EdgeRubberOption,
} from '@/lib/pricing';
import type { Order, OrderItem, EdgeRubber } from '@/app/generated/prisma/client';

const SALUTATIONS = [
  { value: 'Herr', label: 'Herr' },
  { value: 'Frau', label: 'Frau' },
  { value: 'Divers', label: 'Divers' },
];

const SOLE_OPTIONS = Object.entries(SOLE_PRICES).map(([value, info]) => ({
  value,
  label: `${info.label} (${info.thickness}) – ${info.price}€`,
}));

const EDGE_RUBBER_OPTIONS = [
  { value: 'YES', label: `Ja (+${ADDITIONAL_PRICES.edgeRubber}€)` },
  { value: 'NO', label: 'Nein' },
  { value: 'DISCRETION', label: 'Nach Ermessen' },
];

interface FormData {
  customer: {
    salutation: string;
    firstName: string;
    lastName: string;
    street: string;
    zip: string;
    city: string;
    phone: string;
    email: string;
    deliverySame: boolean;
    deliverySalutation: string;
    deliveryFirstName: string;
    deliveryLastName: string;
    deliveryStreet: string;
    deliveryZip: string;
    deliveryCity: string;
    stationNotes: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    manufacturer: string;
    model: string;
    color: string;
    size: string;
    sole: string;
    edgeRubber: EdgeRubber;
    closure: boolean;
    additionalWork: string;
    internalNotes: string;
  }>;
}

interface OrderEditFormProps {
  order: Order & { items: OrderItem[] };
}

export function OrderEditForm({ order }: OrderEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { register, control, watch, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      customer: {
        salutation: order.salutation,
        firstName: order.firstName,
        lastName: order.lastName,
        street: order.street,
        zip: order.zip,
        city: order.city,
        phone: order.phone,
        email: order.email,
        deliverySame: order.deliverySame,
        deliverySalutation: order.deliverySalutation || '',
        deliveryFirstName: order.deliveryFirstName || '',
        deliveryLastName: order.deliveryLastName || '',
        deliveryStreet: order.deliveryStreet || '',
        deliveryZip: order.deliveryZip || '',
        deliveryCity: order.deliveryCity || '',
        stationNotes: order.stationNotes || '',
      },
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        manufacturer: item.manufacturer,
        model: item.model,
        color: item.color || '',
        size: item.size,
        sole: item.sole,
        edgeRubber: item.edgeRubber,
        closure: item.closure,
        additionalWork: item.additionalWork || '',
        internalNotes: item.internalNotes || '',
      })),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const deliverySame = watch('customer.deliverySame');

  // Calculate prices
  const itemPrices = watchedItems.map((item) =>
    calculateItemPrice({
      quantity: item.quantity,
      sole: item.sole as SoleType,
      edgeRubber: item.edgeRubber as EdgeRubberOption,
      closure: item.closure,
      hasAdditionalWork: Boolean(item.additionalWork?.trim()),
    })
  );

  const totalPrice = itemPrices.reduce((sum, price) => sum + price, 0);

  const onSubmit = async (data: FormData) => {
    setError(null);

    startTransition(async () => {
      const result = await updateOrder({
        orderId: order.id,
        customer: {
          ...data.customer,
          deliverySalutation: data.customer.deliverySame ? null : data.customer.deliverySalutation || null,
          deliveryFirstName: data.customer.deliverySame ? null : data.customer.deliveryFirstName || null,
          deliveryLastName: data.customer.deliverySame ? null : data.customer.deliveryLastName || null,
          deliveryStreet: data.customer.deliverySame ? null : data.customer.deliveryStreet || null,
          deliveryZip: data.customer.deliverySame ? null : data.customer.deliveryZip || null,
          deliveryCity: data.customer.deliverySame ? null : data.customer.deliveryCity || null,
          stationNotes: data.customer.stationNotes || null,
        },
        items: data.items.map((item, index) => ({
          ...item,
          color: item.color || null,
          additionalWork: item.additionalWork || null,
          internalNotes: item.internalNotes || null,
          calculatedPrice: itemPrices[index],
        })),
        totalPrice,
      });

      if (result.success) {
        router.push(`/admin/orders/${order.id}`);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Data */}
      <Card title="Kundendaten">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Anrede"
            options={SALUTATIONS}
            {...register('customer.salutation', { required: true })}
          />
          <div /> {/* Spacer */}
          <Input
            label="Vorname"
            {...register('customer.firstName', { required: true })}
            error={errors.customer?.firstName?.message}
          />
          <Input
            label="Nachname"
            {...register('customer.lastName', { required: true })}
            error={errors.customer?.lastName?.message}
          />
          <Input
            label="Straße & Hausnummer"
            {...register('customer.street', { required: true })}
            error={errors.customer?.street?.message}
            className="md:col-span-2"
          />
          <Input
            label="PLZ"
            {...register('customer.zip', { required: true })}
            error={errors.customer?.zip?.message}
          />
          <Input
            label="Stadt"
            {...register('customer.city', { required: true })}
            error={errors.customer?.city?.message}
          />
          <Input
            label="Telefon"
            type="tel"
            {...register('customer.phone', { required: true })}
            error={errors.customer?.phone?.message}
          />
          <Input
            label="E-Mail"
            type="email"
            {...register('customer.email', { required: true })}
            error={errors.customer?.email?.message}
          />
        </div>

        {/* Delivery Address */}
        <div className="mt-6 pt-6 border-t">
          <Checkbox
            label="Lieferadresse entspricht Rechnungsadresse"
            {...register('customer.deliverySame')}
          />

          {!deliverySame && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Select
                label="Anrede"
                options={SALUTATIONS}
                {...register('customer.deliverySalutation')}
              />
              <div /> {/* Spacer */}
              <Input
                label="Vorname"
                {...register('customer.deliveryFirstName')}
              />
              <Input
                label="Nachname"
                {...register('customer.deliveryLastName')}
              />
              <Input
                label="Straße & Hausnummer"
                {...register('customer.deliveryStreet')}
                className="md:col-span-2"
              />
              <Input
                label="PLZ"
                {...register('customer.deliveryZip')}
              />
              <Input
                label="Stadt"
                {...register('customer.deliveryCity')}
              />
            </div>
          )}

          <div className="mt-4">
            <Input
              label="Lieferhinweise (Packstation etc.)"
              {...register('customer.stationNotes')}
              placeholder="z.B. Packstation 123, Postnummer 12345678"
            />
          </div>
        </div>
      </Card>

      {/* Items */}
      <Card title="Schuhe / Positionen">
        <div className="space-y-6">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Position {index + 1}</h3>
                <span className="text-xl font-bold text-[#ef6a27]">
                  {formatPrice(itemPrices[index])}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Anzahl (Paar)"
                  type="number"
                  min={1}
                  max={10}
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />
                <Select
                  label="Hersteller"
                  options={MANUFACTURERS.map((m) => ({ value: m, label: m }))}
                  {...register(`items.${index}.manufacturer`)}
                />
                <Input
                  label="Modell"
                  {...register(`items.${index}.model`)}
                />
                <Input
                  label="Farbe (optional)"
                  {...register(`items.${index}.color`)}
                />
                <Select
                  label="Größe"
                  options={SHOE_SIZES.map((s) => ({ value: s, label: s }))}
                  {...register(`items.${index}.size`)}
                />
                <Select
                  label="Sohle"
                  options={SOLE_OPTIONS}
                  {...register(`items.${index}.sole`)}
                />
                <Select
                  label="Randgummi"
                  options={EDGE_RUBBER_OPTIONS}
                  {...register(`items.${index}.edgeRubber`)}
                />
                <div className="flex items-end pb-2">
                  <Checkbox
                    label={`Verschluss-Reparatur (+${ADDITIONAL_PRICES.closure}€)`}
                    {...register(`items.${index}.closure`)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Input
                  label="Zusatzarbeiten (Kunde)"
                  {...register(`items.${index}.additionalWork`)}
                  placeholder="z.B. Desinfektion, Fersen-Polster erneuern..."
                />
              </div>

              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <label className="block text-sm font-medium text-yellow-800 mb-1">
                  Interne Bemerkung (nicht für Kunde sichtbar)
                </label>
                <textarea
                  {...register(`items.${index}.internalNotes`)}
                  rows={2}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-[#ef6a27] focus:border-transparent resize-none bg-white"
                  placeholder="z.B. Starker Verschleiß, Naht beschädigt..."
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-6 mt-6 border-t">
          <span className="text-lg font-semibold">Gesamtsumme (KVA)</span>
          <span className="text-2xl font-bold text-[#ef6a27]">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/admin/orders/${order.id}`)}
        >
          Abbrechen
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Speichern...' : 'Änderungen speichern'}
        </Button>
      </div>
    </form>
  );
}
