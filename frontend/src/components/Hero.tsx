"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function Hero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/universiteler?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative h-[90vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">

      {/* 1. ARKA PLAN KATMANI */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
          alt="University Campus"
          fill
          priority
          className="object-cover"
        />
        {/* Karartma efekti */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* 2. İÇERİK KATMANI */}
      <div className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center">

        {/* Güven Rozeti */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 mb-8 backdrop-blur-md animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-sm font-medium text-blue-200">2026 YKS Dönemi Yayında</span>
        </div>

        {/* Ana Başlık */}
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-7xl lg:text-8xl drop-shadow-2xl max-w-5xl mx-auto leading-[1.1]">
          Hayalindeki <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-400 to-teal-300">
            Üniversiteyi
          </span> Keşfet
        </h1>

        {/* Alt Metin */}
        <p className="mb-8 text-lg text-gray-300 md:text-2xl max-w-3xl mx-auto font-light leading-relaxed">
          Üniversite, kampüs, barınma ve tercih planını tek yerden yönet.
          <br className="hidden md:block" /> Veriyle karar ver, geleceğini şansa bırakma.
        </p>

        {/* YENİ: HIZLI ARAMA ÇUBUĞU */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl relative mb-10 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
            <Search size={22} />
          </div>
          <input
            type="text"
            placeholder="Hangi üniversiteyi veya bölümü arıyorsun?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all text-lg shadow-lg"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 h-10 px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors"
          >
            Bul
          </button>
        </form>

        {/* CTA Butonları */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">

          <Link
            href="/universiteler"
            className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-blue-600 px-8 font-medium text-white transition-all duration-300 hover:bg-blue-700 hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.5)]"
          >
            <span className="mr-2 text-lg">Üniversiteleri İncele</span>
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </Link>

          {/* DÜZELTME: Link adresi /tercih-motoru olarak güncellendi */}
          <Link
            href="/tercih-motoru"
            className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-lg font-medium text-white transition-all hover:bg-white/10 hover:border-white/40 backdrop-blur-sm"
          >
            Puanımı Hesapla
          </Link>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}