import Hero from "@/components/Hero";
import NewsTicker from "@/components/NewsTicker";
// DÜZELTME: Eski bileşeni (FeaturedUniversities) sildik, yenisini (UniversityShowcase) ekledik.
import UniversityShowcase from "@/components/UniversityShowcase";
import DormitoryShowcase from "@/components/DormitoryShowcase";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <NewsTicker />

      {/* ARTIK ESKİ BİLEŞEN YERİNE BU TEMİZ BİLEŞEN ÇALIŞACAK */}
      <UniversityShowcase />

      <DormitoryShowcase />
    </main>
  );
}