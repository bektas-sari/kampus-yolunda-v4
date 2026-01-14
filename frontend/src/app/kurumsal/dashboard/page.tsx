"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    Users, Eye, MousePointer, TrendingUp,
    ArrowUpRight, ArrowDownRight, Activity, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- TİP TANIMLAMALARI (Backend'den gelen veri yapısı) ---
interface DashboardMetrics {
    total_views: number;
    total_web_clicks: number;
    total_leads: number;
    interaction_rate: number;
    search_rank: number;
}

interface CompetitorData {
    name: string;
    rate: string;
    desc: string;
}

interface DepartmentData {
    department__name: string;
    department__quota: string;
    views: number;
}

interface DashboardData {
    university_name: string;
    metrics: DashboardMetrics;
    competitor_radar: CompetitorData[];
    top_departments: DepartmentData[];
    last_updated: string;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchStats() {
            // 1. ADIM: KASADAN ANAHTARI (TOKEN) AL
            const token = localStorage.getItem('access');

            // Eğer anahtar yoksa, Login sayfasına kov
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                // 2. ADIM: İSTEĞİ ANAHTARLA BERABER GÖNDER
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/dashboard/stats/`, {
                    headers: {
                        'Authorization': `Bearer ${token}` // <-- İŞTE SİHİRLİ KELİME
                    }
                });
                setData(res.data);
            } catch (error) {
                console.error("Dashboard verisi alınamadı:", error);
                // Token süresi dolmuş olabilir, login'e atabiliriz
                // router.push('/login'); 
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, [router]);

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
            <Loader2 className="animate-spin text-[#00ff88]" size={40} />
            <p className="animate-pulse">Veriler Analiz Ediliyor...</p>
        </div>
    );

    if (!data) return <div className="p-8 text-white">Veri yüklenemedi. Lütfen tekrar giriş yapın.</div>;

    return (
        <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">

            {/* BAŞLIK */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Genel Bakış</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        <span className="text-[#00ff88] font-bold">{data.university_name}</span> performans özeti.
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-[#111] border border-white/10 text-gray-400 px-3 py-1 rounded text-xs font-mono">
                        SON GÜNCELLEME: {new Date(data.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button className="bg-[#00ff88] text-black text-xs font-bold px-4 py-1 rounded hover:bg-[#00cc6a] transition-colors">
                        Rapor İndir
                    </button>
                </div>
            </div>

            {/* METRİK KARTLARI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                {/* 1. GÖRÜNTÜLENME */}
                <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Eye size={80} />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                            <Eye size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 px-2 py-1 rounded-full">
                            +%12.5 <ArrowUpRight size={12} />
                        </span>
                    </div>
                    <div className="text-4xl font-bold text-white mb-1">{data.metrics.total_views}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">TOPLAM GÖRÜNTÜLENME</div>
                </div>

                {/* 2. ADAY KAYIT (LEAD) */}
                <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={80} />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-[#00ff88]/10 rounded-2xl text-[#00ff88]">
                            <Users size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 px-2 py-1 rounded-full">
                            YENİ
                        </span>
                    </div>
                    <div className="text-4xl font-bold text-white mb-1">{data.metrics.total_leads}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">POTANSİYEL KAYIT (LEAD)</div>
                </div>

                {/* 3. ETKİLEŞİM */}
                <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <MousePointer size={80} />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                            <MousePointer size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 px-2 py-1 rounded-full">
                            WEB + TEL
                        </span>
                    </div>
                    <div className="text-4xl font-bold text-white mb-1">
                        {data.metrics.total_web_clicks + data.metrics.total_web_clicks}
                    </div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">TOPLAM AKSİYON</div>
                </div>

                {/* 4. SIRALAMA */}
                <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={80} />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400">
                            <Activity size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 px-2 py-1 rounded-full">
                            2 Sıra <ArrowUpRight size={12} />
                        </span>
                    </div>
                    <div className="text-4xl font-bold text-white mb-1">#{data.metrics.search_rank}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">ARAMA SIRALAMASI</div>
                </div>
            </div>

            {/* ALT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* SOL: POPÜLER BÖLÜMLER */}
                <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white">En Çok İlgilenilen Bölümler</h3>
                            <p className="text-gray-500 text-xs">Aday öğrencilerin sayfanızda en çok vakit geçirdiği bölümler.</p>
                        </div>
                        <button className="text-gray-400 hover:text-white">...</button>
                    </div>

                    <div className="space-y-4">
                        {data.top_departments.length > 0 ? (
                            data.top_departments.map((dept, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-[#111] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="font-bold text-gray-500 text-lg w-6">0{idx + 1}</div>
                                        <div>
                                            <div className="text-white font-bold text-sm">{dept.department__name}</div>
                                            <div className="text-xs text-gray-500">Kontenjan: {dept.department__quota}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[#00ff88] font-bold text-lg">{dept.views}</div>
                                        <div className="text-[10px] text-gray-500 uppercase">Görüntülenme</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 border border-dashed border-white/10 rounded-xl text-center text-gray-500 text-sm">
                                Henüz bölüm görüntülenme verisi oluşmadı.
                            </div>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <button className="text-xs font-bold text-white hover:text-[#00ff88] transition-colors">
                            Tüm Bölümleri Görüntüle
                        </button>
                    </div>
                </div>

                {/* SAĞ: RAKİP RADARI */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Activity className="text-orange-500" /> Rakip Radarı
                        </h3>
                        <div className="space-y-6 mt-6">
                            {data.competitor_radar.map((comp, idx) => (
                                <div key={idx} className="border-b border-white/5 pb-4 last:border-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-white font-bold text-sm flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full border border-orange-500"></span>
                                            {comp.name}
                                        </span>
                                        <span className={`text-sm font-bold ${comp.rate === 'Pazar Lideri' ? 'text-[#00ff88]' :
                                            comp.rate === 'Ortalama Altı' ? 'text-red-500' : 'text-yellow-500'
                                            }`}>
                                            {comp.rate}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-xs leading-relaxed">
                                        {comp.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl mt-6">
                        <p className="text-orange-400 text-xs font-bold mb-1">Yapay Zeka İçgörüsü:</p>
                        <p className="text-gray-400 text-[10px] leading-relaxed">
                            Veri analizi henüz başlangıç aşamasında. Daha fazla trafik toplandığında burada rakip karşılaştırmalarını göreceksiniz.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}