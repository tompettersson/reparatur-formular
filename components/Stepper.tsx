'use client';

interface Step {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

// Icons for each step - clean, professional design
const StepIcons = {
  customer: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  // Simple sneaker icon - side profile
  shoes: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18h20v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2z" />
      <path d="M2 18c0-3 1-5 4-6l3-1c2-.5 4-2 5-4l1.5 1c.5 1 1.5 2 3.5 2h3v8" />
      <circle cx="6" cy="19" r="1" fill="currentColor" />
      <circle cx="18" cy="19" r="1" fill="currentColor" />
    </svg>
  ),
  summary: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
};

const CheckIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="checkmark-icon"
  >
    <path d="M5 12l5 5L20 7" />
  </svg>
);

export function Stepper({ steps, currentStep }: StepperProps) {
  // Calculate progress percentage
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  const getStepIcon = (stepId: number) => {
    switch (stepId) {
      case 1:
        return StepIcons.customer;
      case 2:
        return StepIcons.shoes;
      case 3:
        return StepIcons.summary;
      default:
        return stepId;
    }
  };

  return (
    <div className="stepper-container">
      <nav aria-label="Fortschritt" className="stepper">
        {/* Progress Track */}
        <div className="stepper-track" aria-hidden="true">
          <div
            className="stepper-track-progress"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <div
              key={step.id}
              className={`stepper-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
            >
              {/* Step Circle */}
              <div
                className="stepper-icon"
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <CheckIcon />
                ) : (
                  getStepIcon(step.id)
                )}
              </div>

              {/* Step Label */}
              <div className="stepper-content">
                <span className="stepper-title">{step.title}</span>
                <span className="stepper-description">{step.description}</span>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

// Default steps configuration
export const WIZARD_STEPS: Step[] = [
  { id: 1, title: 'Kundendaten', description: 'Ihre Kontaktdaten' },
  { id: 2, title: 'Schuhe', description: 'Reparaturdetails' },
  { id: 3, title: 'Zusammenfassung', description: 'Prüfen & Absenden' },
];
