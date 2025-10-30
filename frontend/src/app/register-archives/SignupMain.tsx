import React, { useState } from "react";
import InputForm from "../components/InputForm";
import Title from "../components/Title";
import NextButton from "../components/Buttons/NextButton";


const SignupMain = () => {

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  const handleNext = () => {
    console.log("Form data:", formData);

  };

  return (
    <div className="w-1/2 h-full bg-white text-black p-4 border">
      <div className="flex flex-col items-center w-1/2 m-55 gap-15">
          <Title title="Create your account" sub_title="Join Matcha – start by entering your email."/>
          <InputForm label="Email" value={formData.email} onChange={(val: string) => handleChange("email", val)}/>
          <InputForm label="Password" value={formData.password} onChange={(val: string) => handleChange("password", val)}/>
          <InputForm label="Confirm password" value={formData.confirmPassword} onChange={(val: string) => handleChange("confirmPassword", val)}/>
          <NextButton text="Sign up" onClick={handleNext}/>
          <p>Already have an account? <a href="#" className="font-bold">Log in here</a></p>
      </div>
    </div>
  );
};

export default SignupMain;
