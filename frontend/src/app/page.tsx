import Hero from "@/components/Hero";
import NewsTicker from "@/components/NewsTicker";
import UniversityShowcase from "@/components/UniversityShowcase";
import DormitoryShowcase from "@/components/DormitoryShowcase";
import SocialEmbeds from "@/components/SocialEmbeds";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <NewsTicker />

      {/* Sosyal Medya Bileşeni */}
      <SocialEmbeds />

      <UniversityShowcase />
      <DormitoryShowcase />
    </main>
  );
}