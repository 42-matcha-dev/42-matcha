import Header from "@/app/components/Header";
import SignupMain from "@/app/components/SignupMain";

export default function SignupPage() {
  return (
    <main className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-row">
        <SignupMain />
        <div className="w-1/2 h-full">
          <img className="h-full" src="image.jpeg" alt="visuel" />
        </div>
      </div>
    </main>
  );
}

