import Hero from "@/components/Hero";
import NewsTicker from "@/components/NewsTicker";
import UniversityShowcase from "@/components/UniversityShowcase";
import DormitoryShowcase from "@/components/DormitoryShowcase";
import SocialEmbeds from "@/components/SocialEmbeds"; // <--- 1. Import Et
import ResultCard from "@/components/tercih/ResultCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <NewsTicker />

      {/* <--- 2. Buraya Yerleştir (Üniversitelerin Üstü) */}
      <SocialEmbeds />

      <UniversityShowcase />
      <DormitoryShowcase />
    </main>
  );
}