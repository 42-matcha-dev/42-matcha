"use client";

import { z } from "zod";
import { registerSchema } from "../schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Title from "@/app/components/Title";
import InputForm from "@/app/components/InputForm";
import NextButton from "@/app/components/Buttons/NextButton";
import { useRouter } from "next/navigation";
import Stepper from "@/app/components/Stepper";

const registerBasicSchema = registerSchema.pick({
    firstName: true,
    lastName: true,
    birthday: true,
    location: true
});

type registerBasicSchema = z.infer<typeof registerBasicSchema>;

export default function RegisterBasicForm() {

    const router = useRouter();
    const { register, handleSubmit, formState: { errors }} = useForm<registerBasicSchema>({
        resolver: zodResolver(registerBasicSchema),
        mode: "onBlur",
        defaultValues: {
            firstName: "",
            lastName: "",
            birthday: "",
            location: ""
        }
    });

    const onSubmit = (data: registerBasicSchema) => {
        console.log(data);
        router.push("/register/specific")
    };

  return (
    <div className="w-1/2 h-full bg-white text-black p-4 border">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-left w-1/2 m-55 gap-15">
          <Title title="Complete Your Profile" subTitle="Tell us more about you."/>
          <Stepper currentStep="0" />
          <InputForm label="firstName" type="text" error={errors.firstName} {...register("firstName")}/>
          <InputForm label="lastName" type="text" error={errors.lastName}{...register("lastName")}/>
          <InputForm label="birthday" type="date" error={errors.birthday}{...register("birthday")} />
          <InputForm label="location" type="text" error={errors.location} {...register("location")}/>
          <NextButton text="Next"/>
      </form>
    </div>
  );
}