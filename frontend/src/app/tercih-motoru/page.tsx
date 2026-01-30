"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MapPin, ChevronRight, TrendingUp, Anchor, AlertCircle, Loader2, Sparkles, MessageSquareQuote, ChevronDown, ChevronUp } from "lucide-react";
import UniversityRadarChart from "@/components/UniversityRadarChart";

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
    university_name: string;
    university_slug: string;
    university_city?: string;
    university_logo: string | null;
    university_stats?: {
        academic_score: number;
        campus_score: number;
        social_score: number;
        career_score: number;
        tech_score: number;
        city_score: number;
    };
}

interface AnalysisResult {
    surprise_choices: Program[];
    ideal_choices: Program[];
    safe_choices: Program[];
}

// --- PUAN TÜRÜ SEÇENEKLERİ (Tercüman Katmanı) ---
// Backend'in anladığı dil (value) ile kullanıcının gördüğü dil (label) burada eşleşiyor.
const SCORE_OPTIONS = [
    { label: "SAYISAL (SAY)", value: "SAY" },
    { label: "EŞİT AĞIRLIK (EA)", value: "EA" },
    { label: "SÖZEL (SÖZ)", value: "SOZ" },
    { label: "DİL (DİL)", value: "DIL" },
    { label: "TYT (2 Yıllık)", value: "TYT" } // Backend modelinde var, eklendi.
];

// --- AUTOCOMPLETE COMPONENT ---
interface AutocompleteProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
    options: string[];
}

