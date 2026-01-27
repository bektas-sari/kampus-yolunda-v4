"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import {
    MapPin, Phone, Mail, Globe, Users, GraduationCap,
    Award, PlayCircle, Star, Search, Filter, Home, Loader2,
    ArrowRight, ExternalLink, Coffee, X, Info, CheckCircle,
    Calendar, Languages, UserCheck, MessageCircle, ThumbsUp
} from "lucide-react";
import LeadModal from "@/components/LeadModal";
import ReviewModal from "@/components/ReviewModal";


const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kampus-backend-4wes.onrender.com/';

// --- TİP TANIMLAMALARI ---
interface Feature {
    name: string;
    icon: string;
}

interface Venue {
    id: number;
    name: string;
    venue_type: string;
    image: string | null;
    description: string;
    amenities?: string[];
    contact?: string;
    is_sponsored?: boolean; // Turuncu çerçeve için
    reviews: Review[]; // YENİ: Mekana ait yorumlar
    // description zaten yukarıda vardı, tekrar tanımlamaya gerek yok
    amenities_list?: string[];
    working_hours?: string;
}

interface Review {
    id: number;
    author_name: string;
    rating: number;
    comment: string;
    created_at: string;
    target_name?: string;
    target_type?: string;
}

interface Promotion {
    title: string;
    subtitle: string;
    description: string;
    image: string | null;
    button_text: string;
    button_link: string;
}

interface Department {
    id: number;
    name: string;
    program_code: string;
    faculty: string;
    score_type: string;
    quota: number;
    base_score: number | null;
    ranking: number | null;
    language?: string;
    duration?: number;
}

interface ConnectionItem {
    type: 'YURT' | 'EV';
    name: string;
    slug: string;
    city: string;
    district: string;
    price: number;
    cover_image: string | null;
    distance_text: string;
    is_partner: boolean;
    sub_tag: string;
}

interface UniversityDetail {
    id: number;
    name: string;
    slug: string;
    city: string;
    uni_type: string;
    founded_year: number;
    rector: string;
    student_count: number;
    academician_count: number;
    prof_count: number;
    doc_count: number;
    dr_count: number;
    education_language: string;
    video_url: string | null;
    description: string;
    website: string;
    phone: string;
    email: string;
    address: string;
    map_location: string;
    logo: string | null;
    cover_image: string | null;
    features: Feature[];
    gallery_images: { image: string }[];
    departments: Department[];
    dorm_connections: ConnectionItem[];
    venues: Venue[];
    promotion?: Promotion;
    reviews: Review[]; // Yorumlar listesi
}

