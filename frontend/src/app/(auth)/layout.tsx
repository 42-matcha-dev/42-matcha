// app/(auth)/layout.tsx
import Header from "@/app/components/Header";
import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const image = "/image.jpeg";
  return (
    <main className="flex flex-col h-screen relative">
      <Header />
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Zone gauche = contenu spécifique */}
        <div className="flex px-8 lg:px-16 mt-32 lg:mt-0 justify-center items-center w-full lg:w-1/2 bg-white text-black">
          {children}
        </div>

        {/* Zone droite = image configurable */}
        <div className="hidden lg:block w-1/2 h-full relative">
          <Image
            src={image}
            alt="Visuel"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </main>
  );
}
