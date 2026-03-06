"use client";

import { z } from "zod";
import { registerSchema } from "@/app/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Title from "@/app/components/Title";
import InputForm from "@/app/components/InputForm";
import NextButton from "@/app/components/Buttons/NextButton";
import { useRouter } from "next/navigation";
import { setCookie } from "@/utils/cookie.util";
import { toast } from "sonner";

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
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                let message = "Login failed"
                try {
                    const errorData = await response.json();
                    message = errorData.error ?? message;
                } catch {}
                toast.error(message)
                return;
            }

            const result = await response.json();
            toast.success('Login successful')
            // Store token in cookie
            if (result.token) {
                setCookie('token', result.token, 7); // 7 days expiration
            }
            router.push("/profile");
        } catch (error) {
            toast.error('Network error. Please try again.');
        }
    };

  return (
    <div className="flex justify-center items-center min-h-screen w-1/2 h-full bg-white text-black p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center w-1/1.9 max-w-md p-5 gap-15">
          <Title title="Welcome back" subTitle="Sign in to your Matcha account."/>
          <InputForm label="Email" type="text" error={errors.email} {...register("email")}/>
          <InputForm label="Password" type="password" error={errors.password} {...register("password")}/>
          <NextButton text="Log in"/>
      </form>
    </div>
  );
}
