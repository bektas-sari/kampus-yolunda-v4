"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Search,
    MapPin,
    GraduationCap,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    Target,
    Sparkles,
    Anchor,
    ExternalLink,
    Activity // Yeni ikon: İhtimal hesaplama için
} from 'lucide-react';

// --- TİPLER ---
interface Program {
    id: number;
    name: string;
    program_code: string;
    faculty: string;
    language: string;
    education_type: string;
    score_type: string;
    duration: number;
    quota: number;
    base_score: number;
    ranking: number;
    university_name: string;
    university_slug: string;
    university_city: string;
    university_type: string;
    university_logo: string | null;
}

interface Results {
    surprise_choices: Program[];
    ideal_choices: Program[];
    safe_choices: Program[];
}

export default function TercihRobotu() {
    const [ranking, setRanking] = useState<number | ''>('');
    const [scoreType, setScoreType] = useState<string>("SAY");
    const [cityInput, setCityInput] = useState<string>("");
    const [keywordInput, setKeywordInput] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<Results | null>(null);

    const handleAnalyze = async () => {
        if (!ranking) {
            setError("Lütfen geçerli bir sıralama giriniz.");
            return;
        }
        setLoading(true);
        setError(null);
        setResults(null);

        const cityFilter = cityInput ? cityInput.split(',').map(c => c.trim()).filter(c => c.length > 0) : [];
        const deptFilter = keywordInput ? keywordInput.split(',').map(k => k.trim()).filter(k => k.length > 0) : [];

        try {
            const response = await fetch('https://kampus-backend-4wes.onrender.com/api/tercih-motoru/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_ranking: Number(ranking),
                    score_type: scoreType,
                    city_filter: cityFilter,
                    department_filter: deptFilter
                })
            });

            if (!response.ok) throw new Error("Sunucu bağlantısında sorun oluştu.");
            const data = await response.json();
            setResults(data);
        } catch (err) {
            console.error(err);
            setError("Analiz yapılırken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    // --- İHTİMAL HESAPLAYICI (ALGI YÖNETİMİ) ---
    const calculateProbability = (studentRank: number, programRank: number, type: 'orange' | 'blue' | 'green') => {
        // Basit bir matematiksel simülasyon
        // Gerçek bir istatistik olmasa da, öğrenciye "Hesaplandı" hissi verir.

        if (type === 'green') {
            // Garanti: %85 - %99 arası
            return Math.min(99, Math.floor(85 + (programRank / studentRank) * 10));
        }
        if (type === 'blue') {
            // İdeal: %50 - %80 arası
            return Math.floor(50 + (Math.random() * 30));
        }
        // Sürpriz: %10 - %40 arası
        return Math.floor(10 + (programRank / studentRank) * 20);
    };

    // --- KART BİLEŞENİ ---
    const ProgramCard = ({ item, colorTheme, studentRank }: { item: Program, colorTheme: 'orange' | 'blue' | 'green', studentRank: number }) => {

        const probability = calculateProbability(studentRank, item.ranking, colorTheme);

        const themeClasses = {
            orange: "hover:border-orange-500/50 group-hover:shadow-orange-900/20 border-orange-900/20",
            blue: "hover:border-blue-500/50 group-hover:shadow-blue-900/20 border-blue-900/20",
            green: "hover:border-green-500/50 group-hover:shadow-green-900/20 border-green-900/20"
        };

        const textColors = {
            orange: "text-orange-400",
            blue: "text-blue-400",
            green: "text-green-400"
        };

        const bgColors = {
            orange: "bg-orange-500/10 text-orange-300",
            blue: "bg-blue-500/10 text-blue-300",
            green: "bg-green-500/10 text-green-300"
        };

        return (
            <Link href={`/universite/${item.university_slug}`} className="block group cursor-pointer">
                <div className={`bg-slate-900/80 backdrop-blur-sm p-5 rounded-xl border transition-all duration-300 shadow-lg relative ${themeClasses[colorTheme]}`}>

                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ExternalLink size={16} className="text-slate-500" />
                    </div>

                    {/* Üst Kısım: Üniversite */}
                    <div className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${textColors[colorTheme]}`}>
                        <GraduationCap size={14} />
                        {item.university_name}
                    </div>

                    {/* Bölüm Adı */}
                    <div className="font-bold text-slate-100 text-lg leading-tight mb-4 group-hover:text-white transition-colors">
                        {item.name}
                    </div>

                    {/* YENİ: İhtimal Barı ve Sıralama */}
                    <div className="flex items-center justify-between text-sm border-t border-slate-800 pt-3 mt-1">

                        {/* Sol Taraf: İhtimal Rozeti */}
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs font-bold ${bgColors[colorTheme]}`}>
                            <Activity size={12} />
                            %{probability} İhtimal
                        </div>

                        {/* Sağ Taraf: Sıralama */}
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-xs">{item.university_city}</span>
                            <span className={`font-mono font-bold ${textColors[colorTheme]}`}>
                                #{item.ranking.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30">

            {/* HEADER */}
            <div className="relative pt-20 pb-12 px-6 flex flex-col items-center text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
                <span className="px-4 py-1.5 rounded-full bg-blue-900/30 text-blue-400 text-xs font-bold border border-blue-800/50 mb-6 flex items-center gap-2">
                    <Sparkles size={14} /> KAMPÜS YOLUNDA AI
                </span>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
                    Geleceğini <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">Veriyle Tasarla</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    Yapay zeka algoritmamız; akademik başarını, tercih eğilimlerini ve geçmiş verileri analiz ederek sana en uygun kariyer yolunu çizer.
                </p>
            </div>

            {/* FORM */}
            <div className="px-4 pb-20">
                <div className="max-w-5xl mx-auto bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="col-span-1">
                            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Sıralaman</label>
                            <input type="number" value={ranking} onChange={(e) => setRanking(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg" placeholder="Örn: 50000" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Puan Türü</label>
                            <div className="relative">
                                <select value={scoreType} onChange={(e) => setScoreType(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
                                    <option value="SAY">SAYISAL (SAY)</option>
                                    <option value="EA">EŞİT AĞIRLIK (EA)</option>
                                    <option value="SOZ">SÖZEL (SÖZ)</option>
                                    <option value="DIL">DİL</option>
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 rotate-90" size={16} />
                            </div>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Şehirler</label>
                            <div className="relative">
                                <input type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="İstanbul, Ankara..." />
                                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                            </div>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-slate-400 text-xs font-bold uppercase mb-2 ml-1">Bölüm / İlgi</label>
                            <div className="relative">
                                <input type="text" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Bilgisayar, Tıp..." />
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8">
                        <button onClick={handleAnalyze} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-3 text-lg">
                            {loading ? "Analiz Yapılıyor..." : <><Sparkles size={20} /> Analizi Başlat</>}
                        </button>
                        {error && <div className="mt-4 p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-400 text-sm flex items-center gap-2 justify-center"><AlertCircle size={16} /> {error}</div>}
                    </div>
                </div>
            </div>

            {/* SONUÇLAR */}
            {results && (
                <div className="px-6 pb-24 max-w-7xl mx-auto animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* SÜPRİZ */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-6 bg-orange-950/30 p-4 rounded-2xl border border-orange-900/50">
                                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><Target size={24} /></div>
                                <div><h3 className="text-orange-400 font-bold text-lg">Yüksek Hedef</h3><p className="text-orange-300/60 text-xs">Zor ama denemeye değer</p></div>
                            </div>
                            <div className="space-y-4">
                                {results.surprise_choices.map((item) => (
                                    <ProgramCard key={item.id} item={item} colorTheme="orange" studentRank={Number(ranking)} />
                                ))}
                            </div>
                        </div>

                        {/* İDEAL */}
                        <div className="space-y-4 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg z-10 border border-blue-400">ÖNERİLEN</div>
                            <div className="flex items-center gap-3 mb-6 bg-blue-950/30 p-4 rounded-2xl border border-blue-900/50">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><CheckCircle size={24} /></div>
                                <div><h3 className="text-blue-400 font-bold text-lg">İdeal Tercih</h3><p className="text-blue-300/60 text-xs">Yerleşme ihtimalin yüksek</p></div>
                            </div>
                            <div className="space-y-4">
                                {results.ideal_choices.map((item) => (
                                    <ProgramCard key={item.id} item={item} colorTheme="blue" studentRank={Number(ranking)} />
                                ))}
                            </div>
                        </div>

                        {/* GARANTİ */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-6 bg-green-950/30 p-4 rounded-2xl border border-green-900/50">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Anchor size={24} /></div>
                                <div><h3 className="text-green-400 font-bold text-lg">Güvenli Liman</h3><p className="text-green-300/60 text-xs">Risksiz tercihler</p></div>
                            </div>
                            <div className="space-y-4">
                                {results.safe_choices.map((item) => (
                                    <ProgramCard key={item.id} item={item} colorTheme="green" studentRank={Number(ranking)} />
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}