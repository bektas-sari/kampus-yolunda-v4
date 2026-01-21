"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { MapPin, ArrowRight, Bed, Home, Loader2, Star, Crown, Sparkles, Armchair, BedDouble, Square } from "lucide-react";
import HouseDetailModal from "@/components/HouseDetailModal";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const THEME_COLOR = "#FF6B00"; // Turuncu Tema

// --- TİP TANIMLAMALARI ---
interface Dormitory {
  id: number;
  name: string;
  slug: string;
  city: string;
  district: string;
  dorm_type: string;
  price: number;
  cover_image: string | null;
  is_promoted: boolean;
}

interface StudentHouse {
  id: number;
  title: string;
  slug: string;
  city: string;
  district: string;
  room_count: string;
  price: number;
  is_furnished: boolean;
  square_meters?: number;
  cover_image: string | null;
  is_promoted: boolean;
}

export default function DormitoryShowcase() {
  const [activeTab, setActiveTab] = useState<'yurtlar' | 'evler'>('yurtlar');
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [houses, setHouses] = useState<StudentHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHouse, setSelectedHouse] = useState<StudentHouse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dormRes, houseRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/dormitories/?is_promoted=true`),
          axios.get(`${BACKEND_URL}/api/student-houses/?is_promoted=true`)
        ]);
        setDormitories(dormRes.data.results || dormRes.data || []);
        setHouses(houseRes.data.results || houseRes.data || []);
      } catch (error) {
        console.error("Veriler çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}${path}`;
  };

  const handleHouseClick = (house: StudentHouse) => {
    setSelectedHouse(house);
    setIsModalOpen(true);
  };

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a]" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">

        {/* BAŞLIK VE TABLAR (DÜZELTİLDİ: "Vitrin" kaldırıldı) */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight flex items-center gap-3">
              <Star className="text-[#00ff88]" fill="currentColor" /> Yurtlar ve Konaklama
            </h2>
            <p className="text-gray-400 text-lg max-w-xl">
              Öğrencilerin en çok tercih ettiği, Kampüs Yolunda onaylı konaklama seçenekleri.
            </p>
          </div>

          <div className="bg-white/5 p-1.5 rounded-xl flex border border-white/10 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('yurtlar')}
              className={`px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'yurtlar'
                ? "bg-[#00ff88] text-black shadow-lg shadow-[#00ff88]/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <Bed size={18} /> Özel Yurtlar
            </button>
            <button
              onClick={() => setActiveTab('evler')}
              className={`px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'evler'
                ? `bg-[${THEME_COLOR}] text-white shadow-lg`
                : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              style={activeTab === 'evler' ? { backgroundColor: THEME_COLOR, boxShadow: `0 10px 15px -3px ${THEME_COLOR}33` } : {}}
            >
              <Home size={18} /> Öğrenci Evleri
            </button>
          </div>
        </div>

        {/* Yükleniyor */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-80">
            <Loader2 className="animate-spin text-[#00ff88] mb-4" size={48} />
            <p className="text-gray-500 animate-pulse">Seçenekler yükleniyor...</p>
          </div>
        )}

        {/* YURTLAR */}
        {!loading && activeTab === 'yurtlar' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {dormitories.slice(0, 3).map((dorm) => (
              <Link
                key={dorm.id}
                href={`/yurt/${dorm.slug}`}
                className="group relative h-[450px] rounded-3xl overflow-hidden border-2 border-[#00ff88] shadow-[0_0_30px_rgba(0,255,136,0.2)] hover:shadow-[0_0_50px_rgba(0,255,136,0.4)] transition-all duration-500 hover:-translate-y-2"
              >
                <Image
                  src={getImageUrl(dorm.cover_image)}
                  alt={dorm.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#00ff88]/30 flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${dorm.dorm_type === 'KIZ' ? 'bg-pink-500' : dorm.dorm_type === 'ERKEK' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                    {dorm.dorm_type}
                  </div>
                </div>

                <div className="absolute top-4 right-4 bg-[#00ff88] text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <Star size={14} fill="black" /> ÖNE ÇIKAN
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-[#111]/90 backdrop-blur-xl p-5 rounded-2xl border border-white/10 group-hover:border-[#00ff88]/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 group-hover:text-[#00ff88] transition-colors">{dorm.name}</h3>
                        <p className="text-[#00ff88] font-medium text-sm flex items-center gap-1.5">
                          <MapPin size={14} /> {dorm.district}, {dorm.city}
                        </p>
                      </div>
                      <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                        <span className="text-[#00ff88] font-bold">{dorm.price.toLocaleString()} ₺</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-white/5">
                      <span>Detaylı İncele</span>
                      <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform text-[#00ff88]" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ÖĞRENCİ EVLERİ */}
        {!loading && activeTab === 'evler' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {houses.slice(0, 3).map((house) => (
              <div
                key={house.id}
                onClick={() => handleHouseClick(house)}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer h-[450px] bg-[#161616] border-2 shadow-[0_0_35px_rgba(255,107,0,0.3)]`}
                style={{ borderColor: THEME_COLOR }}
              >
                <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] text-white text-[10px] font-bold py-1.5 px-3 flex items-center justify-center gap-2 tracking-wide uppercase shadow-md">
                  <Crown size={12} fill="white" /> Kampüs Yolunda Tavsiyesi
                </div>

                <div className="relative h-64 w-full bg-[#1A1A1A] overflow-hidden mt-0">
                  <Image
                    src={getImageUrl(house.cover_image)}
                    alt={house.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-60" />

                  <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                    <span className={`font-bold text-lg`} style={{ color: THEME_COLOR }}>
                      {house.price.toLocaleString()} ₺
                    </span>
                  </div>

                  {house.is_furnished && (
                    <div
                      className="absolute top-4 right-4 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1 z-30"
                      style={{ backgroundColor: THEME_COLOR }}
                    >
                      <Armchair size={12} /> EŞYALI
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col bg-[#161616]">
                  <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 transition-colors flex items-center gap-2">
                    {house.title}
                    <Sparkles size={16} style={{ color: THEME_COLOR }} />
                  </h3>
                  <div className="text-gray-400 text-sm flex items-center gap-1.5 mb-6">
                    <MapPin size={14} style={{ color: THEME_COLOR }} />
                    {house.district}, {house.city}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-auto pt-4 text-sm font-medium text-gray-300 border-t border-white/10">
                    <div className="flex items-center gap-2 bg-black/30 p-3 rounded-xl justify-center border border-white/5">
                      <BedDouble size={16} className="text-gray-500" />
                      {house.room_count}
                    </div>
                    <div className="flex items-center gap-2 bg-black/30 p-3 rounded-xl justify-center border border-white/5">
                      <Square size={16} className="text-gray-500" />
                      {house.square_meters ? `${house.square_meters} m²` : '-'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tümünü Gör Butonları */}
        <div className="text-center mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Link
            href={activeTab === 'yurtlar' ? '/yurtlar' : '/ogrenci-evleri'}
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-black transition-all hover:scale-105 hover:shadow-xl ${activeTab === 'yurtlar' ? 'bg-[#00ff88] hover:bg-[#00cc6a] shadow-[#00ff88]/20' : ''
              }`}
            style={activeTab === 'evler' ? { backgroundColor: THEME_COLOR, color: 'white', boxShadow: `0 10px 20px -5px ${THEME_COLOR}66` } : {}}
          >
            Tüm {activeTab === 'yurtlar' ? 'Yurtları' : 'Öğrenci Evlerini'} Keşfet
            <ArrowRight size={20} />
          </Link>
        </div>

      </div>
      <HouseDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} house={selectedHouse} />
    </section>
  );
}