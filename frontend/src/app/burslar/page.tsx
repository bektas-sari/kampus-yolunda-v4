"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Search, MapPin, Calendar, Clock, ArrowRight, GraduationCap, Loader2 } from "lucide-react";

// --- TİP TANIMLAMALARI ---
interface Scholarship {
    id: number;
    title: string;
    slug: string;
    provider: string;
    amount: string;
    deadline: string; // "2024-05-20" formatında gelebilir
    city: string;
    category: string;
    education_level: string;
    logo?: string;
}

// --- YARDIMCI FONKSİYON: KALAN GÜN HESABI ---
const getDaysLeft = (dateString: string) => {
    if (!dateString) return 0;
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function BurslarPage() {
    // 1. KRİTİK NOKTA: Başlangıç değeri BOŞ DİZİ ([]) olmalı
    const [scholarships, setScholarships] = useState<Scholarship[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function fetchScholarships() {
            try {
                // API isteği
                const res = await axios.get("http://127.0.0.1:8000/api/scholarships/");
                const data = res.data;

                // 2. KRİTİK NOKTA: Backend ne gönderirse göndersin, biz onu DİZİYE çeviriyoruz
                // Eğer { count: 5, results: [...] } geldiyse -> results'ı al
                // Eğer [...] geldiyse -> kendisini al
                // Hiçbir şey gelmediyse -> boş dizi [] al
                let safeData: Scholarship[] = [];

                if (Array.isArray(data)) {
                    safeData = data;
                } else if (data && Array.isArray(data.results)) {
                    safeData = data.results;
                } else {
                    console.warn("API beklenen formatta veri dönmedi, boş dizi atandı.");
                    safeData = [];
                }

                setScholarships(safeData);

            } catch (error) {
                console.error("Burs verileri çekilemedi:", error);
                setScholarships([]); // Hata olursa listeyi temizle, patlatma
            } finally {
                setLoading(false);
            }
        }

        fetchScholarships();
    }, []);

    // ARAMA FİLTRESİ (Client-Side)
    // scholarships dizisi boş olsa bile .filter çalışır (boş döner), hata vermez.
    const filteredItems = scholarships.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.provider.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20 font-sans">
            <div className="container mx-auto px-6 max-w-7xl">

                {/* BAŞLIK VE ARAMA */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="h-px w-8 bg-[#00ff88]"></span>
                            <span className="text-[#00ff88] text-xs font-bold uppercase tracking-widest">Fırsatlar</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                            Burs İlanları
                        </h1>
                        <p className="text-gray-400 mt-2 max-w-xl">
                            Eğitim hayatına destek olacak en güncel burs fırsatlarını keşfet.
                        </p>
                    </div>

                    <div className="w-full md:w-96 relative">
                        <input
                            type="text"
                            placeholder="Burs veya kurum ara..."
                            className="w-full bg-[#111] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00ff88]/50 transition-colors shadow-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    </div>
                </div>

                {/* LİSTELEME ALANI */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
                        <Loader2 className="animate-spin text-[#00ff88]" size={48} />
                        <p className="animate-pulse">Burslar aranıyor...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-20 bg-[#111] rounded-3xl border border-dashed border-white/10">
                        <GraduationCap className="mx-auto text-gray-600 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-white mb-2">Sonuç Bulunamadı</h3>
                        <p className="text-gray-500">Aradığınız kriterlere uygun burs ilanı henüz eklenmemiş.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 3. KRİTİK NOKTA: Artık filteredItems kesinlikle bir dizi, .map() hata vermez */}
                        {filteredItems.map((item) => {
                            const daysLeft = getDaysLeft(item.deadline);
                            const isUrgent = daysLeft > 0 && daysLeft <= 3;
                            const isExpired = daysLeft < 0;

                            return (
                                <Link
                                    key={item.id}
                                    href={`/burslar/${item.slug}`}
                                    className={`group bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-[#00ff88]/30 transition-all hover:-translate-y-1 relative overflow-hidden ${isExpired ? 'opacity-60 grayscale' : ''}`}
                                >
                                    {isUrgent && (
                                        <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-lg z-10 animate-pulse">
                                            SON {daysLeft} GÜN
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-6">
                                        <div className="h-14 w-14 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg">
                                            {item.logo ? (
                                                <img src={item.logo} alt={item.provider} className="max-w-full max-h-full object-contain" />
                                            ) : (
                                                <GraduationCap className="text-black" size={24} />
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[#00ff88] font-bold text-lg">{item.amount}</div>
                                            <div className="text-[10px] text-gray-500 uppercase font-bold">AYLIK / TEK SEFERLİK</div>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00ff88] transition-colors line-clamp-2 min-h-[56px]">
                                        {item.title}
                                    </h3>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <GraduationCap size={16} className="text-[#00ff88]" />
                                            <span className="truncate">{item.provider}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <MapPin size={16} className="text-[#00ff88]" />
                                            <span>{item.city}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Calendar size={16} className="text-[#00ff88]" />
                                            <span>Son Başvuru: <span className="text-white">{item.deadline}</span></span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded">
                                            {item.education_level}
                                        </span>
                                        <div className="flex items-center gap-1 text-sm font-bold text-white group-hover:gap-2 transition-all">
                                            Başvur <ArrowRight size={16} className="text-[#00ff88]" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}