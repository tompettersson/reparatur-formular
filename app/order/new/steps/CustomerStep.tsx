'use client';

import { useState, useEffect, useRef } from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { CustomerFormData, SUPPORTED_COUNTRIES } from '@/lib/validation';
import { findCustomerByEmail, CustomerData } from '../actions';
import { TrustBadges } from '@/components/TrustBadges';

interface CustomerStepProps {
  register: UseFormRegister<CustomerFormData>;
  errors: FieldErrors<CustomerFormData>;
  watch: UseFormWatch<CustomerFormData>;
  setValue: UseFormSetValue<CustomerFormData>;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Icons
const VideoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const TruckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const PackageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const LoadingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export function CustomerStep({ register, errors, watch, setValue }: CustomerStepProps) {
  const deliverySame = watch('deliverySame');
  const email = watch('email');
  const packstationNumber = watch('packstationNumber');

  // Autofill state
  const [isSearching, setIsSearching] = useState(false);
  const [autofillMessage, setAutofillMessage] = useState<string | null>(null);
  const hasAutofilledRef = useRef<string | null>(null);

  // Debounce email input
  const debouncedEmail = useDebounce(email, 500);

  // Email autofill effect
  useEffect(() => {
    const performAutofill = async () => {
      if (!debouncedEmail || debouncedEmail.length < 5 || !debouncedEmail.includes('@')) {
        return;
      }

      if (hasAutofilledRef.current === debouncedEmail) {
        return;
      }

      setIsSearching(true);
      setAutofillMessage(null);

      try {
        const customerData = await findCustomerByEmail(debouncedEmail);

        if (customerData.found) {
          if (customerData.salutation) setValue('salutation', customerData.salutation as 'Herr' | 'Frau' | 'Divers');
          if (customerData.firstName) setValue('firstName', customerData.firstName);
          if (customerData.lastName) setValue('lastName', customerData.lastName);
          if (customerData.street) setValue('street', customerData.street);
          if (customerData.houseNumber) setValue('houseNumber', customerData.houseNumber);
          if (customerData.zip) setValue('zip', customerData.zip);
          if (customerData.city) setValue('city', customerData.city);
          if (customerData.country) setValue('country', customerData.country);
          if (customerData.phone) setValue('phone', customerData.phone);

          if (customerData.deliverySame !== undefined) {
            setValue('deliverySame', customerData.deliverySame);
          }
          if (!customerData.deliverySame) {
            if (customerData.deliverySalutation) setValue('deliverySalutation', customerData.deliverySalutation as 'Herr' | 'Frau' | 'Divers');
            if (customerData.deliveryFirstName) setValue('deliveryFirstName', customerData.deliveryFirstName);
            if (customerData.deliveryLastName) setValue('deliveryLastName', customerData.deliveryLastName);
            if (customerData.deliveryStreet) setValue('deliveryStreet', customerData.deliveryStreet);
            if (customerData.deliveryHouseNumber) setValue('deliveryHouseNumber', customerData.deliveryHouseNumber);
            if (customerData.deliveryZip) setValue('deliveryZip', customerData.deliveryZip);
            if (customerData.deliveryCity) setValue('deliveryCity', customerData.deliveryCity);
            if (customerData.deliveryCountry) setValue('deliveryCountry', customerData.deliveryCountry);
          }

          hasAutofilledRef.current = debouncedEmail;
          setAutofillMessage(`Willkommen zurück, ${customerData.firstName}! Daten wurden ausgefüllt.`);
          setTimeout(() => setAutofillMessage(null), 5000);
        }
      } catch (error) {
        console.error('Autofill error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    performAutofill();
  }, [debouncedEmail, setValue]);

  const salutationOptions = [
    { value: 'Herr', label: 'Herr' },
    { value: 'Frau', label: 'Frau' },
    { value: 'Divers', label: 'Divers' },
  ];

  const countryOptions = SUPPORTED_COUNTRIES.map(c => ({
    value: c.code,
    label: c.label,
  }));

  return (
    <div className="space-y-6">
      {/* Video-Embed */}
      <Card
        title="So funktioniert die Reparatur"
        subtitle="Kurzes Video ansehen"
        icon={<VideoIcon />}
        variant="elevated"
      >
        <div className="relative aspect-video rounded-[12px] overflow-hidden">
          <iframe
            src="https://www.youtube-nocookie.com/embed/PwaIotj5Tqo?rel=0&modestbranding=1"
            title="Optimale Kletterschuh Reparatur: Originalbauteile vs. Halbsohle"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </Card>

      {/* Rechnungsadresse */}
      <Card
        title="Rechnungsadresse"
        subtitle="Ihre Kontaktdaten für die Rechnung"
        icon={<UserIcon />}
        variant="elevated"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select
            label="Anrede"
            options={salutationOptions}
            error={errors.salutation?.message}
            required
            {...register('salutation')}
          />
          <div className="hidden md:block" />

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

          {/* Straße und Hausnummer GETRENNT */}
          <div className="md:col-span-2 grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Input
                label="Straße"
                placeholder="Musterstraße"
                error={errors.street?.message}
                required
                {...register('street')}
              />
            </div>
            <div>
              <Input
                label="Hausnr."
                placeholder="1"
                error={errors.houseNumber?.message}
                required
                {...register('houseNumber')}
              />
            </div>
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

          {/* NEU: Land-Dropdown */}
          <Select
            label="Land"
            options={countryOptions}
            error={errors.country?.message}
            required
            {...register('country')}
          />
          <div className="hidden md:block" />

          <Input
            label="Telefon"
            type="tel"
            placeholder="+49 123 456789"
            error={errors.phone?.message}
            hint="Für Rückfragen zur Reparatur"
            required
            {...register('phone')}
          />
          <div className="relative">
            <Input
              label="E-Mail"
              type="email"
              placeholder="max@beispiel.de"
              error={errors.email?.message}
              hint={autofillMessage || "Für Auftragsbestätigung und Status"}
              required
              {...register('email')}
            />
            {isSearching && (
              <div className="absolute right-3 top-[38px] text-[#78716c]">
                <LoadingIcon />
              </div>
            )}
            {autofillMessage && (
              <div className="absolute right-3 top-[38px] text-[#22c55e]">
                <CheckCircleIcon />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Autofill Success Notification */}
      {autofillMessage && (
        <div className="bg-[#dcfce7] border border-[#22c55e]/30 rounded-lg p-4 flex items-center gap-3 animate-fade-in-up">
          <div className="text-[#22c55e]">
            <CheckCircleIcon />
          </div>
          <p className="text-sm text-[#166534] font-medium">{autofillMessage}</p>
        </div>
      )}

      {/* Lieferadresse Toggle */}
      <Card variant="default">
        <Checkbox
          label="Lieferadresse entspricht der Rechnungsadresse"
          description="Die reparierten Schuhe werden an Ihre Rechnungsadresse zurückgeschickt"
          {...register('deliverySame')}
        />
      </Card>

      {/* Abweichende Lieferadresse */}
      {!deliverySame && (
        <Card
          title="Abweichende Lieferadresse"
          subtitle="Wohin sollen die Schuhe gesendet werden?"
          icon={<TruckIcon />}
          variant="elevated"
          className="animate-fade-in-up"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select
              label="Anrede"
              options={salutationOptions}
              {...register('deliverySalutation')}
            />
            <div className="hidden md:block" />

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

            {/* Straße und Hausnummer GETRENNT */}
            <div className="md:col-span-2 grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Input
                  label="Straße"
                  placeholder="Musterstraße"
                  {...register('deliveryStreet')}
                />
              </div>
              <div>
                <Input
                  label="Hausnr."
                  placeholder="1"
                  {...register('deliveryHouseNumber')}
                />
              </div>
            </div>

            <Input
              label="PLZ"
              placeholder="12345"
              error={errors.deliveryZip?.message}
              {...register('deliveryZip')}
            />
            <Input
              label="Ort"
              placeholder="Musterstadt"
              {...register('deliveryCity')}
            />

            {/* Land für Lieferadresse */}
            <Select
              label="Land"
              options={countryOptions}
              {...register('deliveryCountry')}
            />
          </div>
        </Card>
      )}

      {/* Packstation/DHL (separate Felder) */}
      <Card
        title="DHL Packstation / Lieferhinweise"
        subtitle="Optional - falls Sie an eine Packstation liefern möchten"
        icon={<PackageIcon />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Packstation-Nummer"
              placeholder="z.B. 123"
              hint="Die 3-stellige Nummer Ihrer Packstation"
              {...register('packstationNumber')}
            />
            <Input
              label="DHL Postnummer"
              placeholder="z.B. 12345678"
              hint="Ihre persönliche DHL Kundennummer"
              {...register('postNumber')}
            />
          </div>

          {/* DHL Standort-Finder Link */}
          <a
            href="https://www.dhl.de/de/privatkunden/dhl-standorte-finden.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[#3ca1ac] hover:text-[#2d8a94] transition-colors font-medium"
          >
            <ExternalLinkIcon />
            DHL Packstation in Ihrer Nähe finden
          </a>

          <div>
            <label
              htmlFor="deliveryNotes"
              className="block text-sm font-semibold text-[#38362d] mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Sonstige Lieferhinweise
            </label>
            <textarea
              id="deliveryNotes"
              className="
                w-full px-4 py-3 rounded-[10px]
                bg-white text-[#38362d] placeholder-[#a8a29e]
                border-2 border-[#e7e5e4]
                transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                hover:border-[#d6d3d1] focus:border-[#ef6a27] focus:ring-4 focus:ring-[#ef6a27]/10
                focus:outline-none resize-none
              "
              rows={2}
              placeholder="z.B. Bitte bei Nachbar abgeben, Hintereingang nutzen..."
              {...register('deliveryNotes')}
            />
          </div>
        </div>
      </Card>

      {/* Einwilligungen */}
      <Card
        title="Einwilligungen"
        subtitle="Bitte bestätigen Sie die erforderlichen Punkte"
        icon={<ShieldIcon />}
        variant="elevated"
      >
        <div className="space-y-2">
          <Checkbox
            label={
              <>
                Ich habe die{' '}
                <a
                  href="https://www.kletterschuhe.de/datenschutz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3ca1ac] hover:underline"
                >
                  Datenschutzerklärung
                </a>{' '}
                gelesen und akzeptiere diese.
              </>
            }
            error={errors.gdprAccepted?.message}
            required
            {...register('gdprAccepted')}
          />
          <Checkbox
            label={
              <>
                Ich habe die{' '}
                <a
                  href="https://www.kletterschuhe.de/agb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3ca1ac] hover:underline"
                >
                  AGB
                </a>{' '}
                gelesen und akzeptiere diese.
              </>
            }
            error={errors.agbAccepted?.message}
            required
            {...register('agbAccepted')}
          />
          <div className="pt-2 border-t border-[#f5f5f4] mt-3">
            <Checkbox
              label="Ich möchte den Newsletter erhalten"
              description="Neuigkeiten zu Reparaturen, Tipps zur Schuhpflege und exklusive Angebote"
              {...register('newsletter')}
            />
          </div>
        </div>

        {/* Trust-Badges */}
        <TrustBadges />
      </Card>
    </div>
  );
}
