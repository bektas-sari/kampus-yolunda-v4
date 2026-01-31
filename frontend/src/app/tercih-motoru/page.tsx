"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy, Shield, Zap, X, ChevronRight, Building2, MapPin, BookOpen
} from "lucide-react";

// Kendi oluşturduğumuz Radar bileşeni
import UniversityRadarChart from "@/components/UniversityRadarChart";

// --- DÜZELTME 1: TİPLERİ ZORUNLU YAPTIK (Soru işaretleri kalktı) ---
interface UniversityStats {
    academic_score: number;
    campus_score: number;
    city_score: number;
    career_score: number; // '?' kaldırıldı
    social_score: number; // '?' kaldırıldı
    tech_score: number;   // '?' kaldırıldı
}

interface Program {
    id: number;
    name: string;
    program_code: string;
    university_name: string;
    university_city: string;
    university_type: string;
    university_logo: string | null;
    university_stats: UniversityStats | null;
    ranking: number;
    score: number;
    quota: number;
    scholarship_rate: number;
    is_english: boolean;
    reasons: string[];
}

interface ResultsData {
    surprise_choices: Program[];
    ideal_choices: Program[];
    safe_choices: Program[];
}

// --- ANA SAYFA BİLEŞENİ ---
export default function TercihMotoruPage() {
    const [formData, setFormData] = useState({
        ranking: "",
        city: "",
        department: "",
        scoreType: "SAY"
    });

    // Filtre Listeleri
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [availableDepts, setAvailableDepts] = useState<string[]>([]);

    const [results, setResults] = useState<ResultsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

    // 1. Sayfa Yüklendiğinde Filtreleri Çek
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const res = await fetch("https://kampus-backend-4wes.onrender.com/api/filters/");
                if (res.ok) {
                    const data = await res.json();
                    setAvailableCities(data.cities || []);
                    setAvailableDepts(data.departments || []);
                }
            } catch (error) {
                console.error("Filtreler yüklenemedi:", error);
            }
        };
        fetchFilters();
    }, []);

    // 2. Arama Fonksiyonu
    const handleSearch = async () => {
        if (!formData.ranking) return alert("Lütfen sıralamanızı girin.");

        setLoading(true);
        try {
            const res = await fetch("https://kampus-backend-4wes.onrender.com/api/tercih-motoru/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_ranking: parseInt(formData.ranking),
                    score_type: formData.scoreType,
                    city_filter: formData.city ? [formData.city] : [],
                    department_filter: formData.department ? [formData.department] : []
                })
            });

            const data = await res.json();
            setResults(data);
        } catch (error) {
            console.error("Hata:", error);
            alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pb-20 font-sans">

            {/* ÜST KISIM: ARAMA FORMU */}
            <div className="max-w-5xl mx-auto mt-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
                        Yapay Zeka Tercih Motoru
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Sadece puanına göre değil; yeteneklerine, hayallerine ve veri bilimine dayalı
                        en doğru üniversite tercihlerini keşfet.
                    </p>
                </div>

                <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Sıralama */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sıralaman</label>
                            <div className="relative">
                                <Trophy className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    placeholder="Örn: 50000"
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-600"
                                    value={formData.ranking}
                                    onChange={(e) => setFormData({ ...formData, ranking: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Puan Türü */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Puan Türü</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-white cursor-pointer"
                                    value={formData.scoreType}
                                    onChange={(e) => setFormData({ ...formData, scoreType: e.target.value })}
                                >
                                    <option value="SAY">SAYISAL (SAY)</option>
                                    <option value="EA">EŞİT AĞIRLIK (EA)</option>
                                    <option value="SOZ">SÖZEL (SÖZ)</option>
                                    <option value="DIL">DİL (DİL)</option>
                                </select>
                                <ChevronRight className="absolute right-3 top-3 w-4 h-4 text-gray-500 rotate-90 pointer-events-none" />
                            </div>
                        </div>

                        {/* Şehir (Akıllı Arama) */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Şehir</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    list="cities-list"
                                    placeholder="Örn: İstanbul"
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-600"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                                <datalist id="cities-list">
                                    {availableCities.map((city, idx) => (
                                        <option key={idx} value={city} />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        {/* Bölüm (Akıllı Arama) */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bölüm</label>
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    list="depts-list"
                                    placeholder="Örn: Bilgisayar"
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-600"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                />
                                <datalist id="depts-list">
                                    {availableDepts.map((dept, idx) => (
                                        <option key={idx} value={dept} />
                                    ))}
                                </datalist>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Analiz Yapılıyor...
                            </span>
                        ) : (
                            <>
                                <Zap className="w-5 h-5" /> Analizi Başlat
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* SONUÇLAR (GRID YAPISI) */}
            {results && (
                <div className="max-w-7xl mx-auto mt-16 space-y-16">

                    {results.surprise_choices?.length > 0 && (
                        <ResultCategory
                            title="Yüksek Hedefler"
                            icon={<Zap className="w-6 h-6 text-yellow-400" />}
                            color="yellow"
                            programs={results.surprise_choices}
                            onCardClick={setSelectedProgram}
                        />
                    )}

                    {results.ideal_choices?.length > 0 && (
                        <ResultCategory
                            title="İdeal Tercihler"
                            icon={<Trophy className="w-6 h-6 text-blue-400" />}
                            color="blue"
                            programs={results.ideal_choices}
                            onCardClick={setSelectedProgram}
                        />
                    )}

                    {results.safe_choices?.length > 0 && (
                        <ResultCategory
                            title="Güvenli Limanlar"
                            icon={<Shield className="w-6 h-6 text-green-400" />}
                            color="green"
                            programs={results.safe_choices}
                            onCardClick={setSelectedProgram}
                        />
                    )}
                </div>
            )}

            {/* POPUP MODAL (DETAY) */}
            <AnimatePresence>
                {selectedProgram && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProgram(null)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111] border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-[#111]/95 backdrop-blur z-10 border-b border-gray-800 p-6 flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-white rounded-lg p-1 flex items-center justify-center">
                                        {selectedProgram.university_logo ? (
                                            <img src={selectedProgram.university_logo} alt="logo" className="max-w-full max-h-full object-contain" />
                                        ) : (
                                            <Building2 className="text-black w-8 h-8" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white leading-tight">{selectedProgram.name}</h2>
                                        <p className="text-gray-400 text-lg">{selectedProgram.university_name}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Badge>{selectedProgram.university_city}</Badge>
                                            <Badge>{selectedProgram.university_type}</Badge>
                                            {selectedProgram.is_english && <Badge color="blue">İngilizce</Badge>}
                                            {selectedProgram.scholarship_rate > 0 && <Badge color="green">%{selectedProgram.scholarship_rate} Burslu</Badge>}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedProgram(null)} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* SOL: İstatistikler */}
                                <div className="space-y-6">
                                    <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Akademik Veriler</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <StatItem label="Başarı Sırası" value={`#${selectedProgram.ranking}`} highlight />
                                            <StatItem label="Taban Puan" value={selectedProgram.score} />
                                            <StatItem label="Kontenjan" value={selectedProgram.quota} />
                                            <StatItem label="Puan Türü" value="SAY" />
                                        </div>
                                    </div>

                                    {/* RADAR GRAFİĞİ: Harici Bileşen */}
                                    <div className="bg-gray-900/50 rounded-xl p-2 border border-gray-800 flex flex-col items-center justify-center">
                                        {selectedProgram.university_stats ? (
                                            <UniversityRadarChart stats={selectedProgram.university_stats} />
                                        ) : (
                                            <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">
                                                Veri bulunamadı.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SAĞ: Yorumlar ve Açıklama */}
                                <div className="space-y-6">
                                    <div className="bg-blue-900/10 border border-blue-800/30 rounded-xl p-6">
                                        <div className="flex items-center gap-2 text-blue-400 font-bold mb-4">
                                            <Zap className="w-5 h-5" />
                                            <span>Yapay Zeka Analizi</span>
                                        </div>
                                        <ul className="space-y-3">
                                            {selectedProgram.reasons.map((reason, i) => (
                                                <li key={i} className="flex gap-3 text-gray-300 text-sm leading-relaxed">
                                                    <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                                    {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="text-sm text-gray-400 leading-relaxed">
                                        <p>
                                            <strong>{selectedProgram.university_name}</strong>, {selectedProgram.university_city} şehrinin
                                            önemli eğitim kurumlarından biridir. Bölümün eğitim dili <strong>{selectedProgram.is_english ? 'İngilizce' : 'Türkçe'}</strong> olup,
                                            geniş akademik kadrosu ve kampüs olanaklarıyla öne çıkmaktadır.
                                        </p>
                                    </div>

                                    <button className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
                                        Üniversite Sayfasına Git
                                    </button>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

// --- DÜZELTME 2 & 3: TİPLERİ BELİRTİLMİŞ YARDIMCI BİLEŞENLER ---

interface ResultCategoryProps {
    title: string;
    icon: React.ReactNode;
    color: 'yellow' | 'blue' | 'green';
    programs: Program[];
    onCardClick: (prog: Program) => void;
}

const ResultCategory = ({ title, icon, color, programs, onCardClick }: ResultCategoryProps) => {
    const colorClasses = {
        yellow: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/50",
        blue: "text-blue-400 border-blue-500/20 bg-blue-500/5 hover:border-blue-500/50",
        green: "text-green-400 border-green-500/20 bg-green-500/5 hover:border-green-500/50",
    };

    const badgeColors = {
        yellow: 'text-yellow-400',
        blue: 'text-blue-400',
        green: 'text-green-400'
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                {icon}
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <span className="px-2 py-0.5 bg-gray-800 rounded-full text-xs text-gray-400 font-mono">
                    {programs.length}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((prog: Program) => (
                    <motion.div
                        key={prog.id}
                        whileHover={{ y: -5 }}
                        onClick={() => onCardClick(prog)}
                        className={`relative p-5 rounded-xl border cursor-pointer transition-all group ${colorClasses[color]}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                                {prog.university_logo ? (
                                    <img src={prog.university_logo} className="w-8 h-8 object-contain" alt="logo" />
                                ) : (
                                    <Building2 className="w-8 h-8 text-white" />
                                )}
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-sm font-bold ${badgeColors[color]}`}>
                                    #{prog.ranking}
                                </span>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 min-h-[3.5rem]">
                            {prog.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-1">{prog.university_name}</p>

                        <div className="flex gap-2 text-xs text-gray-500 mt-auto">
                            <span className="bg-black/30 px-2 py-1 rounded">{prog.university_city}</span>
                            <span className="bg-black/30 px-2 py-1 rounded">{prog.scholarship_rate > 0 ? `%${prog.scholarship_rate}` : 'Ücret/Devlet'}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

interface BadgeProps {
    children: React.ReactNode;
    color?: 'gray' | 'blue' | 'green';
}

const Badge = ({ children, color = 'gray' }: BadgeProps) => {
    const colors = {
        gray: "bg-gray-800 text-gray-300",
        blue: "bg-blue-900/30 text-blue-400",
        green: "bg-green-900/30 text-green-400"
    };
    return <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${colors[color]}`}>{children}</span>;
};

interface StatItemProps {
    label: string;
    value: string | number;
    highlight?: boolean;
}

const StatItem = ({ label, value, highlight }: StatItemProps) => (
    <div className={`p-3 rounded-lg border ${highlight ? 'bg-blue-900/20 border-blue-800' : 'bg-black/20 border-gray-800'}`}>
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div className={`font-mono font-bold ${highlight ? 'text-blue-400 text-lg' : 'text-gray-300'}`}>{value}</div>
    </div>
);