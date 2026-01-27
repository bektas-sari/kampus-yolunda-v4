"use client";

import Link from "next/link";
import { Sparkles, GraduationCap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">

      {/* Arka Plan Efekti - Algı Yönetimi: Derinlik hissi */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -z-10" />

      {/* Hero Başlık */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <span className="inline-block py-1 px-3 rounded-full bg-blue-900/30 border border-blue-800/50 text-blue-400 text-xs font-bold mb-6 tracking-wide">
          YAPAY ZEKA DESTEKLİ KARİYER DANIŞMANI
        </span>

        <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-tight">
          Kampüs <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">Yolunda</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-light">
          Geleceğini şansa bırakma. Veri odaklı analizlerle senin için en doğru üniversite ve bölümü saniyeler içinde bul.
        </p>
      </div>

      {/* Aksiyon Butonları (Call to Action) */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
        <Link
          href="/tercih-motoru"
          className="group flex-1 bg-[#00ff88] hover:bg-[#00cc6a] text-black px-8 py-5 rounded-2xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] flex items-center justify-center gap-3 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform relative z-10" />
          <span className="relative z-10">Analizi Başlat</span>
        </Link>

        <Link
          href="/universiteler"
          className="group flex-1 bg-white/5 hover:bg-white/10 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all border border-white/10 hover:border-white/20 flex items-center justify-center gap-3 backdrop-blur-sm"
        >
          <GraduationCap className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
          <span>Keşfet</span>
          <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </Link>
      </div>

      {/* Footer İmzası */}
      <div className="mt-24 text-xs text-slate-600 font-mono uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
        Designed by Bektaş Sarı & Kognitect AI
      </div>
    </div>
  );
}