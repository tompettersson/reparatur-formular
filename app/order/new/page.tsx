'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Stepper, WIZARD_STEPS } from '@/components/Stepper';
import { Button, ArrowRight, ArrowLeft } from '@/components/ui/Button';
import { CustomerStep } from './steps/CustomerStep';
import { ShoesStep } from './steps/ShoesStep';
import { SummaryStep } from './steps/SummaryStep';
import { orderSchema, OrderFormData } from '@/lib/validation';
import { createOrder } from './actions';

// Hammer/tool icon for repair service
const ToolIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

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
    <div className="min-h-screen bg-[#f5f5f4] flex flex-col">
      {/* Header - Clean, flat design matching shop */}
      <header className="bg-white border-b border-[#e5e5e5] sticky top-0 z-50">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - matching shop style */}
            <div className="flex items-center gap-4">
              <Image
                src="/kletterschuhe-logo.png"
                alt="kletterschuhe.de"
                width={180}
                height={40}
                className="h-8 w-auto"
                priority
              />
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#ef6a27] text-white rounded-full text-sm font-medium">
                <ToolIcon />
                <span>Reparaturservice</span>
              </div>
            </div>

            {/* Help link */}
            <a
              href="mailto:info@kletterschuhe.de"
              className="flex items-center gap-2 text-sm text-[#78716c] hover:text-[#ef6a27] transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
              <span className="hidden sm:inline">Hilfe</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stepper */}
        <Stepper steps={WIZARD_STEPS} currentStep={currentStep} />

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          {/* Step Content with animation */}
          <div
            key={currentStep}
            className="animate-fade-in-up"
            style={{ animationDuration: '0.5s' }}
          >
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
            <div className="mt-6 p-4 bg-[#fee2e2] border border-[#ef4444]/20 rounded-[12px] flex items-start gap-3 animate-fade-in">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <p className="text-sm text-[#ef4444]">{submitError}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-8 border-t border-[#e7e5e4] flex flex-col sm:flex-row justify-between gap-4">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                icon={<ArrowLeft />}
                iconPosition="left"
              >
                Zurück
              </Button>
            ) : (
              <div className="hidden sm:block" />
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                icon={<ArrowRight />}
                iconPosition="right"
              >
                Weiter
              </Button>
            ) : (
              <Button
                type="submit"
                loading={isSubmitting}
                className="sm:min-w-[200px]"
              >
                {isSubmitting ? 'Wird gesendet...' : 'Auftrag absenden'}
              </Button>
            )}
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e7e5e4] mt-auto">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#78716c]">
              &copy; {new Date().getFullYear()} kletterschuhe.de
            </p>
            <div className="flex items-center gap-6 text-sm text-[#78716c]">
              <a href="#" className="hover:text-[#ef6a27] transition-colors">
                Impressum
              </a>
              <a href="#" className="hover:text-[#ef6a27] transition-colors">
                Datenschutz
              </a>
              <a href="#" className="hover:text-[#ef6a27] transition-colors">
                AGB
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
