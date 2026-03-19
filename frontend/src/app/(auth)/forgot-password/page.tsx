"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Title from "@/app/components/Title";
import InputForm from "@/app/components/InputForm";
import NextButton from "@/app/components/Buttons/NextButton";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error ?? "Something went wrong");
        return;
      }

      setSubmitted(true);
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col max-w-md items-center gap-12">
        <Title
          title="Check Your Email"
          subTitle="If an account exists with that email, we've sent a password reset link. Please check your inbox."
        />
        <Link
          href="/login"
          className="text-secondary hover:underline font-medium"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-center lg:items-center min-h-screen h-full w-full bg-white text-black">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col max-w-md items-center gap-12"
      >
        <Title
          title="Forgot Password"
          subTitle="Enter your email and we'll send you a link to reset your password."
        />
        <InputForm
          placeholder="Email"
          type="text"
          error={errors.email}
          {...register("email")}
        />
        <NextButton text={isSubmitting ? "Sending..." : "Send Reset Link"} disabled={isSubmitting} />
        <Link
          href="/login"
          className="text-secondary hover:underline font-medium"
        >
          Back to login
        </Link>
      </form>
    </div>
  );
}
