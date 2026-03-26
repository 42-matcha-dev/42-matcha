"use client";

import { z } from "zod";
import { passwordSchema } from "@/app/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Title from "@/app/components/Title";
import InputForm from "@/app/components/InputForm";
import NextButton from "@/app/components/Buttons/NextButton";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Suspense } from "react";

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <div className="flex flex-1 flex-col max-w-md items-center gap-12">
        <Title
          title="Invalid Link"
          subTitle="This password reset link is invalid or has expired."
        />
        <Link
          href="/forgot-password"
          className="text-secondary hover:underline font-medium"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordSchema) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.field === "password") {
          setError("password", { type: "server", message: errorData.error });
        } else {
          toast.error(errorData.error ?? "Failed to reset password");
        }
        return;
      }

      toast.success("Password reset successful! Please log in.");
      router.push("/login");
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="flex justify-center lg:items-center h-full w-full bg-white text-black">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col max-w-md items-center gap-12"
      >
        <Title
          title="Reset Password"
          subTitle="Enter your new password below."
        />
        <InputForm
          placeholder="New Password"
          type="password"
          error={errors.password}
          {...register("password", { onChange: () => clearErrors("password") })}
        />
        <InputForm
          placeholder="Confirm Password"
          type="password"
          error={errors.confirmPassword}
          {...register("confirmPassword")}
        />
        <NextButton
          text={isSubmitting ? "Resetting..." : "Reset Password"}
          disabled={isSubmitting}
        />
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
