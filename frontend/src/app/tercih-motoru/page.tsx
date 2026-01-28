"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, ChevronRight, TrendingUp, Anchor, AlertCircle, Loader2 } from "lucide-react";

// --- TİP TANIMLAMALARI ---
interface University {
    name: string;
    slug: string;
    city: string;
    logo?: string;
    uni_type?: string;
}

interface Program {
    id: number;
    name: string;
    program_code: string;
    faculty: string;
    score_type: string;
    quota: number;
    ranking: number | null;
    points: number | null;
    education_type: string;
    university: University;
}

interface AnalysisResult {
    surprise_choices: Program[];
    ideal_choices: Program[];
    safe_choices: Program[];
}

export default function TercihMotoruPage() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<AnalysisResult | null>(null);

    // Form State
    const [ranking, setRanking] = useState("");
    const [scoreType, setScoreType] = useState("SAY");
    const [cityFilter, setCityFilter] = useState("");
    const [deptFilter, setDeptFilter] = useState("");

    // --- BİLİMSEL İHTİMAL HESAPLAMA MOTORU (YKS İSTATİSTİK TABANLI) ---
    const calculateProbability = (studentRank: number, deptRank: number | null) => {
        // 1. Veri Yoksa Hesaplama Yapma
        if (!deptRank || !studentRank || studentRank <= 0) return 0;

        // 2. "Derece Öğrencisi" İstisnası (Rank 1 - 1000)
        // Eğer öğrenci ilk 1000'de ise ve bölümün sıralaması ondan düşükse (daha yüksek sayıysa),
        // bu öğrenci oraya %99.9 ihtimalle girer. Sapma payı yok denecek kadar azdır.
        if (studentRank <= 1000 && deptRank >= studentRank) return 99;

        // 3. Volatilite (Oynaklık) Faktörü
        // Sıralama kötüleştikçe (sayı büyüdükçe), puanların yıllara göre oynama ihtimali artar.
        // İlk 10k'da sıralamalar az oynar, 200k'da çok oynar.
        let volatility = 0.10; // Varsayılan sapma %10
        if (studentRank > 50000) volatility = 0.15;
        if (studentRank > 150000) volatility = 0.20;

        // 4. Fark Analizi (Gap Analysis)
        // Pozitif Gap: Bölüm sıralaması öğrenciden büyük (Öğrenci daha iyi) -> Güvenli Bölge
        const gap = (deptRank - studentRank) / studentRank;

        let probability = 0;

        if (gap >= 0) {
            // --- GÜVENLİ BÖLGE ---
            // Öğrenci bölümden daha iyi sıralamaya sahip.
            if (gap > volatility) {
                // Standart sapmanın bile ötesinde güvenli
                probability = 95 + (gap * 2);
            } else {
                // Güvenli ama sınıra yakın (Örn: Geçen sene 50k, sen 49k'sın)
                probability = 80 + (gap / volatility) * 15;
            }
        } else {
            // --- RİSKLİ BÖLGE (SÜRPRİZ) ---
            // Öğrenci bölümden daha kötü sıralamaya sahip. (Örn: Bölüm 40k, Öğrenci 50k)
            const riskFactor = Math.abs(gap);

            if (riskFactor <= volatility) {
                // Risk toleransı içinde (Örn: Geçen sene 50k, sen 52k'sın. Girme şansın var.)
                probability = 50 + (gap / volatility) * 40;
            } else {
                // Risk toleransı dışında (Çok zor) -> Üstel Düşüş
                probability = 10 * Math.exp(-1 * (riskFactor - volatility) * 5);
            }
        }

        // 5. Sınırlandırma (1 - 99 arası)
        return Math.min(Math.max(Math.round(probability), 1), 99);
    };

    const handleAnalyze = async () => {
        if (!ranking) return;
        setLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kampus-yolunda-api.onrender.com';

            const res = await fetch(`${API_URL}/api/tercih-motoru/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_ranking: parseInt(ranking),
                    score_type: scoreType,
                    city_filter: cityFilter ? [cityFilter] : [],
                    department_filter: deptFilter ? [deptFilter] : [],
                }),
            });

            if (!res.ok) throw new Error("Analiz hatası");
            const data = await res.json();
            setResults(data);
        } catch (error) {
            console.error(error);
            alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    // --- KART BİLEŞENİ ---
    const ProgramCard = ({ program, type }: { program: Program, type: 'surprise' | 'ideal' | 'safe' }) => {
        const uniName = program.university?.name || "Üniversite";
        const uniCity = program.university?.city || "";
        const uniSlug = program.university?.slug || "#";

        // İhtimal Hesapla (Yeni Bilimsel Fonksiyon)
        const probability = calculateProbability(parseInt(ranking), program.ranking);

        // Stil Ayarları
        const styles = {
            surprise: { border: "border-orange-500/30", bg: "bg-orange-500/5", text: "text-orange-400", label: "Yüksek Hedef" },
            ideal: { border: "border-blue-500/30", bg: "bg-blue-500/5", text: "text-blue-400", label: "İdeal Tercih" },
            safe: { border: "border-green-500/30", bg: "bg-green-500/5", text: "text-green-400", label: "Güvenli Liman" },
        }[type];

        return (
            <Link href={`/universite/${uniSlug}`} className={`block group relative bg-[#0a0a0a] border ${styles.border} rounded-xl p-4 hover:bg-white/5 transition-all mb-3`}>
                {/* Üst Kısım: Üniversite ve Logo */}
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50 shrink-0">
                        {uniName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-white font-bold text-xs md:text-sm leading-tight truncate">{uniName}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{uniCity}</span>
                            {program.education_type && <span className="w-1 h-1 bg-gray-700 rounded-full" />}
                            <span>{program.education_type}</span>
                        </div>
                    </div>
                </div>

                {/* Orta Kısım: Bölüm Adı */}
                <h4 className="text-sm font-medium text-gray-300 mb-3 group-hover:text-white transition-colors line-clamp-2">
                    {program.name}
                </h4>

                {/* Alt Kısım: İstatistikler */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${styles.text}`}>%{probability} İhtimal</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                        <span className="text-[10px]">#{program.ranking?.toLocaleString('tr-TR')}</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-20">
            {/* HEADER */}
            <div className="pt-28 pb-8 px-4 text-center">
                <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                    Yapay Zeka <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Tercih Motoru</span>
                </h1>
                <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
                    Gerçek veri analiziyle nokta atışı tercihler yap.
                </p>
            </div>

            {/* INPUT ALANI */}
            <div className="max-w-5xl mx-auto px-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Sıralaman</label>
                            <input
                                type="number"
                                placeholder="Örn: 50000"
                                value={ranking}
                                onChange={(e) => setRanking(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Puan Türü</label>
                            <select
                                value={scoreType}
                                onChange={(e) => setScoreType(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none appearance-none"
                            >
                                <option value="SAY">SAYISAL (SAY)</option>
                                <option value="EA">EŞİT AĞIRLIK (EA)</option>
                                <option value="SOZ">SÖZEL (SÖZ)</option>
                                <option value="DIL">DİL (DİL)</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Şehir</label>
                            <input
                                type="text"
                                placeholder="İstanbul..."
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Bölüm</label>
                            <input
                                type="text"
                                placeholder="Bilgisayar..."
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !ranking}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                        {loading ? "Hesaplanıyor..." : "Analizi Başlat"}
                    </button>
                </div>
            </div>

            {/* SONUÇLAR (YAN YANA 3 SÜTUN) */}
            {results && (
                <div className="max-w-[1400px] mx-auto px-4 animate-in fade-in slide-in-from-bottom-10 duration-700">

                    {/* GRID YAPISI: Masaüstünde 3 Sütun, Mobilde Tek Sütun */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                        {/* 1. SÜTUN: YÜKSEK HEDEFLER */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                                <div className="p-1.5 bg-orange-500/20 rounded text-orange-400">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Yüksek Hedefler</h2>
                                    <p className="text-gray-500 text-xs">Sürpriz tercihler.</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {results.surprise_choices.length > 0 ? (
                                    results.surprise_choices.map((prog) => (
                                        <ProgramCard key={prog.id} program={prog} type="surprise" />
                                    ))
                                ) : (
                                    <div className="text-gray-600 text-sm italic p-4 text-center">Bu aralıkta sonuç bulunamadı.</div>
                                )}
                            </div>
                        </div>

                        {/* 2. SÜTUN: İDEAL TERCİHLER */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                                <div className="p-1.5 bg-blue-500/20 rounded text-blue-400">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">İdeal Tercihler</h2>
                                    <p className="text-gray-500 text-xs">En uygun bölümler.</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {results.ideal_choices.length > 0 ? (
                                    results.ideal_choices.map((prog) => (
                                        <ProgramCard key={prog.id} program={prog} type="ideal" />
                                    ))
                                ) : (
                                    <div className="text-gray-600 text-sm italic p-4 text-center">Bu aralıkta sonuç bulunamadı.</div>
                                )}
                            </div>
                        </div>

                        {/* 3. SÜTUN: GÜVENLİ LİMAN */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                                <div className="p-1.5 bg-green-500/20 rounded text-green-400">
                                    <Anchor className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Güvenli Liman</h2>
                                    <p className="text-gray-500 text-xs">Garanti tercihler.</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {results.safe_choices.length > 0 ? (
                                    results.safe_choices.map((prog) => (
                                        <ProgramCard key={prog.id} program={prog} type="safe" />
                                    ))
                                ) : (
                                    <div className="text-gray-600 text-sm italic p-4 text-center">Bu aralıkta sonuç bulunamadı.</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}