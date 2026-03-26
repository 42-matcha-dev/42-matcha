"use client";

import { z } from "zod";
import { registerSchema } from "@/app/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Title from "@/app/components/Title";
import InputForm from "@/app/components/InputForm";
import NextButton from "@/app/components/Buttons/NextButton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const registerSignupSchema = z.object({
    email: registerSchema.shape.email,
    password: registerSchema.shape.password,
    repeatPassword: z.string(),
}).refine((data) => data.password === data.repeatPassword, {
    message: 'Passwords do not match.',
    path: ['repeatPassword'],
})

type registerSignupSchema = z.infer<typeof registerSignupSchema>;

export default function RegisterBasicForm() {

    const router = useRouter();
    const { register, handleSubmit, setError, clearErrors, formState: { errors }} = useForm<registerSignupSchema>({
        resolver: zodResolver(registerSignupSchema),
        mode: "onBlur",
        defaultValues: {
            email: "",
            password: "",
            repeatPassword: ""
        }
    });

    const onSubmit = async (data: registerSignupSchema) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiUrl}/api/auth/signup`, {
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
                if (errorData.field === "password") {
                    setError("password", { type: "server", message: errorData.error });
                } else {
                    toast.error(errorData.error || "Signup failed. Please try again.");
                }
                return;
            }

            toast.success("Signup success: Please check your email to complete the registration")
            router.push("/email-sent");
        } catch (error) {
            toast.error((error as Error).message || "Something went wrong... Please try again later")
        }
    };

  return (
    <div className="flex justify-center lg:items-center h-full w-full bg-white text-black">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col items-center max-w-md gap-12">
          <Title title="Create your account" subTitle="Join Matcha – start by entering your email."/>
          <InputForm placeholder="Email" type="text" error={errors.email} {...register("email")}/>
          <InputForm
            placeholder="Password"
            type="password"
            error={errors.password}
            {...register("password", { onChange: () => clearErrors("password") })}
          />
          <InputForm placeholder="Repeat password" type="password" error={errors.repeatPassword} {...register("repeatPassword")}/>
          <NextButton text="Next"/>
          <div className="text-center">
            <span className="text-custom-medium">Already have an account?</span>
            <button className="cursor-pointer ml-2" type="button" onClick={() => router.push("/login")}>
                <span className="font-semibold">Log in here</span>
            </button>
          </div>
      </form>
    </div>
  );
}
