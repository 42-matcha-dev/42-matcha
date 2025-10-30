import React, { useState } from "react";
import InputForm from "../components/InputForm";
import Title from "../components/Title";
import NextButton from "../components/Buttons/NextButton";
import BackButton from "../components/Buttons/BackButton";
import Stepper from "./Stepper";
import { useRouter } from "next/navigation";

// Define types for our step and form data
interface Step {
  id: number;
  label: string;
  href: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  birthday: string;
  location: string;
}
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

  const handleNextPage = () => {
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
          <InputForm label="FirstName" value={formData.firstName} onChange={(val: string) => handleChange("firstName", val)}/>
          <InputForm label="LastName" value={formData.lastName} onChange={(val: string) => handleChange("lastName", val)}/>
          <InputForm label="Birthday" value={formData.birthday} onChange={(val: string) => handleChange("birthday", val)}/>
          <InputForm label="Location" value={formData.location} onChange={(val: string) => handleChange("location", val)}/>
          <BackButton text="Back" onClick={handleBackPage}/>
          <NextButton text="Next" onClick={handleNextPage}/>
      </div>
    </div>
  );
};

export default SignupDetail1;
