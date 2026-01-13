"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight, School } from "lucide-react";
import { getUniversities } from "@/services/api";
import { University } from "@/types";

export default function FeaturedUniversities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const data = await getUniversities();

        // --- DÜZELTME: Veri Tipi Kontrolü ---
        // Backend pagination (results: [...]) gönderirse results'ı al, 
        // göndermezse direkt data'yı al.
        // @ts-ignore (Tip güvenliği için geçici ignore)
        const uniList = Array.isArray(data) ? data : (data.results || []);

        setUniversities(uniList.slice(0, 6)); // İlk 6 tanesini al
      } catch (error) {
        console.error("Failed to fetch universities", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  if (loading) {
    return (
      <section className="bg-black py-20">
        <div className="container mx-auto px-6 text-center text-white flex items-center justify-center gap-2">
          <span className="animate-pulse">Yükleniyor...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-black py-20">
      <div className="container mx-auto px-6">
        {/* ÜST BAŞLIK ALANI */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold text-white md:text-5xl">
              Popüler <span className="text-blue-500">Üniversiteler</span>
            </h2>
            <p className="mt-2 text-gray-400 max-w-xl">
              Öğrencilerin en çok incelediği, akademik kadrosu ve kampüs
              olanaklarıyla öne çıkan üniversiteleri keşfet.
            </p>
          </div>

          <Link
            href="/universiteler"
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-blue-600 hover:border-blue-600"
          >
            Tümünü Gör
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* KART GRİD YAPISI */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {universities.map((uni) => (
            <Link
              key={uni.id}
              href={`/universite/${uni.slug}`}
              className="group relative h-[400px] overflow-hidden rounded-3xl border border-white/10 bg-[#111] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.3)]"
            >
              {/* 1. Kapak Görseli */}
              <div className="absolute inset-0 h-full w-full bg-[#1A1A1A] flex items-center justify-center">
                {uni.cover_image ? (
                  <>
                    <Image
                      src={uni.cover_image}
                      alt={uni.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  </>
                ) : (
                  <School className="text-gray-800 h-24 w-24 group-hover:scale-110 transition-transform duration-700" strokeWidth={1} />
                )}
              </div>

              {/* 2. Üst Rozetler */}
              <div className="absolute left-4 top-4 flex gap-2">
                <span className="flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md border border-white/10">
                  <School className="h-3 w-3 text-blue-400" />
                  {uni.uni_type}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold tracking-wide text-emerald-400 backdrop-blur-md border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  %95 KÜLTÜREL UYUM
                </span>
              </div>

              {/* 3. Alt İçerik Alanı */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                <div className="flex items-end gap-4 mb-3">
                  {/* Logo Kutusu */}
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-md">
                    {uni.logo ? (
                      <Image src={uni.logo} alt={uni.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white text-black font-bold text-xs">
                        {uni.name.substring(0, 2)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                      {uni.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-300 mb-6">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{uni.city}</span>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-blue-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Üniversiteyi İncele
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}