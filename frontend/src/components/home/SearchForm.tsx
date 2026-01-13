"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, GraduationCap } from "lucide-react";

export default function SearchForm() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            // Şimdilik üniversiteler sayfasına yönlendirip arama yapalım
            router.push(`/universiteler?search=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative group">

                {/* Arka plandaki glow efekti */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />

                <div className="relative flex items-center bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">

                    {/* Sol İkon (Dekoratif) */}
                    <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 text-gray-400 ml-1">
                        <GraduationCap size={24} />
                    </div>

                    {/* Input Alanı */}
                    <input
                        type="text"
                        className="flex-1 bg-transparent border-none text-white placeholder-gray-500 text-lg px-4 focus:ring-0 focus:outline-none w-full h-14"
                        placeholder="Hangi üniversiteyi veya bölümü arıyorsun?"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />

                    {/* Arama Butonu */}
                    <button
                        type="submit"
                        className="bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold h-12 px-8 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                    >
                        <Search size={20} />
                        <span className="hidden md:inline">Ara</span>
                    </button>
                </div>

                {/* Alt Bilgi Etiketleri */}
                <div className="flex justify-center gap-4 mt-4 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                        <MapPin size={12} className="text-[#00ff88]" /> Şehre Göre
                    </span>
                    <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                        <GraduationCap size={12} className="text-[#00ff88]" /> Puana Göre
                    </span>
                </div>

            </form>
        </div>
    );
}