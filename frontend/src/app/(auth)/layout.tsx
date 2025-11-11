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
    <main className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Zone gauche = contenu spécifique */}
        <div className="flex justify-center items-center w-full lg:w-1/2 bg-white text-black p-4">
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
