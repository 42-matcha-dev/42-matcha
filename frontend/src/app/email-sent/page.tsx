import Title from "@/app/components/Title";
import Link from "next/link";

export default function EmailSentPage() {
  return (
    <div className="flex justify-center items-center min-h-screen h-full bg-white text-black p-4 border">
      <div className="flex flex-col items-center w-1/1.9 max-w-md p-5 gap-15">
        <Title
          title="Check Your Email"
          subTitle="We've sent a verification email. Please check your inbox to continue."
        />
        <Link 
          href="/login"
          className="text-secondary font-semibold hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

