"use client";

import { Suspense, useEffect } from "react";
import { z } from "zod";
import { registerSchema } from "@/app/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Title from "@/app/components/Title";
import InputForm from "@/app/components/InputForm";
import NextButton from "@/app/components/Buttons/NextButton";
import Stepper from "@/app/components/Stepper";

const registerBasicSchema = registerSchema.pick({
    firstName: true,
    lastName: true,
    birthday: true,
    location: true
});

type RegisterBasicSchema = z.infer<typeof registerBasicSchema>;

interface Props {
  onNext: () => void;
  updateData: (data: Partial<RegisterBasicSchema>) => void;
  defaultValues: Partial<RegisterBasicSchema>;
}

function RegisterBasicFormContent({ onNext, updateData, defaultValues }: Props) {
  const { register, handleSubmit, formState: { errors }, setValue} = useForm<RegisterBasicSchema>({
      resolver: zodResolver(registerBasicSchema),
      mode: "onBlur",
      defaultValues: {
          firstName: defaultValues.firstName || "",
          lastName: defaultValues.lastName || "",
          birthday: defaultValues.birthday || "",
          location: defaultValues.location || ""
      }
  });

  useEffect(() => {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        setValue(key as keyof RegisterBasicSchema, value as RegisterBasicSchema[keyof RegisterBasicSchema]);
      });
    }
  }, [defaultValues, setValue]);

  const onSubmit = (data: RegisterBasicSchema) => {
    updateData(data);
    console.log("RegisterBasicForm: ", data);
    onNext();
  };

  return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-left w-full m-7 gap-11">
          <Title title="Complete Your Profile" subTitle="Tell us more about you."/>
          <Stepper currentStep="0" />
          <InputForm label="firstName" type="text" error={errors.firstName} {...register("firstName")}/>
          <InputForm label="lastName" type="text" error={errors.lastName}{...register("lastName")}/>
          <InputForm label="birthday" type="date" error={errors.birthday}{...register("birthday")} />
          <InputForm label="location" type="text" error={errors.location} {...register("location")}/>
          <NextButton text="Next"/>
      </form>
  );
}

export default function RegisterBasicForm(props: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterBasicFormContent {...props}/>
    </Suspense>
  );
}
