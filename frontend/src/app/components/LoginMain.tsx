"use client";

import { z } from "zod";
import { registerSchema } from "../features/register/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Title from "@/app/components/Title";
import InputForm from "@/app/components/InputForm";
import NextButton from "@/app/components/Buttons/NextButton";
import { useRouter } from "next/navigation";

const loginSchema = registerSchema.pick({
    email: true,
    password: true
})

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginForm() {

    const router = useRouter();
    const { register, handleSubmit, formState: { errors }} = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        mode: "onBlur",
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const onSubmit = async (data: LoginSchema) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Login error:', errorData);
                // TODO: Show error message to user
                return;
            }

            const result = await response.json();
            console.log('Login successful:', result);
            // TODO: Handle token storage if returned
            router.push("/dashboard");
        } catch (error) {
            console.error('Login request failed:', error);
            // TODO: Show error message to user
        }
    };

  return (
    <div className="flex justify-center items-center min-h-screen w-1/2 h-full bg-white text-black p-4 border">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center w-1/1.9 max-w-md p-5 gap-15">
          <Title title="Welcome back" subTitle="Sign in to your Matcha account."/>
          <InputForm label="Email" type="text" error={errors.email} {...register("email")}/>
          <InputForm label="Password" type="password" error={errors.password} {...register("password")}/>
          <NextButton text="Sign in"/>
      </form>
    </div>
  );
}
