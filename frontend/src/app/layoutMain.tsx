// app/MainLayout.tsx
import Header from "@/app/components/Header";

interface MainLayoutProps {
  children: React.ReactNode;
  image?: string; // image optionnelle, valeur par défaut
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <main className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Zone gauche = contenu spécifique */}
        {children}
      </div>
    </main>
  );
}
