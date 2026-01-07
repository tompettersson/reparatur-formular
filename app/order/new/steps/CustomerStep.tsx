'use client';

import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { CustomerFormData } from '@/lib/validation';

interface CustomerStepProps {
  register: UseFormRegister<CustomerFormData>;
  errors: FieldErrors<CustomerFormData>;
  watch: UseFormWatch<CustomerFormData>;
  setValue: UseFormSetValue<CustomerFormData>;
}

export function CustomerStep({ register, errors, watch, setValue }: CustomerStepProps) {
  const deliverySame = watch('deliverySame');

  const salutationOptions = [
    { value: 'Herr', label: 'Herr' },
    { value: 'Frau', label: 'Frau' },
    { value: 'Divers', label: 'Divers' },
  ];

  return (
    <div className="space-y-6">
      {/* Video-Embed Placeholder */}
      <Card title="So funktioniert die Reparatur" className="bg-gray-50">
        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">Video: Ablauf der Reparatur</p>
            <p className="text-xs mt-1">(Video-URL folgt)</p>
          </div>
        </div>
      </Card>

      {/* Rechnungsadresse */}
      <Card title="Rechnungsadresse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Anrede"
            options={salutationOptions}
            error={errors.salutation?.message}
            required
            {...register('salutation')}
          />
          <div /> {/* Spacer */}

          <Input
            label="Vorname"
            placeholder="Max"
            error={errors.firstName?.message}
            required
            {...register('firstName')}
          />
          <Input
            label="Nachname"
            placeholder="Mustermann"
            error={errors.lastName?.message}
            required
            {...register('lastName')}
          />

          <div className="md:col-span-2">
            <Input
              label="Straße und Hausnummer"
              placeholder="Musterstraße 1"
              error={errors.street?.message}
              required
              {...register('street')}
            />
          </div>

          <Input
            label="PLZ"
            placeholder="12345"
            error={errors.zip?.message}
            required
            {...register('zip')}
          />
          <Input
            label="Ort"
            placeholder="Musterstadt"
            error={errors.city?.message}
            required
            {...register('city')}
          />

          <Input
            label="Telefon"
            type="tel"
            placeholder="+49 123 456789"
            error={errors.phone?.message}
            required
            {...register('phone')}
          />
          <Input
            label="E-Mail"
            type="email"
            placeholder="max@beispiel.de"
            error={errors.email?.message}
            required
            {...register('email')}
          />
        </div>
      </Card>

      {/* Lieferadresse Toggle */}
      <Card>
        <Checkbox
          label="Lieferadresse entspricht der Rechnungsadresse"
          {...register('deliverySame')}
        />
      </Card>

      {/* Abweichende Lieferadresse */}
      {!deliverySame && (
        <Card title="Abweichende Lieferadresse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Anrede"
              options={salutationOptions}
              {...register('deliverySalutation')}
            />
            <div />

            <Input
              label="Vorname"
              placeholder="Max"
              error={errors.deliveryFirstName?.message}
              {...register('deliveryFirstName')}
            />
            <Input
              label="Nachname"
              placeholder="Mustermann"
              {...register('deliveryLastName')}
            />

            <div className="md:col-span-2">
              <Input
                label="Straße und Hausnummer"
                placeholder="Musterstraße 1"
                {...register('deliveryStreet')}
              />
            </div>

            <Input
              label="PLZ"
              placeholder="12345"
              {...register('deliveryZip')}
            />
            <Input
              label="Ort"
              placeholder="Musterstadt"
              {...register('deliveryCity')}
            />
          </div>
        </Card>
      )}

      {/* Zusätzliche Hinweise */}
      <Card title="Zusätzliche Hinweise (optional)">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#38362d] mb-1">
              Poststation / Packstation / Lieferhinweise
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-[#ef6a27] focus:ring-2 focus:ring-[#ef6a27]/20 focus:outline-none resize-none"
              rows={3}
              placeholder="z.B. Packstation 123, Postnummer 12345678"
              {...register('stationNotes')}
            />
          </div>
        </div>
      </Card>

      {/* Einwilligungen */}
      <Card title="Einwilligungen">
        <div className="space-y-4">
          <Checkbox
            label="Ich habe die Datenschutzerklärung gelesen und akzeptiere diese. *"
            error={errors.gdprAccepted?.message}
            required
            {...register('gdprAccepted')}
          />
          <Checkbox
            label="Ich habe die AGB gelesen und akzeptiere diese. *"
            error={errors.agbAccepted?.message}
            required
            {...register('agbAccepted')}
          />
          <Checkbox
            label="Ich möchte den Newsletter erhalten (optional)"
            {...register('newsletter')}
          />
        </div>
      </Card>
    </div>
  );
}
