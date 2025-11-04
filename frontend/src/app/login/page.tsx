import Header from "@/app/components/Header";
import LoginMain from "@/app/components/LoginMain";

export default function LoginPage() {
  return (
    <main className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-row">
        <LoginMain />
        <div className="w-1/2 h-full">
          <img className="h-full" src="image.jpeg" alt="visuel" />
        </div>
      </div>
    </main>
  );
}

