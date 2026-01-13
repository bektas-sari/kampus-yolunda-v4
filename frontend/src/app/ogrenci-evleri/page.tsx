"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { MapPin, Home, BedDouble, Square, Loader2, Filter, Armchair, Crown, Sparkles } from "lucide-react";
import FilterSidebar, { FilterConfig } from "@/components/FilterSidebar";
import HouseDetailModal from "@/components/HouseDetailModal";

// Backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// --- TEMA RENGİ (TURUNCU) ---
const THEME_COLOR = "#FF6B00"; // Canlı Turuncu

// Veri Tipi
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
    description?: string;
    created_at: string;
    is_promoted: boolean;
    features?: any[];
    gallery_images?: any[];
}

const FILTERS: FilterConfig[] = [
    { key: 'search', label: 'Arama', type: 'text', placeholder: 'İlan başlığı veya ilçe ara...' },
    {
        key: 'city', label: 'Şehir', type: 'select', options: [
            { label: 'İstanbul', value: 'ISTANBUL' },
            { label: 'Ankara', value: 'ANKARA' },
            { label: 'İzmir', value: 'IZMIR' },
            { label: 'Eskişehir', value: 'ESKISEHIR' },
            { label: 'Antalya', value: 'ANTALYA' },
        ]
    },
    {
        key: 'room_count', label: 'Oda Sayısı', type: 'select', options: [
            { label: '1+0 (Stüdyo)', value: '1+0' },
            { label: '1+1', value: '1+1' },
            { label: '2+1', value: '2+1' },
            { label: '3+1', value: '3+1' },
        ]
    },
    { key: 'min_price', label: 'En Az Fiyat', type: 'text', placeholder: 'Örn: 5000' },
    { key: 'max_price', label: 'En Çok Fiyat', type: 'text', placeholder: 'Örn: 25000' }
];

// --- İÇERİK BİLEŞENİ (Orijinal Kod Buraya Taşındı) ---
function StudentHousesContent() {
    const searchParams = useSearchParams();
    const [houses, setHouses] = useState<StudentHouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // MODAL STATE
    const [selectedHouse, setSelectedHouse] = useState<StudentHouse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchHouses = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(Array.from(searchParams.entries()));
                const res = await axios.get(`${BACKEND_URL}/api/houses/?${params.toString()}`);
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setHouses(data);
            } catch (error) {
                console.error("Ev verileri çekilemedi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHouses();
    }, [searchParams]);

    const getImageUrl = (path: string | null) => {
        if (!path) return "/placeholder_house.jpg";
        if (path.startsWith("http")) return path;
        return `${BACKEND_URL}${path}`;
    };

    // Karta tıklanınca MODAL açan fonksiyon (404'ü bu engeller)
    const handleHouseClick = (house: StudentHouse) => {
        setSelectedHouse(house);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header */}
                <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/10">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">Öğrenci Evleri</h1>
                        <p className="text-gray-400 text-lg">Kampüsüne yakın, bütçene uygun en iyi evleri bul.</p>
                    </div>
                    <button
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="lg:hidden bg-[#1A1A1A] border border-white/10 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:bg-white/5 transition-colors"
                    >
                        <Filter size={18} className={`text-[${THEME_COLOR}]`} style={{ color: THEME_COLOR }} />
                        Filtrele
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
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
                                <Loader2 className="animate-spin mb-4" size={48} style={{ color: THEME_COLOR }} />
                                <p className="text-gray-500 animate-pulse">İlanlar yükleniyor...</p>
                            </div>
                        ) : houses.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {houses.map((house) => (
                                    // KART ANA GÖVDE
                                    <div
                                        key={house.id}
                                        // ÖNEMLİ: Link değil, onClick kullanıyoruz. 404'ü çözen kısım burası.
                                        onClick={() => handleHouseClick(house)}
                                        className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer
                      ${house.is_promoted
                                                ? `bg-[#161616] border-2 shadow-[0_0_25px_rgba(255,107,0,0.25)]` // GÜNCELLENDİ: Turuncu gölge ve kenarlık
                                                : "bg-[#111] border border-white/10 shadow-lg"
                                            }`}
                                        // Turuncu kenarlık rengini dinamik veriyoruz
                                        style={house.is_promoted ? { borderColor: THEME_COLOR } : {}}
                                    >
                                        {/* --- ÖNE ÇIKAN ROZETİ (GÜNCELLENDİ: Turuncu Gradyan & Beyaz Yazı) --- */}
                                        {house.is_promoted && (
                                            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] text-white text-[10px] font-bold py-1.5 px-3 flex items-center justify-center gap-2 tracking-wide uppercase shadow-md">
                                                <Crown size={12} fill="white" /> Kampüs Yolunda Tavsiyesi
                                            </div>
                                        )}

                                        {/* Görsel Alanı */}
                                        <div className="relative h-56 w-full bg-[#1A1A1A] overflow-hidden mt-0">
                                            <Image
                                                src={getImageUrl(house.cover_image)}
                                                alt={house.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-60" />

                                            {/* Fiyat */}
                                            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                                <span
                                                    className={`font-bold text-lg`}
                                                    style={house.is_promoted ? { color: THEME_COLOR } : { color: 'white' }}
                                                >
                                                    {house.price.toLocaleString()} ₺
                                                </span>
                                            </div>

                                            {/* Eşyalı Rozeti */}
                                            {house.is_furnished && (
                                                <div
                                                    // DÜZELTME BURADA: z-10 yerine z-30 yapıldı.
                                                    className="absolute top-4 right-4 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1 z-30"
                                                    style={{ backgroundColor: THEME_COLOR }}
                                                >
                                                    <Armchair size={12} /> EŞYALI
                                                </div>
                                            )}
                                        </div>

                                        {/* İçerik */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3
                                                className="font-bold text-lg text-white mb-2 line-clamp-1 transition-colors flex items-center gap-2"
                                            >
                                                {house.title}
                                                {house.is_promoted && <Sparkles size={16} style={{ color: THEME_COLOR }} />}
                                            </h3>

                                            <div className="text-gray-400 text-sm flex items-center gap-1.5 mb-4">
                                                <MapPin size={14} style={house.is_promoted ? { color: THEME_COLOR } : { color: 'gray' }} />
                                                {house.district}, {house.city}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-auto border-t border-white/5 pt-4 text-xs font-medium text-gray-300">
                                                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg justify-center">
                                                    <BedDouble size={14} className="text-gray-500" />
                                                    {house.room_count}
                                                </div>
                                                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg justify-center">
                                                    <Square size={14} className="text-gray-500" />
                                                    {house.square_meters ? `${house.square_meters} m²` : '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center bg-[#111] rounded-3xl border border-dashed border-white/10">
                                <div className="w-20 h-20 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-6">
                                    <Home className="text-gray-600" size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">İlan Bulunamadı</h3>
                                <p className="text-gray-400 max-w-sm mx-auto mb-6">Aradığınız kriterlere uygun öğrenci evi bulunamadı.</p>
                                <button onClick={() => window.location.href = '/ogrenci-evleri'} className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-gray-200 transition-colors">
                                    Filtreleri Temizle
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* DETAY MODALI - Sayfa değişmeden açılır */}
            <HouseDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                house={selectedHouse}
            />
        </div>
    );
}

// --- ANA SAYFA (Suspense Wrapper) ---
// Bu kısım Build hatasını çözer ve orijinal kodu korur.
export default function StudentHousesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin mb-4 text-[#FF6B00]" size={48} />
                <p className="text-gray-500">Yükleniyor...</p>
            </div>
        }>
            <StudentHousesContent />
        </Suspense>
    );
}