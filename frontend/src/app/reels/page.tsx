"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Instagram, Loader2, Filter, Search, X } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface ReelItem {
    id: number;
    title: string;
    embed_code: string;
    university_name?: string;
    university_slug?: string;
}

export default function AllReelsPage() {
    const [allReels, setAllReels] = useState<ReelItem[]>([]);
    const [displayedReels, setDisplayedReels] = useState<ReelItem[]>([]);
    const [loading, setLoading] = useState(true);

    // FİLTRELEME STATE'LERİ
    const [universities, setUniversities] = useState<string[]>([]);
    const [selectedUni, setSelectedUni] = useState<string>("Tümü");
    const [searchQuery, setSearchQuery] = useState<string>(""); // Arama metni

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/reels/`);
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);

                setAllReels(data);
                setDisplayedReels(data);

                // Benzersiz üniversite isimlerini çıkar
                const uniList = Array.from(new Set(data.map((item: ReelItem) => item.university_name).filter(Boolean))) as string[];
                setUniversities(uniList.sort()); // Alfabetik sırala

            } catch (error) {
                console.error("Veri hatası:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- GELİŞMİŞ FİLTRELEME MANTIĞI ---
    // Hem Kategori (Buton) hem Arama (Input) aynı anda çalışır
    useEffect(() => {
        let filtered = allReels;

        // 1. Adım: Üniversite Seçimi Filtresi
        if (selectedUni !== "Tümü") {
            filtered = filtered.filter(item => item.university_name === selectedUni);
        }

        // 2. Adım: Arama Metni Filtresi (Başlık veya Üniversite adında arar)
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(query) ||
                (item.university_name && item.university_name.toLowerCase().includes(query))
            );
        }

        setDisplayedReels(filtered);
    }, [selectedUni, searchQuery, allReels]);

    // URL Temizleyici (Yorumlu mod)
    const extractVideoUrl = (input: string) => {
        try {
            if (!input) return null;
            const regex = /(?:reel|p)\/([a-zA-Z0-9_-]+)/;
            const match = input.match(regex);
            if (match && match[1]) {
                return `https://www.instagram.com/p/${match[1]}/embed/captioned/`;
            }
            return null;
        } catch (e) { return null; }
    };

    return (
        <main className="min-h-screen bg-[#050505] pt-32 pb-20">
            <div className="container mx-auto px-6">

                {/* Üst Başlık */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Kampüs <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Reels Galerisi</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Üniversite hayatının en keyifli anlarını keşfet.
                    </p>
                </div>

                {/* --- KONTROL PANELİ (ARAMA + FİLTRELER) --- */}
                <div className="sticky top-20 z-40 bg-[#050505]/95 backdrop-blur-xl border-y border-white/10 py-4 mb-10">
                    <div className="container mx-auto flex flex-col md:flex-row gap-6 items-center justify-between">

                        {/* 1. ARAMA ÇUBUĞU */}
                        <div className="relative w-full md:w-1/3">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-gray-500" size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Video başlığı veya üniversite ara..."
                                className="w-full bg-[#111] border border-white/20 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder:text-gray-600"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* 2. HIZLI FİLTRE BUTONLARI (Yatay Kaydırmalı) */}
                        <div className="w-full md:w-2/3 flex gap-3 overflow-x-auto pb-1 scrollbar-hide items-center">
                            <span className="text-gray-500 text-sm font-medium whitespace-nowrap mr-2 hidden md:block">
                                Filtrele:
                            </span>

                            <button
                                onClick={() => setSelectedUni("Tümü")}
                                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all border ${selectedUni === "Tümü"
                                        ? "bg-pink-600 border-pink-500 text-white"
                                        : "bg-[#111] border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                                    }`}
                            >
                                Tümü
                            </button>

                            {universities.map((uni) => (
                                <button
                                    key={uni}
                                    onClick={() => setSelectedUni(uni)}
                                    className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all border ${selectedUni === uni
                                            ? "bg-pink-600 border-pink-500 text-white"
                                            : "bg-[#111] border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                                        }`}
                                >
                                    {uni}
                                </button>
                            ))}
                        </div>

                    </div>
                </div>

                {/* LİSTELEME ALANI */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-pink-500" size={40} />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
                            {displayedReels.map((item) => {
                                const embedUrl = extractVideoUrl(item.embed_code);
                                if (!embedUrl) return null;

                                return (
                                    <div key={item.id} className="flex flex-col gap-3 w-full max-w-[320px]">
                                        {/* Video Kutusu */}
                                        <div className="relative w-full aspect-[4/5] bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                                            <iframe
                                                className="w-full h-full relative z-10"
                                                src={embedUrl}
                                                frameBorder="0"
                                                scrolling="no"
                                                // @ts-ignore
                                                allowtransparency="true"
                                                allow="encrypted-media; autoplay; clipboard-write; picture-in-picture"
                                                style={{ objectFit: 'cover' }}
                                            ></iframe>

                                            {/* Güvenlik Kalkanları */}
                                            <div className="absolute top-0 left-0 w-full h-[20%] z-50 bg-transparent cursor-default"></div>
                                            <div className="absolute bottom-0 left-0 w-full h-[55%] z-50 bg-transparent cursor-default"></div>
                                        </div>

                                        {/* Alt Bilgi */}
                                        <div className="text-center px-2">
                                            <h3 className="text-white font-semibold line-clamp-1 mb-1">{item.title}</h3>
                                            {item.university_name && (
                                                <span className="text-xs text-pink-400 font-bold uppercase tracking-wider border border-pink-500/30 px-2 py-0.5 rounded bg-pink-500/10">
                                                    {item.university_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Sonuç Bulunamadı */}
                        {displayedReels.length === 0 && (
                            <div className="text-center py-32">
                                <div className="inline-flex bg-[#111] p-6 rounded-full mb-4">
                                    <Search size={48} className="text-gray-600" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Sonuç Bulunamadı</h3>
                                <p className="text-gray-500">
                                    "{searchQuery}" aramasına veya seçilen filtreye uygun video yok.
                                </p>
                                <button
                                    onClick={() => { setSearchQuery(""); setSelectedUni("Tümü"); }}
                                    className="mt-6 text-pink-400 hover:text-pink-300 font-semibold"
                                >
                                    Filtreleri Temizle
                                </button>
                            </div>
                        )}
                    </>
                )}

            </div>
        </main>
    );
}