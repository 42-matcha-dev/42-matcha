import React from "react";

const Stepper = ({ currentStep }) => {
  const steps = ["Infos", "Profil", "Confirmation"];

  return (
    <div className="flex items-center w-full">
      {steps.map((label, index) => (
        <React.Fragment key={index}>
          {/* Circle */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0
              ${index <= currentStep ? "bg-secondary" : "bg-gray-300"}
            `}
          >
          </div>

          {/* Connector */}
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 transition-colors duration-300
                ${index < currentStep ? "bg-secondary" : "bg-gray-300"}
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Stepper;