const AutocompleteInput = ({ label, placeholder, value, onChange, options }: AutocompleteProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!value) {
            setFilteredOptions([]);
            return;
        }
        const search = value.toLocaleLowerCase('tr');
        const matches = options.filter(item =>
            item.toLocaleLowerCase('tr').includes(search)
        );
        setFilteredOptions(matches.slice(0, 10));
    }, [value, options]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="space-y-1 relative" ref={wrapperRef}>
            <label className="text-[10px] font-bold text-gray-500 uppercase">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => value && setIsOpen(true)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                />
                {isOpen && filteredOptions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-[#1a1c2e] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        <ul className="py-1">
                            {filteredOptions.map((option, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSelect(option)}
                                    className="px-3 py-2 text-sm text-gray-300 hover:bg-white/10 cursor-pointer transition-colors"
                                >
                                    {option}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- ANA İÇERİK BİLEŞENİ (Export Default DEĞİL) ---
function TercihMotoruContent() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<AnalysisResult | null>(null);

    // Form State
    const [ranking, setRanking] = useState("");
    const [scoreType, setScoreType] = useState("SAY");
    const [cityFilter, setCityFilter] = useState("");
    const [deptFilter, setDeptFilter] = useState("");
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [availableDepts, setAvailableDepts] = useState<string[]>([]);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
                const res = await fetch(`${API_URL}/api/filters/`);
                if (res.ok) {
                    const data = await res.json();
                    setAvailableCities(data.cities || []);
                    setAvailableDepts(data.departments || []);
                }
            } catch (err) { console.error(err); }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const urlRanking = searchParams.get('ranking');
        const urlScoreType = searchParams.get('scoreType');
        const urlCity = searchParams.get('city');
        const urlDept = searchParams.get('dept');

        if (urlRanking) {
            setRanking(urlRanking);
            if (urlScoreType) setScoreType(urlScoreType);
            if (urlCity) setCityFilter(urlCity);
            if (urlDept) setDeptFilter(urlDept);
            if (!results) performAnalysis(urlRanking, urlScoreType || 'SAY', urlCity || '', urlDept || '');
        }
    }, [searchParams]);

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

    const performAnalysis = async (rnk: string, sType: string, city: string, dept: string) => {
        if (!rnk) return;
        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const res = await fetch(`${API_URL}/api/tercih-motoru/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student_ranking: parseInt(rnk),
                    score_type: sType, // Burası artık "SOZ", "SAY" gibi temiz kodlar gönderiyor
                    city_filter: city ? [city] : [],
                    department_filter: dept ? [dept] : [],
                }),
            });
            if (!res.ok) throw new Error("Analiz hatası");
            const data = await res.json();
            setResults(data);
            setTimeout(() => {
                const resultElement = document.getElementById('results-section');
                if (resultElement) resultElement.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleAnalyze = async () => {
        if (!ranking) return;
        performAnalysis(ranking, scoreType, cityFilter, deptFilter);
        const params = new URLSearchParams(searchParams.toString());
        params.set('ranking', ranking);
        params.set('scoreType', scoreType);
        if (cityFilter) params.set('city', cityFilter); else params.delete('city');
        if (deptFilter) params.set('dept', deptFilter); else params.delete('dept');
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // --- GENİŞLEYEBİLEN KART (EXPANDABLE CARD) ---
    const ProgramCard = ({ program, type }: { program: Program, type: 'surprise' | 'ideal' | 'safe' }) => {
        const [isOpen, setIsOpen] = useState(false);
        const uniName = program.university_name || program.university?.name || "Bilinmeyen Üniversite";
        const uniCity = program.university_city || program.university?.city || "";
        const uniSlug = program.university_slug || program.university?.slug || "#";
        const uniLogo = program.university_logo || program.university?.logo || null;
        const probability = calculateProbability(parseInt(ranking), program.ranking);

        const styles = {
            surprise: { border: "border-orange-500/30", bg: "bg-orange-500/5", text: "text-orange-400", label: "Yüksek Hedef", icon: TrendingUp },
            ideal: { border: "border-blue-500/30", bg: "bg-blue-500/5", text: "text-blue-400", label: "İdeal Tercih", icon: AlertCircle },
            safe: { border: "border-green-500/30", bg: "bg-green-500/5", text: "text-green-400", label: "Güvenli Liman", icon: Anchor },
        }[type];

        const Icon = styles.icon;

        return (
            <div className={`group relative bg-[#0a0a0a] border ${styles.border} rounded-xl overflow-hidden mb-3 transition-all duration-300 ${isOpen ? 'ring-1 ring-white/10 bg-white/[0.02]' : 'hover:bg-white/[0.02]'}`}>

                {/* 1. HEADER - HER ZAMAN GÖRÜNÜR - TIKLANABİLİR */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-5 cursor-pointer flex items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4 overflow-hidden">
                        {/* Sol İkon / Logo */}
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${styles.bg} border border-white/5 flex items-center justify-center shrink-0`}>
                            {program.university_logo ? (
                                <img src={program.university_logo} alt={uniName} className="w-8 h-8 object-contain" />
                            ) : (
                                <span className={`text-xs font-bold ${styles.text}`}>{uniName.substring(0, 2)}</span>
                            )}
                        </div>

                        {/* Orta Bilgiler */}
                        <div className="min-w-0">
                            <h3 className="text-white font-bold text-sm md:text-base truncate group-hover:text-blue-400 transition-colors">
                                {program.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                <span className="truncate max-w-[150px] md:max-w-none">{uniName}</span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full shrink-0"></span>
                                <span className="flex items-center gap-1 shrink-0"><MapPin className="w-3 h-3" /> {uniCity}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sağ Taraf - İhtimal ve Ok */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                            <div className={`text-sm font-bold ${styles.text}`}>%{probability}</div>
                            <div className="text-[10px] text-gray-500">Kazanma İhtimali</div>
                        </div>
                        {/* Mobilde İhtimal Yuvarlağı */}
                        <div className={`sm:hidden w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${probability > 80 ? 'border-green-500 text-green-500' : 'border-blue-500 text-blue-500'}`}>
                            %{probability}
                        </div>

                        <div className={`p-1.5 rounded-full bg-white/5 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-white/10' : ''}`}>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* 2. BODY - DETAYLAR VE GRAFİK - SADECE AÇIKKEN GÖRÜNÜR */}
                {isOpen && (
                    <div className="border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-col md:flex-row">

                            {/* SOL TARAF: SAYISAL VERİLER */}
                            <div className="w-full md:w-7/12 p-5 bg-black/20 space-y-5">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="text-[10px] text-gray-500 uppercase mb-1">Başarı Sıralaması</div>
                                        <div className="text-sm font-bold text-white">#{program.ranking?.toLocaleString('tr-TR')}</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="text-[10px] text-gray-500 uppercase mb-1">Taban Puan</div>
                                        <div className="text-sm font-bold text-blue-400">{program.points || "---"}</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="text-[10px] text-gray-500 uppercase mb-1">Kontenjan</div>
                                        <div className="text-sm font-bold text-white">{program.quota}</div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="text-[10px] text-gray-500 uppercase mb-1">Puan Türü</div>
                                        <div className="text-sm font-bold text-white">{program.score_type}</div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="text-[10px] text-gray-500 mb-2">Fakülte / Eğitim Türü</div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 border border-white/5">{program.faculty}</span>
                                        <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 border border-white/5">{program.education_type}</span>
                                    </div>
                                </div>

                                <Link href={`/universite/${program.university_slug}`} className="block w-full py-3 mt-2 bg-blue-600 hover:bg-blue-500 text-white text-center rounded-lg text-sm font-bold transition-colors">
                                    Üniversiteyi Detaylı İncele
                                </Link>
                            </div>

                            {/* SAĞ TARAF: RADAR GRAFİĞİ */}
                            <div className="w-full md:w-5/12 p-4 bg-white/[0.02] md:border-l border-white/5 flex flex-col items-center justify-center relative">
                                <div className="absolute top-2 right-2 px-2 py-1 bg-purple-500/10 text-purple-300 text-[9px] rounded border border-purple-500/20 font-bold uppercase tracking-wider">
                                    TÜMA Analizi
                                </div>
                                <div className="w-full max-w-[280px] h-[260px]">
                                    <UniversityRadarChart stats={program.university_stats} />
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        );
    };

    const generateAICommentary = () => {
        if (!results || !ranking) return null;
        const total = results.surprise_choices.length + results.ideal_choices.length + results.safe_choices.length;
        if (total === 0) return null;
        return (
            <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-2xl p-6 mb-10 flex gap-5 items-start">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 shrink-0 hidden sm:block">
                    <MessageSquareQuote className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-blue-200 font-bold text-lg mb-2">Yapay Zeka Analiz Özeti</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        Sıralamanız ({parseInt(ranking).toLocaleString()}) baz alındığında, sistem sizin için <strong className="text-white">{total} farklı program</strong> belirledi.
                        Listede {results.surprise_choices.length > 0 && "motivasyonunuzu artıracak yüksek hedefler,"}
                        {results.ideal_choices.length > 0 && " tam potansiyelinizi yansıtan ideal tercihler"}
                        {results.safe_choices.length > 0 && " ve yerleşmenizi garanti altına alacak güvenli limanlar"} dengeli bir şekilde dağıtılmıştır.
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-20 font-sans selection:bg-blue-500/30">
            <div className="pt-28 pb-8 px-4 text-center">
                <div className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span className="text-xs font-bold tracking-wide uppercase">Beta v2.2</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                    Yapay Zeka <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Tercih Motoru</span>
                </h1>
                <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">Algı mühendisliği ile güçlendirilmiş tercih algoritması.</p>
            </div>

            <div className="max-w-5xl mx-auto px-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Sıralaman</label>
                            <input type="number" placeholder="Örn: 50000" value={ranking} onChange={(e) => setRanking(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Puan Türü</label>
                            <select value={scoreType} onChange={(e) => setScoreType(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:border-blue-500 outline-none appearance-none transition-colors">
                                {/* DÜZELTME: Seçenekleri temiz ve doğru value'larla map ediyoruz */}
                                {SCORE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <AutocompleteInput label="Şehir" placeholder="İstanbul..." value={cityFilter} onChange={setCityFilter} options={availableCities} />
                        <AutocompleteInput label="Bölüm" placeholder="Bilgisayar..." value={deptFilter} onChange={setDeptFilter} options={availableDepts} />
                    </div>
                    <button onClick={handleAnalyze} disabled={loading || !ranking} className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                        {loading ? "Analiz Ediliyor..." : "Analizi Başlat"}
                    </button>
                </div>
            </div>

            {results && (
                <div id="results-section" className="max-w-4xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-10 duration-700">
                    {generateAICommentary()}
                    <div className="space-y-12">
                        {results.surprise_choices.length > 0 && <section><h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2"><TrendingUp className="w-6 h-6" /> Yüksek Hedefler</h2>{results.surprise_choices.map(prog => <ProgramCard key={prog.id} program={prog} type="surprise" />)}</section>}
                        {results.ideal_choices.length > 0 && <section><h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2"><AlertCircle className="w-6 h-6" /> İdeal Tercihler</h2>{results.ideal_choices.map(prog => <ProgramCard key={prog.id} program={prog} type="ideal" />)}</section>}
                        {results.safe_choices.length > 0 && <section><h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2"><Anchor className="w-6 h-6" /> Güvenli Liman</h2>{results.safe_choices.map(prog => <ProgramCard key={prog.id} program={prog} type="safe" />)}</section>}
                        {(results.surprise_choices.length === 0 && results.ideal_choices.length === 0 && results.safe_choices.length === 0) && <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10"><AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" /><h3 className="text-xl font-bold text-white">Sonuç Bulunamadı</h3></div>}
                    </div>
                </div>
            )}
        </div>
    );
}

// --- BUILD HATASINI ÇÖZEN KAPSAYICI (Default Export) ---
export default function TercihMotoruPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>}>
            <TercihMotoruContent />
        </Suspense>
    );
}