"use client";

import { z } from "zod";
import { registerSchema } from "../features/register/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Title from "@/app/components/Title";
import InputForm from "@/app/components/InputForm";
import NextButton from "@/app/components/Buttons/NextButton";
import { useRouter } from "next/navigation";

const registerSignupSchema = registerSchema.pick({
    email: true,
    password: true,
    repeatPassword: true
})

type registerSignupSchema = z.infer<typeof registerSignupSchema>;

export default function RegisterBasicForm() {

    const router = useRouter();
    const { register, handleSubmit, formState: { errors }} = useForm<registerSignupSchema>({
        resolver: zodResolver(registerSignupSchema),
        mode: "onBlur",
        defaultValues: {
            email: "",
            password: "",
            repeatPassword: ""
        }
    });

    const onSubmit = (data: registerSignupSchema) => {
        console.log(data);
        router.push("../register/basic")
    };

  return (
    <div className="flex justify-center items-center min-h-screen w-1/2 h-full bg-white text-black p-4 border">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center w-1/1.9 max-w-md p-5 gap-15">
          <Title title="Create your account" subTitle="Join Matcha – start by entering your email."/>
          <InputForm label="Email" type="text" error={errors.email} {...register("email")}/>
          <InputForm label="Password" type="password" error={errors.password} {...register("password")}/>
          <InputForm label="RepeatPassword" type="password" error={errors.repeatPassword} {...register("repeatPassword")}/>
          <NextButton text="Next"/>
      </form>
    </div>
  );
}