import React from "react";

const Stepper = ({ currentStep }) => {
  const steps = ["Infos", "Profil", "Confirmation"];

  return (
    <div className="flex items-center justify-center">
      {steps.map((label, index) => (
        <div key={index} className="flex items-center">
          {/* Cercle */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
              ${index <= currentStep ? "bg-blue-900" : "bg-gray-300"}
            `}
          >
            {index + 1}
          </div>

          {/* Ligne entre les cercles (sauf le dernier) */}
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 w-14 transition-colors duration-300 
                ${index < currentStep ? "bg-blue-900" : "bg-gray-300"}
              `}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Stepper;
