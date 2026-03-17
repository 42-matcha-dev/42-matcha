// app/(auth)/layout.tsx
import Image from "next/image";
import PublicLayout from "../layouts/PublicLayout";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const image = "/image.jpeg";
  return (
    <PublicLayout>
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Zone gauche = contenu spécifique */}
        <div className="flex px-8 lg:px-16 mt-32 lg:mt-0 justify-center items-center w-full lg:w-1/2 bg-white text-black">
          {children}
        </div>

        {/* Zone droite = image configurable */}
        <div className="hidden lg:block w-1/2 h-screen relative">
          <Image
            src={image}
            alt="Visuel"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </PublicLayout>
  );
}
