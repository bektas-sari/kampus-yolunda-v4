"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { MapPin, Search, Filter, Loader2, Bed, Star, AlertCircle } from "lucide-react";
import FilterSidebar, { FilterConfig } from "@/components/FilterSidebar";
import { getDormitories } from "@/services/api"; // API servisini kullanıyoruz

// Backend URL (Resimler için)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Dormitory {
    id: number;
    name: string;
    slug: string;
    city: string;
    district: string;
    dorm_type: string;
    price: number;
    capacity: number;
    cover_image: string | null;
    is_promoted: boolean;
}

const FILTERS: FilterConfig[] = [
    {
        key: 'search',
        label: 'Arama',
        type: 'text',
        placeholder: 'Yurt adı veya ilçe ara...'
    },
    {
        key: 'city',
        label: 'Şehir',
        type: 'select',
        options: [
            { label: 'İstanbul', value: 'ISTANBUL' },
            { label: 'Ankara', value: 'ANKARA' },
            { label: 'İzmir', value: 'IZMIR' },
            { label: 'Eskişehir', value: 'ESKISEHIR' },
            { label: 'Antalya', value: 'ANTALYA' },
        ]
    },
    {
        key: 'dorm_type',
        label: 'Yurt Tipi',
        type: 'radio',
        options: [
            { label: 'Kız Yurdu', value: 'KIZ' },
            { label: 'Erkek Yurdu', value: 'ERKEK' },
            { label: 'Karma Yurt', value: 'KARMA' },
        ]
    }
];

// --- İÇERİK BİLEŞENİ (Orijinal Kod Buraya Taşındı) ---
function DormitoriesContent() {
    const searchParams = useSearchParams();
    const [dormitories, setDormitories] = useState<Dormitory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(Array.from(searchParams.entries()));
                // api.ts içindeki fonksiyonu kullanıyoruz, query string'i gönderiyoruz
                const data = await getDormitories(`?${params.toString()}`);

                // Backend pagination (results) dönüyor mu kontrol et
                const list = Array.isArray(data) ? data : (data.results || []);
                setDormitories(list);
            } catch (error) {
                console.error("Yurtlar çekilemedi:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);

    const getImageUrl = (path: string | null) => {
        if (!path) return "/placeholder.jpg";
        if (path.startsWith("http")) return path;
        return `${BACKEND_URL}${path}`;
    };

    return (
        <div className="container mx-auto px-4 md:px-6">

            {/* Header */}
            <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">Özel Yurtlar</h1>
                    <p className="text-gray-400 text-lg">Konforlu, güvenli ve kampüsüne en yakın yurtları keşfet.</p>
                </div>
                <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden bg-[#1A1A1A] border border-white/10 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-white/5 transition-colors"
                >
                    <Filter size={18} className="text-[#00ff88]" />
                    Filtrele
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar */}
                <div className="shrink-0 hidden lg:block w-72">
                    <div className="sticky top-24">
                        <FilterSidebar filters={FILTERS} isOpen={isMobileFilterOpen} onClose={() => setIsMobileFilterOpen(false)} />
                    </div>
                </div>
                <div className="lg:hidden">
                    <FilterSidebar filters={FILTERS} isOpen={isMobileFilterOpen} onClose={() => setIsMobileFilterOpen(false)} />
                </div>

                {/* Listeleme */}
                <div className="flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96">
                            <Loader2 className="animate-spin text-[#00ff88] mb-4" size={48} />
                            <p className="text-gray-500 animate-pulse">Yurtlar yükleniyor...</p>
                        </div>
                    ) : dormitories.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {dormitories.map((dorm) => (
                                <Link
                                    key={dorm.id}
                                    href={`/yurt/${dorm.slug}`}
                                    className="group bg-[#111] rounded-2xl border border-white/10 overflow-hidden hover:border-[#00ff88]/40 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col relative"
                                >
                                    {/* Görsel */}
                                    <div className="relative h-56 w-full bg-[#1A1A1A] overflow-hidden">
                                        <Image
                                            src={getImageUrl(dorm.cover_image)}
                                            alt={dorm.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-60" />

                                        {/* Tip Rozeti */}
                                        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs font-bold text-white uppercase tracking-wider">
                                            {dorm.dorm_type}
                                        </div>

                                        {/* Promoted (Vitrin) İkonu */}
                                        {dorm.is_promoted && (
                                            <div className="absolute top-4 right-4 bg-[#00ff88] text-black p-1.5 rounded-full shadow-[0_0_15px_rgba(0,255,136,0.5)]">
                                                <Star size={14} fill="currentColor" />
                                            </div>
                                        )}

                                        {/* Fiyat */}
                                        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                            <span className="text-[#00ff88] font-bold">{dorm.price.toLocaleString()} ₺</span>
                                            <span className="text-gray-400 text-xs ml-1">/ Yıl</span>
                                        </div>
                                    </div>

                                    {/* İçerik */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-xl text-white mb-2 line-clamp-1 group-hover:text-[#00ff88] transition-colors">
                                            {dorm.name}
                                        </h3>

                                        <div className="text-gray-400 text-sm flex items-center gap-1.5 mb-4">
                                            <MapPin size={14} className="text-[#00ff88]" />
                                            {dorm.district}, {dorm.city}
                                        </div>

                                        <div className="mt-auto border-t border-white/5 pt-4 flex items-center justify-between text-xs font-medium text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Bed size={16} className="text-gray-500" />
                                                Kapasite: {dorm.capacity}
                                            </div>
                                            <span className="text-[#00ff88] font-bold group-hover:translate-x-1 transition-transform">İNCELE →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-[#111] rounded-3xl border border-dashed border-white/10">
                            <div className="w-20 h-20 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-6">
                                <Bed className="text-gray-600" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Yurt Bulunamadı</h3>
                            <p className="text-gray-400 max-w-sm mx-auto mb-6">Aradığınız kriterlere uygun yurt bulunamadı. Filtreleri temizleyip tekrar deneyin.</p>
                            <button
                                onClick={() => window.location.href = '/yurtlar'}
                                className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-gray-200 transition-colors"
                            >
                                Filtreleri Temizle
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- ANA SAYFA (Suspense Koruması ile) ---
export default function DormitoriesPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
            <Suspense fallback={
                <div className="flex h-screen items-center justify-center text-[#00ff88]">
                    <Loader2 className="animate-spin mr-2" size={32} />
                    <span className="text-lg font-bold">Yurtlar Yükleniyor...</span>
                </div>
            }>
                <DormitoriesContent />
            </Suspense>
        </div>
    );
}