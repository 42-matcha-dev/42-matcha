import React, { useState } from "react";
import InputForm from "../components/InputForm";
import Title from "../components/Title";
import NextButton from "../components/Buttons/NextButton";
import BackButton from "../components/Buttons/BackButton";
import Stepper from "../components/Stepper";
import { useRouter } from "next/navigation";


const SignupDetail1 = () => {
  const router = useRouter();
  const currentStep = 1; // This will be 1 for the first step
  
  // Define the steps for the registration flow
  const steps: Step[] = [
    { id: 1, label: "Profile", href: "/register/profile" },
    { id: 2, label: "Photos", href: "/register/photos" },
    { id: 3, label: "Interests", href: "/register/interests" },
  ];

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    birthday: "",
    location: ""
  })

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  const handleNext = () => {
    // Save form data (could be to state management, localStorage, or API)
    console.log("Form data:", formData);
    
    // Navigate to the next step
    router.push(steps[currentStep].href);
  };
  
  // Handle step click in the stepper
  const handleStepClick = (step: Step) => {
    router.push(step.href);
  };

  return (
    <div className="w-1/2 h-full bg-white text-black p-4 border">
      {/* Add the Stepper at the top */}
      <div className="mb-8">
        <Stepper 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={handleStepClick}
        />
      </div>
      
      <div className="flex flex-col items-center w-1/2 m-55 gap-15">
          <Title title="Complete Your Profile" sub_title="Tell us more about you."/>
          <InputForm label="Gender" value={formData.firstName} onChange={(val: string) => handleChange("firstName", val)}/>
          <InputForm label="Looking For" value={formData.lastName} onChange={(val: string) => handleChange("lastName", val)}/>
          <InputForm label="Description" value={formData.birthday} onChange={(val: string) => handleChange("birthday", val)}/>
          <InputForm label="I'm curious about..." value={formData.location} onChange={(val: string) => handleChange("location", val)}/>
          <BackButton text="Back" onClick={handleNext}/>
          <NextButton text="Next" onClick={handleNext}/>
      </div>
    </div>
  );
};

export default SignupDetail1;
