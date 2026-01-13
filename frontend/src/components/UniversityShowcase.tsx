"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { MapPin, ArrowRight, GraduationCap, Loader2, Sparkles } from "lucide-react";

// Backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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
}

export default function UniversityShowcase() {
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                // Sadece ÖNE ÇIKANLARI (is_promoted=True) çekiyoruz
                const res = await axios.get(`${BACKEND_URL}/api/universities/?is_promoted=true`);
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setUniversities(data);
            } catch (error) {
                console.error("Üniversite vitrini çekilemedi:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUniversities();
    }, []);

    const getImageUrl = (path: string | null, type: 'logo' | 'cover') => {
        if (!path) return type === 'logo' ? "/placeholder_logo.png" : "/placeholder_cover.jpg";
        if (path.startsWith("http")) return path;
        return `${BACKEND_URL}${path}`;
    };

    return (
        <section className="py-20 relative bg-[#0a0a0a]">
            <div className="container mx-auto px-4 md:px-6">

                {/* Başlık Alanı */}
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight flex items-center gap-3">
                            <GraduationCap className="text-[#00ff88]" size={32} /> Popüler Üniversiteler
                        </h2>
                        <p className="text-gray-400 text-lg max-w-xl">
                            Akademik kadrosu, kampüs imkanları ve öğrenci memnuniyetiyle öne çıkan üniversiteleri incele.
                        </p>
                    </div>

                    <Link
                        href="/universiteler"
                        className="group flex items-center gap-2 text-[#00ff88] font-bold hover:text-white transition-colors"
                    >
                        Tümünü Gör <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Yükleniyor */}
                {loading && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 className="animate-spin text-[#00ff88] mb-4" size={48} />
                    </div>
                )}

                {/* Liste */}
                {!loading && universities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {universities.map((uni) => (
                            <Link
                                key={uni.id}
                                href={`/universite/${uni.slug}`}
                                className="group bg-[#111] rounded-2xl border border-white/10 overflow-hidden hover:border-[#00ff88]/40 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col relative"
                            >
                                {/* Görsel */}
                                <div className="relative h-48 w-full bg-[#1A1A1A] overflow-hidden">
                                    <Image
                                        src={getImageUrl(uni.cover_image, 'cover')}
                                        alt={uni.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                    />
                                    {/* Sadece Tip Rozeti Kaldı - Kültürel Uyum SİLİNDİ */}
                                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10 z-10">
                                        {uni.uni_type === 'DEVLET' ? 'DEVLET' : 'VAKIF'}
                                    </div>

                                    {/* ÖNE ÇIKAN ROZETİ */}
                                    <div className="absolute top-4 right-4 bg-[#00ff88] text-black p-1.5 rounded-full shadow-[0_0_15px_rgba(0,255,136,0.5)] z-10">
                                        <Sparkles size={14} fill="black" />
                                    </div>
                                </div>

                                {/* Logo */}
                                <div className="px-5 relative">
                                    <div className="-mt-8 w-14 h-14 bg-[#111] rounded-xl p-1 border border-white/10 shadow-lg relative z-10">
                                        <div className="w-full h-full bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden">
                                            <img src={getImageUrl(uni.logo, 'logo')} alt={uni.name} className="w-full h-full object-contain" />
                                        </div>
                                    </div>
                                </div>

                                {/* İçerik */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg text-white mb-1 line-clamp-2 min-h-[3.5rem] group-hover:text-[#00ff88] transition-colors">
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
                    !loading && (
                        <div className="text-center text-gray-500 py-10 border border-dashed border-white/10 rounded-xl">
                            Öne çıkan üniversite bulunamadı. Admin panelinden ekleyebilirsiniz.
                        </div>
                    )
                )}

            </div>
        </section>
    );
}