function UniversityDetailContent() {
    const params = useParams();
    const slug = params.slug as string;

    const [uni, setUni] = useState<UniversityDetail | null>(null);
    const [loading, setLoading] = useState(true);
    // YENİ: varsayılan tab 'genel', ama 'reviews' da eklendi.
    const [activeTab, setActiveTab] = useState<'genel' | 'bolumler' | 'konaklama' | 'reviews'>('genel');
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    // YENİ: Yorum Modalı Hedef Bilgisi
    const [reviewTarget, setReviewTarget] = useState<{
        type: 'university' | 'dormitory' | 'venue',
        id: number,
        name: string
    } | null>(null);

    // Popup (Modal) State
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

    const [departmentSearch, setDepartmentSearch] = useState("");
    const [housingFilter, setHousingFilter] = useState<'all' | 'yurt' | 'ev'>('all');

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/universities/${slug}/`);
                setUni(res.data);
            } catch (error) {
                console.error("Üniversite detayı çekilemedi:", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchDetail();
    }, [slug]);

    const getImageUrl = (path: string | null) => {
        if (!path) return "/placeholder_cover.jpg";
        if (path.startsWith("http")) return path;
        return `${BACKEND_URL}${path}`;
    };

    // Yıldız Oluşturucu (Helper)
    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}
                    />
                ))}
            </div>
        );
    };

    const filteredDepartments = uni?.departments.filter(dept =>
        dept.name.toLowerCase().includes(departmentSearch.toLowerCase()) ||
        dept.program_code.includes(departmentSearch)
    );

    const filteredHousing = uni?.dorm_connections.filter(conn => {
        if (housingFilter === 'all') return true;
        if (housingFilter === 'yurt') return conn.type === 'YURT';
        if (housingFilter === 'ev') return conn.type === 'EV';
        return false;
    });

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#00ff88]">
            <Loader2 className="animate-spin mr-2" /> Yükleniyor...
        </div>
    );

    if (!uni) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Üniversite bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 pb-20">

            {/* --- HERO ALANI --- */}
            <div className="relative h-[50vh] min-h-[400px] w-full">
                <Image src={getImageUrl(uni.cover_image)} alt={uni.name} fill className="object-cover opacity-60" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full container mx-auto px-6 pb-10">
                    <div className="flex flex-col md:flex-row items-end gap-6">
                        <div className="w-32 h-32 bg-white rounded-2xl p-2 shadow-2xl shrink-0 border-4 border-[#0a0a0a]">
                            <img src={getImageUrl(uni.logo)} alt="logo" className="w-full h-full object-contain" />
                        </div>

                        <div className="flex-1 mb-2">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className="bg-[#00ff88] text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
                                    {uni.uni_type === 'DEVLET' ? 'Devlet Üniversitesi' : 'Vakıf Üniversitesi'}
                                </span>
                                <span className="bg-white/10 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-white/10">
                                    <MapPin size={12} /> {uni.city}
                                </span>
                                {uni.founded_year && (
                                    <span className="bg-white/10 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-white/10">
                                        <Calendar size={12} /> Kur: {uni.founded_year}
                                    </span>
                                )}
                                {uni.education_language && (
                                    <span className="bg-white/10 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-white/10">
                                        <Languages size={12} /> {uni.education_language}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
                                {uni.name}
                            </h1>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setIsLeadModalOpen(true)}
                                    className="bg-[#00ff88] hover:bg-[#00cc6a] text-black px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] flex items-center gap-2"
                                >
                                    <Mail size={18} /> Bilgi Al / İletişime Geç
                                </button>
                                {uni.website && (
                                    <a href={uni.website} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/10 flex items-center gap-2">
                                        <Globe size={18} /> Web Sitesi
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- İÇERİK ALANI --- */}
            <div className="container mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* SOL: Ana İçerik */}
                <div className="lg:col-span-8">

                    {/* SEKMELER */}
                    <div className="flex border-b border-white/10 mb-8 overflow-x-auto scrollbar-hide">
                        <button onClick={() => setActiveTab('genel')} className={`px-6 py-4 font-bold text-sm uppercase tracking-wide transition-colors whitespace-nowrap border-b-2 ${activeTab === 'genel' ? "border-[#00ff88] text-[#00ff88]" : "border-transparent text-gray-400 hover:text-white"}`}>Genel Bakış</button>
                        <button onClick={() => setActiveTab('bolumler')} className={`px-6 py-4 font-bold text-sm uppercase tracking-wide transition-colors whitespace-nowrap border-b-2 ${activeTab === 'bolumler' ? "border-[#00ff88] text-[#00ff88]" : "border-transparent text-gray-400 hover:text-white"}`}>Bölümler & Puanlar</button>
                        <button onClick={() => setActiveTab('konaklama')} className={`px-6 py-4 font-bold text-sm uppercase tracking-wide transition-colors whitespace-nowrap border-b-2 ${activeTab === 'konaklama' ? "border-[#00ff88] text-[#00ff88]" : "border-transparent text-gray-400 hover:text-white"}`}>Yurtlar & Konaklama</button>
                        {/* --- YENİ EKLENEN SEKME --- */}
                        <button onClick={() => setActiveTab('reviews')} className={`px-6 py-4 font-bold text-sm uppercase tracking-wide transition-colors whitespace-nowrap border-b-2 ${activeTab === 'reviews' ? "border-[#00ff88] text-[#00ff88]" : "border-transparent text-gray-400 hover:text-white"}`}>Öğrenci Yorumları</button>
                    </div>

                    {/* 1. GENEL BAKIŞ */}
                    {activeTab === 'genel' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                {uni.rector && (
                                    <div className="bg-[#111] p-3 rounded-xl border border-white/10 text-center col-span-2 md:col-span-3 lg:col-span-2 flex flex-col justify-center">
                                        <UserCheck className="mx-auto text-[#00ff88] mb-1" size={20} />
                                        <div className="text-sm font-bold text-white line-clamp-1">{uni.rector}</div>
                                        <div className="text-[10px] text-gray-500 uppercase">Rektör</div>
                                    </div>
                                )}
                                <div className="bg-[#111] p-3 rounded-xl border border-white/10 text-center">
                                    <Users className="mx-auto text-blue-400 mb-1" size={20} />
                                    <div className="text-lg font-bold text-white">{uni.student_count?.toLocaleString()}</div>
                                    <div className="text-[10px] text-gray-500 uppercase">Öğrenci</div>
                                </div>
                                <div className="bg-[#111] p-3 rounded-xl border border-white/10 text-center">
                                    <GraduationCap className="mx-auto text-purple-400 mb-1" size={20} />
                                    <div className="text-lg font-bold text-white">{uni.academician_count?.toLocaleString()}</div>
                                    <div className="text-[10px] text-gray-500 uppercase">Akademisyen</div>
                                </div>
                                <div className="bg-[#111] p-3 rounded-xl border border-white/10 text-center">
                                    <Award className="mx-auto text-yellow-400 mb-1" size={20} />
                                    <div className="text-lg font-bold text-white">{uni.prof_count}</div>
                                    <div className="text-[10px] text-gray-500 uppercase">Prof. Dr.</div>
                                </div>
                                <div className="bg-[#111] p-3 rounded-xl border border-white/10 text-center">
                                    <Award className="mx-auto text-orange-400 mb-1" size={20} />
                                    <div className="text-lg font-bold text-white">{uni.doc_count}</div>
                                    <div className="text-[10px] text-gray-500 uppercase">Doç. Dr.</div>
                                </div>
                            </div>

                            <div className="prose prose-invert max-w-none">
                                <h3 className="text-white font-bold text-xl mb-4">Üniversite Hakkında</h3>
                                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{uni.description || "Açıklama girilmemiş."}</p>
                            </div>

                            {uni.video_url && (
                                <div className="mt-8">
                                    <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                                        <PlayCircle className="text-[#00ff88]" /> Tanıtım Filmi
                                    </h3>
                                    <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
                                        <iframe src={uni.video_url.replace("watch?v=", "embed/")} className="w-full h-full" allowFullScreen title="Tanıtım Videosu" />
                                    </div>
                                </div>
                            )}

                            {uni.gallery_images && uni.gallery_images.length > 0 && (
                                <div className="mt-10 pt-10 border-t border-white/10">
                                    <h3 className="text-white font-bold text-xl mb-6">Kampüs Galerisi</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {uni.gallery_images.map((img, idx) => (
                                            <div key={idx} className="aspect-square relative rounded-xl overflow-hidden group border border-white/10">
                                                <Image src={getImageUrl(img.image)} alt={`Galeri ${idx}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. BÖLÜMLER & PUANLAR */}
                    {activeTab === 'bolumler' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <h3 className="text-white font-bold text-xl">Lisans & Önlisans Programları</h3>

                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Bölüm Ara..."
                                        className="bg-[#111] border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white focus:border-[#00ff88] outline-none w-full md:w-64 text-sm"
                                        value={departmentSearch}
                                        onChange={(e) => setDepartmentSearch(e.target.value)}
                                    />
                                    <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                </div>
                            </div>

                            {uni.departments && uni.departments.length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-white/10">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 text-gray-400 text-xs uppercase border-b border-white/10">
                                                <th className="p-4">Program Adı</th>
                                                <th className="p-4">Dil / Süre</th>
                                                <th className="p-4">Puan Türü</th>
                                                <th className="p-4">Kontenjan</th>
                                                <th className="p-4">Taban Puan</th>
                                                <th className="p-4">Sıralama</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm text-gray-300">
                                            {filteredDepartments?.map((dept) => (
                                                <tr key={dept.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="p-4 font-medium text-white">{dept.name}</td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] bg-white/10 px-1.5 rounded w-fit">{dept.language || 'Türkçe'}</span>
                                                            <span className="text-[10px] text-gray-500">{dept.duration ? `${dept.duration} Yıl` : '4 Yıl'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4"><span className="bg-white/10 px-2 py-1 rounded text-xs border border-white/10">{dept.score_type}</span></td>
                                                    <td className="p-4">{dept.quota}</td>
                                                    <td className="p-4 text-[#00ff88] font-bold">{dept.base_score || '-'}</td>
                                                    <td className="p-4">{dept.ranking ? dept.ranking.toLocaleString() : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredDepartments?.length === 0 && (
                                        <div className="p-8 text-center text-gray-500">Aradığınız kriterde bölüm bulunamadı.</div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">Henüz bölüm verisi girilmemiş.</p>
                            )}
                        </div>
                    )}

                    {/* 3. YURTLAR & KONAKLAMA */}
                    {activeTab === 'konaklama' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex items-center gap-4 mb-6 bg-[#111] p-2 rounded-xl border border-white/10 w-fit">
                                <button onClick={() => setHousingFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${housingFilter === 'all' ? 'bg-[#00ff88] text-black' : 'text-gray-400 hover:text-white'}`}>Tümü</button>
                                <button onClick={() => setHousingFilter('yurt')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${housingFilter === 'yurt' ? 'bg-[#00ff88] text-black' : 'text-gray-400 hover:text-white'}`}>Özel Yurtlar</button>
                                <button onClick={() => setHousingFilter('ev')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${housingFilter === 'ev' ? 'bg-[#00ff88] text-black' : 'text-gray-400 hover:text-white'}`}>Öğrenci Evleri</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredHousing && filteredHousing.length > 0 ? (
                                    filteredHousing.map((conn, idx) => (
                                        <Link href={conn.type === 'YURT' ? `/yurt/${conn.slug}` : `/ogrenci-evleri`} key={idx} className="group bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-[#00ff88] transition-all">
                                            <div className="h-44 relative">
                                                <Image src={getImageUrl(conn.cover_image)} alt={conn.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                                                {conn.is_partner && <div className="absolute top-2 right-2 bg-[#00ff88] text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1"><Star size={10} fill="black" /> ÖNERİLEN</div>}
                                                <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-[10px] font-bold text-white uppercase border border-white/20">{conn.sub_tag}</div>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-white mb-1 group-hover:text-[#00ff88] transition-colors line-clamp-1">{conn.name}</h4>
                                                <p className="text-xs text-gray-400 mb-3 flex items-center gap-1"><MapPin size={12} /> {conn.district}, {conn.city}</p>
                                                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-sm">
                                                    <span className="text-[#00ff88] font-bold">{conn.distance_text}</span>
                                                    <span className="text-white font-bold">{conn.price.toLocaleString()} ₺</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl"><Home className="mx-auto mb-2 opacity-50" size={32} />Bu kategoriye uygun konaklama seçeneği bulunamadı.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- 4. ÖĞRENCİ YORUMLARI (YENİ VE EKSİK OLAN KISIM) --- */}
                    {activeTab === 'reviews' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                                <div>
                                    <h3 className="text-white font-bold text-xl flex items-center gap-2">
                                        <MessageCircle className="text-[#00ff88]" /> Öğrenci Değerlendirmeleri
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1">Bu üniversite hakkında yapılan gerçek öğrenci yorumları.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setReviewTarget({ type: 'university', id: uni.id, name: uni.name });
                                        setIsReviewModalOpen(true);
                                    }}
                                    className="bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,136,0.2)] flex items-center gap-2"
                                >
                                    <Star size={16} className="fill-black" /> Puan Ver / Yorum Yap
                                </button>
                            </div>

                            {/* Yorumlar Listesi */}
                            {uni.reviews && uni.reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {uni.reviews.map((review) => (
                                        <div key={review.id} className="bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center font-bold text-white border border-white/10">
                                                        {review.author_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-bold text-sm">{review.author_name}</div>
                                                        <div className="text-gray-500 text-xs">
                                                            {review.target_type === 'campusvenue' ? (
                                                                <span className="text-[#00ff88]">Mekan Değerlendirmesi: {review.target_name}</span>
                                                            ) : 'Üniversite Değerlendirmesi'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 px-3 py-1 rounded-lg border border-white/5 flex items-center gap-1">
                                                    {renderStars(review.rating)}
                                                </div>
                                            </div>
                                            <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                                "{review.comment}"
                                            </p>
                                            <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                                <div className="text-xs text-gray-500">
                                                    {new Date(review.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                                <button className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                                                    <ThumbsUp size={12} /> Faydalı Buldum
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-[#111] rounded-2xl border border-dashed border-white/10">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageCircle className="text-gray-500" size={32} />
                                    </div>
                                    <h4 className="text-white font-bold text-lg mb-2">Henüz Yorum Yok</h4>
                                    <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                                        Bu üniversite hakkında henüz kimse deneyimini paylaşmamış. İlk yorumu yapan sen ol!
                                    </p>
                                    <button onClick={() => setIsReviewModalOpen(true)} className="text-[#00ff88] font-bold hover:underline">Yorum Bırak</button>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* SAĞ: Sidebar */}
                <div className="lg:col-span-4 space-y-6">

                    {/* --- 1. KAMPÜSE YAKIN YERLER (GÜNCELLENDİ: Turuncu Öne Çıkanlar & Popup) --- */}
                    {uni.venues && uni.venues.length > 0 && (
                        <div className="mb-6 animate-in slide-in-from-top-4 fade-in duration-500">
                            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <Coffee className="text-[#00ff88]" size={20} /> Kampüse Yakın Yerler
                            </h3>

                            {/* GRID YAPISI: Yan yana kutular */}
                            <div className="grid grid-cols-2 gap-3">
                                {uni.venues.map((venue) => (
                                    <div
                                        key={venue.id}
                                        onClick={() => setSelectedVenue(venue)}
                                        className={`
                                            group cursor-pointer relative aspect-square rounded-xl overflow-hidden transition-all shadow-lg
                                            ${venue.is_sponsored
                                                ? 'border-2 border-orange-500 shadow-orange-500/20'
                                                : 'border border-white/10 hover:border-[#00ff88]/50'}
                                        `}
                                    >
                                        {/* Arka Plan Görseli */}
                                        <Image
                                            src={getImageUrl(venue.image)}
                                            alt={venue.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                        {/* Öne Çıkan Badge */}
                                        {venue.is_sponsored && (
                                            <div className="absolute top-2 right-2 bg-orange-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 z-10">
                                                <Star size={8} fill="black" /> ÖNERİ MEKAN
                                            </div>
                                        )}

                                        {/* İçerik */}
                                        <div className="absolute bottom-0 left-0 p-3 w-full">
                                            <span className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 block ${venue.is_sponsored ? 'text-orange-400' : 'text-[#00ff88]'}`}>
                                                {venue.venue_type}
                                            </span>
                                            <h4 className="text-white font-bold text-sm leading-tight line-clamp-2 group-hover:text-white transition-colors">
                                                {venue.name}
                                            </h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- 2. ÖZEL REKLAM ALANI --- */}
                    {uni.promotion && (
                        <div className="relative overflow-hidden rounded-2xl border border-[#00ff88]/30 shadow-[0_0_30px_rgba(0,255,136,0.15)] group">
                            {uni.promotion.image ? (
                                <div className="absolute inset-0">
                                    <Image
                                        src={getImageUrl(uni.promotion.image)}
                                        alt="Promo"
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-[#004d29] to-black" />
                            )}

                            <div className="relative p-6 text-center">
                                <div className="inline-flex items-center gap-1 bg-[#00ff88] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-4 shadow-lg shadow-[#00ff88]/20 animate-pulse">
                                    <Star size={12} fill="black" /> Fırsat
                                </div>

                                <h3 className="text-2xl font-extrabold text-white mb-1 leading-tight">
                                    {uni.promotion.title}
                                </h3>

                                {uni.promotion.subtitle && (
                                    <p className="text-[#00ff88] font-bold text-sm mb-3">
                                        {uni.promotion.subtitle}
                                    </p>
                                )}

                                <p className="text-gray-300 text-sm mb-6 line-clamp-3">
                                    {uni.promotion.description}
                                </p>

                                <a
                                    href={uni.promotion.button_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-[#00ff88] transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                >
                                    {uni.promotion.button_text} <ArrowRight size={18} />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* --- 3. İLETİŞİM BİLGİLERİ (STICKY) --- */}
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 sticky top-24 z-10">
                        <h3 className="text-white font-bold text-lg mb-4">İletişim Bilgileri</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-gray-300"><MapPin className="text-[#00ff88] shrink-0" size={18} /><span>{uni.address}</span></li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><Phone className="text-[#00ff88] shrink-0" size={18} /><span>{uni.phone}</span></li>
                            <li className="flex items-center gap-3 text-sm text-gray-300"><Mail className="text-[#00ff88] shrink-0" size={18} /><span>{uni.email}</span></li>
                        </ul>
                        <button onClick={() => setIsLeadModalOpen(true)} className="w-full mt-6 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-all">Hemen Başvur</button>
                    </div>

                    {/* --- 4. HARİTA --- */}
                    <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden h-64 relative">
                        {uni.map_location && uni.map_location.startsWith("http") ? (
                            <iframe src={uni.map_location} width="100%" height="100%" style={{ border: 0 }} loading="lazy" title="Kampüs Haritası" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-2"><MapPin className="text-gray-500" /></div>
                                <p className="text-gray-500 text-sm mb-2">Harita yüklenemedi.</p>
                                {uni.map_location && <a href={uni.map_location} target="_blank" rel="noreferrer" className="text-[#00ff88] text-xs flex items-center gap-1 hover:underline">Haritada Gör <ExternalLink size={10} /></a>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <LeadModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} universityName={uni.name} sourceType="university" />

            {reviewTarget && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    targetName={reviewTarget.name}
                    targetType={reviewTarget.type}
                    targetId={reviewTarget.id}
                />
            )}

            {/* --- MEKAN DETAY MODALI (POPUP) --- */}
            {selectedVenue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-5xl overflow-hidden relative shadow-2xl flex flex-col md:flex-row h-[80vh] md:h-[600px]">

                        <button
                            onClick={() => setSelectedVenue(null)}
                            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-red-500/80 text-white p-2 rounded-full transition-colors backdrop-blur-md"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-full md:w-1/2 h-64 md:h-full relative bg-gray-900">
                            <Image
                                src={getImageUrl(selectedVenue.image)}
                                alt={selectedVenue.name}
                                fill
                                className="object-cover"
                            />
                            {/* Öne Çıkan Etiketi (Modal İçinde) */}
                            {selectedVenue.is_sponsored && (
                                <div className="absolute top-6 left-6 bg-orange-500 text-black text-xs font-black px-3 py-1 rounded shadow-lg flex items-center gap-1 z-10">
                                    <Star size={12} fill="black" /> KAMPÜS YOLUNDA ÖNERİSİ
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent md:hidden" />
                        </div>

                        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col h-full overflow-y-auto custom-scrollbar">
                            <div className="mb-6">
                                <span className={`font-bold text-xs uppercase tracking-widest border px-3 py-1 rounded-full ${selectedVenue.is_sponsored ? 'text-orange-500 border-orange-500/30' : 'text-[#00ff88] border-[#00ff88]/20'}`}>
                                    {selectedVenue.venue_type}
                                </span>
                                <h2 className="text-3xl font-extrabold text-white mt-3 leading-tight">
                                    {selectedVenue.name}
                                </h2>
                            </div>

                            <div className="prose prose-invert prose-sm mb-8">
                                <p className="text-gray-300 leading-relaxed text-base">
                                    {selectedVenue.description || "Kampüsün en popüler buluşma noktalarından biri. Kahvesi ve çalışma ortamıyla öğrenciler tarafından sıkça tercih ediliyor. Hem ders çalışmak hem de arkadaşlarınızla sosyalleşmek için harika bir atmosfer sunuyor."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-auto">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-white font-bold">
                                        <Coffee size={18} className="text-[#00ff88]" /> İmkanlar
                                    </div>
                                    <ul className="text-xs text-gray-400 space-y-1">
                                        {selectedVenue.amenities_list && selectedVenue.amenities_list.length > 0 ? (
                                            selectedVenue.amenities_list.map((item, i) => (
                                                <li key={i} className="flex items-center gap-2"><CheckCircle size={10} /> {item}</li>
                                            ))
                                        ) : (
                                            <>
                                                <li className="flex items-center gap-2"><CheckCircle size={10} /> Wi-Fi Erişimi</li>
                                                <li className="flex items-center gap-2"><CheckCircle size={10} /> Sosyal Alan</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2 text-white font-bold">
                                        <Info size={18} className="text-blue-400" /> Çalışma Saatleri
                                    </div>
                                    <p className="text-xs text-gray-400 whitespace-pre-line">
                                        {selectedVenue.working_hours || "Hafta İçi: 08:00 - 20:00\nHafta Sonu: 10:00 - 18:00"}
                                    </p>
                                </div>
                            </div>

                            {/* --- MEKAN DEĞERLENDİRMELERİ --- */}
                            <div className="mt-8 border-t border-white/10 pt-6">
                                <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                                    <MessageCircle size={16} className="text-[#00ff88]" /> Mekan Değerlendirmeleri
                                </h3>

                                {/* Yorumlar */}
                                <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                    {selectedVenue.reviews && selectedVenue.reviews.length > 0 ? (
                                        selectedVenue.reviews.map((review) => (
                                            <div key={review.id} className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-white font-bold text-xs">{review.author_name}</span>
                                                    <span className="text-[10px] text-gray-500">{review.created_at}</span>
                                                </div>
                                                {renderStars(review.rating)}
                                                <p className="text-gray-400 text-xs mt-1">{review.comment}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">Henüz değerlendirme yapılmamış.</p>
                                    )}
                                </div>

                                {/* Değerlendir Butonu */}
                                <button
                                    onClick={() => {
                                        setReviewTarget({ type: 'venue', id: selectedVenue.id, name: selectedVenue.name });
                                        setIsReviewModalOpen(true);
                                    }}
                                    className="w-full bg-[#111] hover:bg-[#222] border border-[#00ff88]/30 text-[#00ff88] text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Star size={14} /> Bu Mekanı Değerlendir
                                </button>
                            </div>

                            <button className="mt-6 w-full bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                                <MapPin size={18} /> Konumu Göster
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- ANA SAYFA (Suspense Koruması ile) ---
export default function UniversityDetailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin mb-4 text-[#00ff88]" size={48} />
                <p className="text-gray-500">Üniversite Detayı Yükleniyor...</p>
            </div>
        }>
            <UniversityDetailContent />
        </Suspense>
    );
}