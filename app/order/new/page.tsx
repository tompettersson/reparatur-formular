'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Stepper, WIZARD_STEPS } from '@/components/Stepper';
import { Button } from '@/components/ui/Button';
import { CustomerStep } from './steps/CustomerStep';
import { ShoesStep } from './steps/ShoesStep';
import { SummaryStep } from './steps/SummaryStep';
import { orderSchema, OrderFormData } from '@/lib/validation';
import { createOrder } from './actions';

export default function OrderWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form mit allen Feldern
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema) as any,
    defaultValues: {
      salutation: 'Herr',
      firstName: '',
      lastName: '',
      street: '',
      zip: '',
      city: '',
      phone: '',
      email: '',
      deliverySame: true,
      stationNotes: '',
      gdprAccepted: false,
      agbAccepted: false,
      newsletter: false,
      items: [
        {
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
        },
      ],
    },
    mode: 'onBlur',
  });

  const { register, handleSubmit, watch, setValue, control, formState: { errors }, trigger } = form;

  // Nächster Schritt
  const handleNext = async () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = await trigger([
        'salutation', 'firstName', 'lastName', 'street', 'zip', 'city', 'phone', 'email',
        'deliverySame', 'gdprAccepted', 'agbAccepted'
      ]);
    } else if (currentStep === 2) {
      isValid = await trigger(['items']);
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Vorheriger Schritt
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Formular absenden
  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await createOrder(data);

      if (result.success && result.orderId) {
        router.push(`/order/${result.orderId}/confirmation`);
      } else {
        setSubmitError(result.error || 'Ein Fehler ist aufgetreten');
      }
    } catch (error) {
      setSubmitError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo Placeholder */}
              <div className="w-10 h-10 bg-gradient-to-r from-[#efa335] to-[#ef6a27] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#38362d]">kletterschuhe.de</h1>
                <p className="text-xs text-gray-500">Reparatur-Auftragsformular</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Stepper */}
        <Stepper steps={WIZARD_STEPS} currentStep={currentStep} />

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step Content */}
          <div className="mb-8">
            {currentStep === 1 && (
              <CustomerStep
                register={register as any}
                errors={errors}
                watch={watch as any}
                setValue={setValue as any}
              />
            )}

            {currentStep === 2 && (
              <ShoesStep
                register={register as any}
                errors={errors}
                watch={watch as any}
                control={control as any}
              />
            )}

            {currentStep === 3 && (
              <SummaryStep watch={watch} />
            )}
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {submitError}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                Zurück
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button type="button" onClick={handleNext}>
                Weiter
              </Button>
            ) : (
              <Button type="submit" loading={isSubmitting}>
                Auftrag absenden
              </Button>
            )}
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} kletterschuhe.de - Alle Rechte vorbehalten</p>
        </div>
      </footer>
    </div>
  );
}
