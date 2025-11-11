"use client";

import { Suspense, useState } from "react";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { registerSchema } from "@/app/schema";
import { motion, AnimatePresence } from "framer-motion";
import RegisterBasicForm from "@/app/components/SignupForms/RegisterBasicForm";
import RegisterSpecificForm from "@/app/components/SignupForms/RegisterSpecificForm";
import RegisterImagesForm from "@/app/components/SignupForms/RegisterImagesForm";

const safeRegisterSchema = registerSchema.omit({
  email: true,
  password: true,
  repeatPassword: true,
});

type FormData = z.infer<typeof safeRegisterSchema>;

function RegisterFormStepperContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0); // 1 = next, -1 = back
  const [formData, setFormData] = useState<Partial<FormData>>({});

  const updateData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmitFinal = async () => {
    try {
      if (!token) throw new Error("Missing token.");

      const parsedData = safeRegisterSchema.parse(formData);
      console.log("✅ Validation réussie :", parsedData);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/auth/register?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Registration failed:", errorData);
        alert(errorData.message || "Registration failed.");
        return;
      }

      const result = await response.json();
      console.log("Registration successful:", result);

      sessionStorage.removeItem("registerBasic");
      sessionStorage.removeItem("registerSpecific");

      router.push("/");
    } catch (err) {
      if (err instanceof z.ZodError) {
        alert("Formulaire invalide.");
        console.log(formData);
        console.log("Erreur: ", err);
        // alert(err.errors[0]?.message || "Formulaire invalide.");
      } else {
        console.error(err);
        alert((err as Error).message || "Erreur inconnue");
      }
    }
  };

      // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      position: "absolute" as const,
    }),
    center: {
      x: 0,
      opacity: 1,
      position: "relative" as const,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      position: "absolute" as const,
    }),
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const steps = [
    <RegisterBasicForm
      key="basic"
      onNext={handleNext}
      updateData={updateData}
      defaultValues={formData}
    />,
    <RegisterSpecificForm
      key="specific"
      onNext={handleNext}
      onBack={handleBack}
      updateData={updateData}
      defaultValues={formData}
    />,
    <RegisterImagesForm
      key="images"
      onBack={handleBack}
      updateData={updateData}
      defaultValues={formData}
      onSubmitFinal={handleSubmitFinal}
    />,
  ];

  return (
    <div className="relative w-full max-w-2xl mx-auto p-6  min-h-[600px]">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          variants={variants}
          custom={direction}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
        >
          {steps[currentStep]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function RegisterFormStepper() {
  return (
    <Suspense fallback={<div className="relative w-full max-w-2xl mx-auto p-6 min-h-[600px] flex items-center justify-center">Loading...</div>}>
      <RegisterFormStepperContent />
    </Suspense>
  );
}
