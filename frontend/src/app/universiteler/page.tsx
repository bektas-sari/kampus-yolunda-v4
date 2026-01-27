"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { MapPin, Search, Filter, Loader2, GraduationCap, Users, Crown, Sparkles } from "lucide-react";
import axios from "axios";
import FilterSidebar, { FilterConfig } from "@/components/FilterSidebar";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kampus-backend-4wes.onrender.com/';

interface University {
  id: number;
  name: string;
  slug: string;
  city: string;
  city_display: string;
  uni_type: string;
  logo: string | null;
  cover_image: string | null;
  department_count: number;
  is_promoted: boolean; // Öne çıkan özelliği
}

const FILTERS: FilterConfig[] = [
  { key: 'search', label: 'Arama', type: 'text', placeholder: 'Üniversite ara...' },
  {
    key: 'city', label: 'Şehir', type: 'select', options: [
      { label: 'İstanbul', value: 'ISTANBUL' },
      { label: 'Ankara', value: 'ANKARA' },
      { label: 'İzmir', value: 'IZMIR' },
      { label: 'Antalya', value: 'ANTALYA' },
    ]
  },
  {
    key: 'uni_type', label: 'Tür', type: 'radio', options: [
      { label: 'Devlet', value: 'DEVLET' },
      { label: 'Vakıf', value: 'VAKIF' },
    ]
  }
];

// --- İÇERİK BİLEŞENİ (Orijinal Kod Buraya Taşındı) ---
function UniversitiesContent() {
  const searchParams = useSearchParams();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        const res = await axios.get(`${BACKEND_URL}/api/universities/?${params.toString()}`);
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setUniversities(data);
      } catch (error) {
        console.error("Üniversiteler çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUniversities();
  }, [searchParams]);

  const getImageUrl = (path: string | null, type: 'logo' | 'cover') => {
    if (!path) return type === 'logo' ? "/placeholder_logo.png" : "/placeholder_cover.jpg";
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}${path}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">Üniversiteler</h1>
            <p className="text-gray-400 text-lg">Türkiye'nin en kapsamlı üniversite rehberini keşfet.</p>
          </div>
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden bg-[#1A1A1A] border border-white/10 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-white/5 transition-colors"
          >
            <Filter size={18} className="text-[#00ff88]" />
            Filtrele
          </button>
        </div>

        {/* --- POPÜLER KAMPÜSLER VİTRİNİ (Sadece Promoted Varsa Görünür) --- */}
        {!loading && universities.some(u => u.is_promoted) && (
          <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#00ff88] p-2 rounded-lg text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]">
                <Crown size={24} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Popüler Kampüsler</h2>
                <p className="text-gray-400 text-sm">Öğrencilerin en çok ilgi gösterdiği üniversiteler.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {universities.filter(u => u.is_promoted).slice(0, 3).map((uni) => (
                <Link
                  href={`/universite/${uni.slug}`}
                  key={uni.id}
                  className="group relative h-64 rounded-2xl overflow-hidden border border-[#00ff88]/50 hover:border-[#00ff88] transition-all shadow-[0_0_30px_rgba(0,255,136,0.1)] hover:shadow-[0_0_50px_rgba(0,255,136,0.25)]"
                >
                  {/* Kapak Görseli */}
                  <Image
                    src={getImageUrl(uni.cover_image, 'cover')}
                    alt={uni.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  {/* Etiket */}
                  <div className="absolute top-4 right-4 bg-[#00ff88] text-black text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                    <Sparkles size={12} fill="black" /> ÖNE ÇIKAN
                  </div>

                  {/* Logo ve İsim */}
                  <div className="absolute bottom-0 left-0 p-6 flex items-end gap-4 w-full">
                    <div className="w-14 h-14 bg-white rounded-xl p-1 shrink-0 shadow-xl">
                      <img src={getImageUrl(uni.logo, 'logo')} alt="logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-1 truncate">{uni.name}</h3>
                      <p className="text-[#00ff88] font-bold text-xs flex items-center gap-1 uppercase tracking-wide">
                        <MapPin size={12} /> {uni.city_display}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* --- ANA LİSTELEME ALANI --- */}
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="shrink-0 hidden lg:block w-72">
            <div className="sticky top-24">
              <FilterSidebar filters={FILTERS} isOpen={isMobileFilterOpen} onClose={() => setIsMobileFilterOpen(false)} />
            </div>
          </div>
          <div className="lg:hidden">
            <FilterSidebar filters={FILTERS} isOpen={isMobileFilterOpen} onClose={() => setIsMobileFilterOpen(false)} />
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="animate-spin text-[#00ff88] mb-4" size={48} />
                <p className="text-gray-500 animate-pulse">Kampüsler yükleniyor...</p>
              </div>
            ) : universities.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {universities.map((uni) => (
                  <Link
                    key={uni.id}
                    href={`/universite/${uni.slug}`}
                    className="group bg-[#111] rounded-2xl border border-white/10 overflow-hidden hover:border-[#00ff88]/40 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col"
                  >
                    {/* Görsel */}
                    <div className="relative h-40 w-full bg-[#1A1A1A] overflow-hidden">
                      <Image
                        src={getImageUrl(uni.cover_image, 'cover')}
                        alt={uni.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                      />
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10">
                        {uni.uni_type === 'DEVLET' ? 'DEVLET' : 'VAKIF'}
                      </div>
                    </div>

                    {/* Logo - Üstüne Biniyor */}
                    <div className="px-5 relative">
                      <div className="-mt-8 w-16 h-16 bg-[#111] rounded-xl p-1 border border-white/10 shadow-lg relative z-10">
                        <div className="w-full h-full bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden">
                          <img src={getImageUrl(uni.logo, 'logo')} alt={uni.name} className="w-full h-full object-contain" />
                        </div>
                      </div>
                    </div>

                    {/* İçerik */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-white mb-1 line-clamp-1 group-hover:text-[#00ff88] transition-colors">
                        {uni.name}
                      </h3>

                      <div className="text-gray-400 text-sm flex items-center gap-1.5 mb-4">
                        <MapPin size={14} className="text-[#00ff88]" />
                        {uni.city_display}
                      </div>

                      <div className="mt-auto border-t border-white/5 pt-4 flex items-center justify-between text-xs font-medium text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap size={14} className="text-gray-500" />
                          {uni.department_count} Bölüm
                        </div>
                        <span className="text-[#00ff88] font-bold group-hover:translate-x-1 transition-transform">
                          İNCELE →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-[#111] rounded-3xl border border-dashed border-white/10">
                <GraduationCap className="text-gray-600 mb-4" size={40} />
                <h3 className="text-2xl font-bold text-white mb-2">Üniversite Bulunamadı</h3>
                <p className="text-gray-400 max-w-sm mx-auto mb-6">Aradığınız kriterlere uygun üniversite bulunamadı.</p>
                <button onClick={() => window.location.href = '/universiteler'} className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-gray-200 transition-colors">
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- ANA SAYFA (Suspense Koruması ile) ---
export default function UniversitiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin mb-4 text-[#00ff88]" size={48} />
        <p className="text-gray-500">Üniversiteler Yükleniyor...</p>
      </div>
    }>
      <UniversitiesContent />
    </Suspense>
  );
}