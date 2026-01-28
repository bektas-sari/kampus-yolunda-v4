"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, GraduationCap, ChevronRight, TrendingUp, Anchor, AlertCircle, Loader2 } from "lucide-react";

// Backend'den gelen verinin yeni yapısı (Nested Object)
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
    university: University; // <-- Artık detaylı obje
}

interface AnalysisResult {
    surprise_choices: Program[];
    ideal_choices: Program[];
    safe_choices: Program[];
}

export default function TercihMotoruPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<AnalysisResult | null>(null);

    // Form State
    const [ranking, setRanking] = useState("");
    const [scoreType, setScoreType] = useState("SAY");
    const [cityFilter, setCityFilter] = useState("");
    const [deptFilter, setDeptFilter] = useState("");

    const handleAnalyze = async () => {
        if (!ranking) return;
        setLoading(true);

        try {
            // API URL (Env veya Fallback)
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
            setStep(2);
        } catch (error) {
            console.error(error);
            alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    // Kart Bileşeni (Yeni Veri Yapısına Uygun)
    const ProgramCard = ({ program, type }: { program: Program, type: 'surprise' | 'ideal' | 'safe' }) => {
        const uniName = program.university?.name || "Üniversite Bilgisi Yok";
        const uniCity = program.university?.city || "";
        const uniSlug = program.university?.slug || "#";

        // Renk ve ikon seçimi
        const styles = {
            surprise: { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-400", label: "Yüksek Hedef", icon: TrendingUp },
            ideal: { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400", label: "İdeal Tercih", icon: AlertCircle },
            safe: { border: "border-green-500/30", bg: "bg-green-500/10", text: "text-green-400", label: "Güvenli Liman", icon: Anchor },
        }[type];

        const Icon = styles.icon;

        return (
            <Link href={`/universite/${uniSlug}`} className={`block group relative bg-white/5 border ${styles.border} rounded-2xl p-5 hover:bg-white/10 transition-all hover:-translate-y-1`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        {/* Logo varsa burada gösterilebilir */}
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white/50">
                            {uniName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm md:text-base leading-tight">{uniName}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                <MapPin className="w-3 h-3" />
                                <span>{uniCity}</span>
                                {program.education_type && <span className="w-1 h-1 bg-gray-600 rounded-full" />}
                                <span>{program.education_type}</span>
                            </div>
                        </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-current ${styles.text} ${styles.bg}`}>
                        {styles.label}
                    </span>
                </div>

                <h4 className="text-lg font-semibold text-gray-200 mb-4 group-hover:text-white transition-colors">
                    {program.name}
                </h4>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Sıralama:</span>
                        <span className="text-white font-mono font-bold">
                            #{program.ranking?.toLocaleString('tr-TR')}
                        </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-20">
            {/* HEADER */}
            <div className="pt-32 pb-10 px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                    Yapay Zeka <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Tercih Motoru</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Sıralamanı gir, algoritma senin için en stratejik tercih listesini oluştursun.
                </p>
            </div>

            {/* INPUT ALANI */}
            <div className="max-w-4xl mx-auto px-4 mb-12">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                        {/* Sıralama */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sıralaman</label>
                            <input
                                type="number"
                                placeholder="Örn: 50000"
                                value={ranking}
                                onChange={(e) => setRanking(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        {/* Puan Türü */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Puan Türü</label>
                            <select
                                value={scoreType}
                                onChange={(e) => setScoreType(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                            >
                                <option value="SAY">SAYISAL (SAY)</option>
                                <option value="EA">EŞİT AĞIRLIK (EA)</option>
                                <option value="SOZ">SÖZEL (SÖZ)</option>
                                <option value="DIL">DİL (DİL)</option>
                            </select>
                        </div>

                        {/* Şehir Filtresi */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Şehir (Opsiyonel)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="İstanbul, Ankara..."
                                    value={cityFilter}
                                    onChange={(e) => setCityFilter(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            </div>
                        </div>

                        {/* Bölüm Filtresi */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bölüm (Opsiyonel)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Bilgisayar, Tıp..."
                                    value={deptFilter}
                                    onChange={(e) => setDeptFilter(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !ranking}
                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <TrendingUp />}
                        {loading ? "Analiz Yapılıyor..." : "Analizi Başlat"}
                    </button>
                </div>
            </div>

            {/* SONUÇLAR */}
            {results && (
                <div className="max-w-7xl mx-auto px-4 space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">

                    {/* 1. Yüksek Hedef (Sürpriz) */}
                    {results.surprise_choices.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Yüksek Hedefler</h2>
                                    <p className="text-gray-400 text-sm">Zor ama denemeye değer sürpriz tercihler.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.surprise_choices.map((prog) => (
                                    <ProgramCard key={prog.id} program={prog} type="surprise" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 2. İdeal Tercih */}
                    {results.ideal_choices.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">İdeal Tercihler</h2>
                                    <p className="text-gray-400 text-sm">Sıralamana en uygun, yerleşme ihtimalin yüksek bölümler.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.ideal_choices.map((prog) => (
                                    <ProgramCard key={prog.id} program={prog} type="ideal" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 3. Güvenli Liman */}
                    {results.safe_choices.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                    <Anchor className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Güvenli Liman</h2>
                                    <p className="text-gray-400 text-sm">Açıkta kalma riskini sıfıra indiren garanti tercihler.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.safe_choices.map((prog) => (
                                    <ProgramCard key={prog.id} program={prog} type="safe" />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}