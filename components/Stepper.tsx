'use client';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <li key={step.id} className="relative flex items-center">
              {/* Connector Line */}
              {index > 0 && (
                <div
                  className={`absolute right-full w-16 h-0.5 mr-2 transition-colors duration-300 ${
                    isCompleted || isCurrent ? 'bg-[#ef6a27]' : 'bg-gray-300'
                  }`}
                />
              )}

              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    text-sm font-semibold transition-all duration-300
                    ${isCompleted
                      ? 'bg-[#ef6a27] text-white'
                      : isCurrent
                      ? 'bg-gradient-to-r from-[#efa335] to-[#ef6a27] text-white shadow-lg scale-110'
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step Title */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-[#ef6a27]' : isCompleted ? 'text-[#38362d]' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 max-w-[100px]">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line (right side) */}
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 ml-2 transition-colors duration-300 ${
                    isCompleted ? 'bg-[#ef6a27]' : 'bg-gray-300'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Default steps configuration
export const WIZARD_STEPS: Step[] = [
  { id: 1, title: 'Kundendaten', description: 'Ihre Kontaktdaten' },
  { id: 2, title: 'Schuhe', description: 'Reparaturdetails' },
  { id: 3, title: 'Zusammenfassung', description: 'Prüfen & Absenden' },
];
