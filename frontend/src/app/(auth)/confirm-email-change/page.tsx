"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import Title from "@/app/components/Title";
import NextButton from "@/app/components/Buttons/NextButton";
import { toast } from "sonner";

function ConfirmEmailChangeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const onConfirm = async () => {
    if (!token) return;

    try {
      setIsSubmitting(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/auth/confirm-email-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Failed to confirm email change");
        return;
      }

      setIsConfirmed(true);
      toast.success("Email address updated successfully");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-1 flex-col max-w-md items-center gap-12">
        <Title
          title="Invalid Link"
          subTitle="This email confirmation link is invalid or has expired."
        />
        <Link href="/settings" className="text-secondary hover:underline font-medium">
          Back to settings
        </Link>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div className="flex flex-1 flex-col max-w-md items-center gap-12">
        <Title
          title="Email Updated"
          subTitle="Your new email address has been confirmed successfully."
        />
        <NextButton text="Go to settings" onClick={() => router.push("/settings")} />
      </div>
    );
  }

  return (
    <div className="flex justify-center lg:items-center h-full w-full bg-white text-black">
      <div className="flex flex-1 flex-col max-w-md items-center gap-12">
        <Title
          title="Confirm Email Change"
          subTitle="Click the button below to confirm your new email address."
        />
        <NextButton
          text={isSubmitting ? "Confirming..." : "Confirm Email Change"}
          disabled={isSubmitting}
          onClick={onConfirm}
        />
        <Link href="/settings" className="text-secondary hover:underline font-medium">
          Back to settings
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmEmailChangePage() {
  return (
    <Suspense>
      <ConfirmEmailChangeContent />
    </Suspense>
  );
}
