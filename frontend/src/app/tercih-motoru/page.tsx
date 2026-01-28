"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, ChevronRight, TrendingUp, Anchor, AlertCircle, Loader2, Sparkles, MessageSquareQuote } from "lucide-react";

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

    // --- BİLİMSEL İHTİMAL HESAPLAMA MOTORU ---
    const calculateProbability = (studentRank: number, deptRank: number | null) => {
        if (!deptRank || !studentRank || studentRank <= 0) return 0;
        if (studentRank <= 1000 && deptRank >= studentRank) return 99;

        let volatility = 0.10;
        if (studentRank > 50000) volatility = 0.15;
        if (studentRank > 150000) volatility = 0.20;

        const gap = (deptRank - studentRank) / studentRank;
        let probability = 0;

        if (gap >= 0) {
            if (gap > volatility) probability = 95 + (gap * 2);
            else probability = 80 + (gap / volatility) * 15;
        } else {
            const riskFactor = Math.abs(gap);
            if (riskFactor <= volatility) probability = 50 + (gap / volatility) * 40;
            else probability = 10 * Math.exp(-1 * (riskFactor - volatility) * 5);
        }
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

    // --- YAPAY ZEKA YORUM ÜRETİCİSİ (YENİ EKLENDİ) ---
    const generateAICommentary = () => {
        if (!results || !ranking) return null;
        const rank = parseInt(ranking);

        const hasSurprise = results.surprise_choices.length > 0;
        const hasIdeal = results.ideal_choices.length > 0;
        const hasSafe = results.safe_choices.length > 0;
        const totalResults = results.surprise_choices.length + results.ideal_choices.length + results.safe_choices.length;

        // SENARYO 1: FAZLA NİTELİKLİ (İzmir Kimya Örneği)
        // Eğer sürpriz ve ideal yok ama güvenli varsa, ve öğrenci derecesi iyiyse.
        if (!hasSurprise && !hasIdeal && hasSafe && rank < 50000) {
            return (
                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-5 mb-8 flex gap-4 items-start animate-in fade-in slide-in-from-top-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 shrink-0">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-indigo-200 font-bold mb-1">Akademik Performans Analizi</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Mevcut sıralamanız ({rank.toLocaleString('tr-TR')}), filtrelediğiniz kriterlerdeki bölümlerin genel yerleştirme istatistiklerinin
                            <strong className="text-white"> belirgin şekilde üzerindedir.</strong>
                            <br /><br />
                            Bu bölgedeki bölümler sizin için akademik bir risk taşımamakta olup, tamamı <span className="text-green-400 font-bold">"Güvenli Liman"</span> statüsündedir.
                            Sistem, yapay hedefler oluşturmak yerine piyasa gerçeklerini yansıtarak, bu seçeneklere %99 ihtimalle yerleşebileceğinizi öngörmektedir.
                        </p>
                    </div>
                </div>
            );
        }

        // SENARYO 2: DERECE ÖĞRENCİSİ (Rank 1 Örneği)
        if (rank < 5000 && hasSafe) {
            return (
                <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-5 mb-8 flex gap-4 items-start animate-in fade-in slide-in-from-top-4">
                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-amber-200 font-bold mb-1">Derece Öğrencisi Analizi</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Tebrikler! Sıralamanız ({rank.toLocaleString('tr-TR')}), Türkiye'nin en prestijli bölümlerinin kapısını açmaktadır.
                            <br /><br />
                            Bu seviyede "Sürpriz" veya "Risk" faktörü bulunmamaktadır. Listelenen tüm bölümler, akademik başarınızın doğal bir sonucudur ve
                            tercih listenize güvenle ekleyebilirsiniz.
                        </p>
                    </div>
                </div>
            );
        }

        // SENARYO 3: DENGELİ DAĞILIM (Standart Senaryo)
        if (totalResults > 0) {
            return (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-5 mb-8 flex gap-4 items-start animate-in fade-in slide-in-from-top-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
                        <MessageSquareQuote className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-blue-200 font-bold mb-1">Stratejik Tercih Özeti</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Profiliniz için <strong className="text-white">{totalResults} farklı seçenek</strong> analiz edildi.
                            Listenizdeki risk dengesini korumak adına; {hasSurprise && "motivasyon için üst hedeflerden,"}
                            {hasIdeal && " gerçekçi ideallerden"} {hasSafe && " ve açıkta kalma riskini sıfırlayan güvenli limanlardan"} oluşan bir karma önerilmektedir.
                        </p>
                    </div>
                </div>
            );
        }

        // SENARYO 4: SONUÇ YOK
        return (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-5 mb-8 flex gap-4 items-start animate-in fade-in slide-in-from-top-4">
                <div className="p-2 bg-red-500/20 rounded-lg text-red-400 shrink-0">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-red-200 font-bold mb-1">Kritik Uyarı</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        Girdiğiniz kriterlerde ({cityFilter || "Tüm Şehirler"} - {deptFilter || "Tüm Bölümler"}) sıralamanızla ({rank}) eşleşen bir bölüm bulunamadı.
                        Bu, hedeflerinizin mevcut akademik piyasa verileriyle uyuşmadığını gösterir. Lütfen kriterlerinizi genişletmeyi deneyin.
                    </p>
                </div>
            </div>
        );
    };

    // --- KART BİLEŞENİ ---
    const ProgramCard = ({ program, type }: { program: Program, type: 'surprise' | 'ideal' | 'safe' }) => {
        const uniName = program.university?.name || "Üniversite";
        const uniCity = program.university?.city || "";
        const uniSlug = program.university?.slug || "#";
        const probability = calculateProbability(parseInt(ranking), program.ranking);

        const styles = {
            surprise: { border: "border-orange-500/30", bg: "bg-orange-500/5", text: "text-orange-400", label: "Yüksek Hedef", icon: TrendingUp },
            ideal: { border: "border-blue-500/30", bg: "bg-blue-500/5", text: "text-blue-400", label: "İdeal Tercih", icon: AlertCircle },
            safe: { border: "border-green-500/30", bg: "bg-green-500/5", text: "text-green-400", label: "Güvenli Liman", icon: Anchor },
        }[type];

        const Icon = styles.icon;

        return (
            <Link href={`/universite/${uniSlug}`} className={`block group relative bg-[#0a0a0a] border ${styles.border} rounded-xl p-4 hover:bg-white/5 transition-all mb-3 hover:translate-x-1`}>
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/50 shrink-0 border border-white/5">
                        {uniName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-white font-bold text-xs md:text-sm leading-tight truncate pr-4">{uniName}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{uniCity}</span>
                            {program.education_type && <span className="w-1 h-1 bg-gray-700 rounded-full" />}
                            <span>{program.education_type}</span>
                        </div>
                    </div>
                    <div className={`absolute top-4 right-4 p-1.5 rounded-md bg-white/5 ${styles.text}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                </div>

                <h4 className="text-sm font-medium text-gray-300 mb-4 group-hover:text-white transition-colors line-clamp-2">
                    {program.name}
                </h4>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-16 rounded-full bg-gray-800 overflow-hidden`}>
                            <div className={`h-full ${probability > 80 ? 'bg-green-500' : probability > 50 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${probability}%` }}></div>
                        </div>
                        <span className={`text-[10px] font-bold ${styles.text}`}>%{probability}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                        <span className="text-[10px] font-mono">#{program.ranking?.toLocaleString('tr-TR')}</span>
                        <ChevronRight className="w-3 h-3" />
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-20 font-sans selection:bg-blue-500/30">
            {/* HEADER */}
            <div className="pt-28 pb-8 px-4 text-center">
                <div className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span className="text-xs font-bold tracking-wide uppercase">Beta v2.0</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                    Yapay Zeka <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Tercih Motoru</span>
                </h1>
                <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
                    Sıralamanı gir, algoritma senin için en stratejik tercih listesini oluştursun.
                </p>
            </div>

            {/* INPUT ALANI */}
            <div className="max-w-5xl mx-auto px-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Sıralaman</label>
                            <input
                                type="number"
                                placeholder="Örn: 50000"
                                value={ranking}
                                onChange={(e) => setRanking(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Puan Türü</label>
                            <select
                                value={scoreType}
                                onChange={(e) => setScoreType(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:border-blue-500 outline-none appearance-none transition-colors"
                            >
                                <option value="SAY">SAYISAL (SAY)</option>
                                <option value="EA">EŞİT AĞIRLIK (EA)</option>
                                <option value="SOZ">SÖZEL (SÖZ)</option>
                                <option value="DIL">DİL (DİL)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Şehir (Opsiyonel)</label>
                            <input
                                type="text"
                                placeholder="İstanbul..."
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Bölüm (Opsiyonel)</label>
                            <input
                                type="text"
                                placeholder="Bilgisayar..."
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !ranking}
                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                        {loading ? "Veriler Analiz Ediliyor..." : "Analizi Başlat"}
                    </button>
                </div>
            </div>

            {/* SONUÇLAR VE ANALİZ RAPORU */}
            {results && (
                <div className="max-w-[1400px] mx-auto px-4 animate-in fade-in slide-in-from-bottom-10 duration-700">

                    {/* YENİ: YAPAY ZEKA YORUM ALANI */}
                    {generateAICommentary()}

                    {/* GRID YAPISI */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                        {/* 1. SÜTUN: YÜKSEK HEDEFLER */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400 border border-orange-500/20">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Yüksek Hedefler</h2>
                                    <p className="text-gray-500 text-xs">Zor ama denemeye değer.</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {results.surprise_choices.length > 0 ? (
                                    results.surprise_choices.map((prog) => (
                                        <ProgramCard key={prog.id} program={prog} type="surprise" />
                                    ))
                                ) : (
                                    <div className="bg-white/5 border border-white/5 rounded-xl p-6 text-center">
                                        <p className="text-gray-500 text-sm">Bu aralıkta uygun seçenek bulunamadı.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. SÜTUN: İDEAL TERCİHLER */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">İdeal Tercihler</h2>
                                    <p className="text-gray-500 text-xs">En uygun eşleşmeler.</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {results.ideal_choices.length > 0 ? (
                                    results.ideal_choices.map((prog) => (
                                        <ProgramCard key={prog.id} program={prog} type="ideal" />
                                    ))
                                ) : (
                                    <div className="bg-white/5 border border-white/5 rounded-xl p-6 text-center">
                                        <p className="text-gray-500 text-sm">Bu aralıkta uygun seçenek bulunamadı.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. SÜTUN: GÜVENLİ LİMAN */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                                <div className="p-2 bg-green-500/10 rounded-lg text-green-400 border border-green-500/20">
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
                                    <div className="bg-white/5 border border-white/5 rounded-xl p-6 text-center">
                                        <p className="text-gray-500 text-sm">Bu aralıkta uygun seçenek bulunamadı.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}