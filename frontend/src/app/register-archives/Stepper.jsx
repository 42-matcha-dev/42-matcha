// Stepper.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * Props:
 * - steps: [{ id: 1, label: "Étape 1", href: "/register/1" }, ...]
 * - currentStep: number (1-based index of current step)
 * - onStepClick?: (step) => void  optional
 */
export default function Stepper({ steps, currentStep = 1, onStepClick }) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const circleBase =
            "flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all";
          const circleClass = isCompleted
            ? "bg-blue-600 text-white"
            : isActive
            ? "bg-white border-2 border-blue-600 text-blue-600 shadow-sm"
            : "bg-white border border-gray-300 text-gray-500";

          // connector color (line between this and next)
          const connectorClass = isCompleted
            ? "bg-blue-600"
            : "bg-gray-200";

          return (
            <li key={step.id} className="flex-1 last:flex-none">
              <div className="flex items-center">
                {/* Circle */}
                <button
                  type="button"
                  onClick={() => (onStepClick ? onStepClick(step) : undefined)}
                  className={`${circleBase} ${circleClass} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`${step.label} ${isActive ? "(étape actuelle)" : ""}`}
                >
                  {isCompleted ? (
                    // check icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </button>

                {/* label (on larger screens) */}
                <span className="hidden md:inline-block ml-3 text-sm text-gray-600">
                  {step.label}
                </span>
              </div>

              {/* connector line (not after last) */}
              {idx !== steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`h-0.5 ${connectorClass} mt-2 md:mt-0`}
                  style={{ marginTop: 8 }}
                >
                  {/* To make the line expand between items, we will use a pseudo element layout by placing a full-width element below.
                      But because we are inside a flex row, we need an actual element spanning the gap:
                      We'll render a separate absolute/relative approach in the surrounding container in CSS if desired.
                  */}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Horizontal connectors using flex gaps — improved rendering below */}
      <div className="relative mt-4 md:mt-2 hidden md:block">
        <div className="absolute inset-x-0 top-4 h-1 flex items-center">
          {steps.map((_, idx) => {
            if (idx === steps.length - 1) return null;
            const stepNumber = idx + 1;
            const isCompleted = stepNumber < currentStep;
            return (
              <div
                key={idx}
                className={`flex-1 h-1 ${isCompleted ? "bg-blue-600" : "bg-gray-200"}`}
              />
            );
          })}
        </div>
      </div>

      {/* Mobile stacked connectors */}
      <div className="md:hidden mt-4">
        {steps.map((step, idx) => {
          if (idx === steps.length - 1) return null;
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          return (
            <div key={idx} className="flex items-center">
              <div className={`w-10 h-1 ${isCompleted ? "bg-blue-600" : "bg-gray-200"} mr-3`} />
              <div className="text-xs text-gray-500">{/* spacer */}</div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

Stepper.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
    })
  ).isRequired,
  currentStep: PropTypes.number,
  onStepClick: PropTypes.func,
};
