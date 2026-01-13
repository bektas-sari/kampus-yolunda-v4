"use client";

import Image from "next/image";
import SearchForm from "@/components/home/SearchForm";
import { ChevronDown } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">

            {/* ARKA PLAN - Sabit ve Net */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero-bg.jpg"
                    alt="Kampüs Yolunda"
                    fill
                    priority
                    className="object-cover opacity-60" // Hafif karartılmış, net görüntü
                />
                {/* Ekstra gradyan katmanı */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black" />
            </div>

            {/* İÇERİK */}
            <div className="container mx-auto px-4 relative z-10 text-center">
                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
                    Üniversite Yolculuğun <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00cc6a]">
                        Burada Başlıyor
                    </span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Türkiye'nin en kapsamlı üniversite, yurt ve öğrenci evi platformu.
                    Geleceğini planlarken ihtiyacın olan her şey tek bir yerde.
                </p>

                <div className="max-w-3xl mx-auto">
                    <SearchForm />
                </div>
            </div>

            {/* Scroll İndikatörü */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                <ChevronDown className="text-white/50" size={32} />
            </div>
        </section>
    );
}