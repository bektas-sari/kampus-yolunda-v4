"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import * as LucideIcons from "lucide-react";

// --- TİP TANIMLAMALARI ---
interface Feature {
    name: string;
    icon: string;
}

interface GalleryImage {
    image: string;
}

interface NearbyUni {
    university_name: string;
    university_slug: string;
    distance_text: string;
}

interface Dormitory {
    id: number;
    name: string;
    slug: string;
    dorm_type: string;
    city: string;
    district: string;
    address: string;
    price: number;
    capacity: number;
    description: string;
    phone: string;
    email: string;
    website: string;
    logo_url: string | null;
    cover_image_url: string | null;
    features: Feature[];
    gallery_images: GalleryImage[];
    nearby_universities: NearbyUni[];
}

// --- DİNAMİK İKON ---
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    const IconComponent = (LucideIcons as any)[name];
    return IconComponent ? <IconComponent className={className} /> : <LucideIcons.CheckCircle2 className={className} />;
};

// --- KRİTİK DÜZELTME: RESİM URL YÖNETİCİSİ ---
const getImageUrl = (path: string | null) => {
    // 1. Resim yoksa sağlam bir placeholder dön
    if (!path) return "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop";

    // 2. Eğer link zaten tam ise (http ile başlıyorsa) dokunma
    if (path.startsWith("http")) return path;

    // 3. Eğer backend'den gelen relative path ise (/media/...) başına localhost ekle
    return `http://127.0.0.1:8000${path}`;
};

import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// ... existing imports ...

export default function DormitoryDetailPage() {
    const params = useParams();
    const slug = params.slug;
    const router = useRouter();
    const { user } = useAuth();

    const [data, setData] = useState<Dormitory | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!slug) return;
            try {
                // 1. Yurt Datası
                let dormData = null;
                const detailRes = await fetch(`http://127.0.0.1:8000/api/dormitories/${slug}/`);

                if (!detailRes.ok) {
                    const listRes = await fetch(`http://127.0.0.1:8000/api/dormitories/?slug=${slug}`);
                    const listData = await listRes.json();
                    if (listData && listData.length > 0) {
                        dormData = listData[0];
                    } else {
                        throw new Error("Yurt bulunamadı");
                    }
                } else {
                    dormData = await detailRes.json();
                }
                setData(dormData);

                // 2. Favori Durumu (Eğer giriş yapmışsa)
                const token = localStorage.getItem('access');
                if (token && dormData) {
                    try {
                        const favRes = await axios.get('http://127.0.0.1:8000/api/favorites/dormitories/', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const isFavorited = favRes.data.some((fav: any) => fav.dormitory.id === dormData.id);
                        setIsLiked(isFavorited);
                    } catch (err: any) {
                        if (err.response && err.response.status === 401) {
                            // Token expired - silent fail
                            console.warn("Session expired for favorites check");
                        } else {
                            console.error("Favorite check error:", err);
                        }
                    }
                }

            } catch (error) {
                console.error("Veri çekme hatası:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [slug]);

    const toggleFavorite = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (!data) return;

        setLikeLoading(true);
        const token = localStorage.getItem('access');

        try {
            const res = await axios.post('http://127.0.0.1:8000/api/favorites/dormitories/toggle/',
                { dormitory_id: data.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsLiked(res.data.liked);
        } catch (error) {
            console.error("Favori işlemi hatası:", error);
            alert("Favorilere eklenirken bir hata oluştu.");
        } finally {
            setLikeLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">Yükleniyor...</div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">Yurt bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans pb-24">

            {/* --- HERO SECTION --- */}
            <div className="relative w-full h-[50vh] md:h-[60vh] bg-gray-900">
                <img
                    src={getImageUrl(data.cover_image_url)}
                    className="w-full h-full object-cover opacity-80"
                    alt={data.name}
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0a] via-black/20 to-transparent" />

                <Link href={`/yurtlar`} className="absolute top-6 left-6 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10">
                    <LucideIcons.ArrowLeft size={24} />
                </Link>

                {/* Title & Favorite Button */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 container mx-auto">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${data.dorm_type === 'KIZ' ? 'bg-pink-500/80 text-white' :
                                data.dorm_type === 'ERKEK' ? 'bg-blue-500/80 text-white' : 'bg-purple-500/80 text-white'
                            }`}>
                            {data.dorm_type} YURDU
                        </span>
                        <span className="bg-black/60 text-gray-200 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                            <LucideIcons.MapPin size={12} /> {data.district}, {data.city}
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white shadow-black drop-shadow-lg">{data.name}</h1>

                        {/* FAVORITE BUTTON */}
                        <button
                            onClick={toggleFavorite}
                            disabled={likeLoading}
                            className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 md:px-5 md:py-3 rounded-full transition-all border border-white/10 active:scale-95"
                        >
                            <LucideIcons.Heart
                                className={`w-6 h-6 transition-all ${isLiked ? "fill-red-500 text-red-500" : "text-white group-hover:text-red-400"}`}
                            />
                            <span className="hidden md:inline font-bold text-sm text-white">
                                {isLiked ? 'Listemde' : 'Listeme Ekle'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- ANA İÇERİK --- */}
            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* SOL KOLON (Detaylar) */}
                <div className="lg:col-span-2 space-y-12">

                    {/* 1. KISIM: YAKIN ÜNİVERSİTELER */}
                    {data.nearby_universities.length > 0 && (
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <LucideIcons.Navigation className="text-[#00ff88]" size={20} />
                                Üniversitelere Mesafeler
                            </h3>
                            <div className="space-y-3">
                                {data.nearby_universities.map((uni, idx) => (
                                    <Link key={idx} href={`/universite/${uni.university_slug}`} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                                        <span className="font-medium text-gray-200 group-hover:text-white">{uni.university_name}</span>
                                        <span className="text-[#00ff88] font-bold text-sm bg-[#00ff88]/10 px-2 py-1 rounded">{uni.distance_text}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. KISIM: AÇIKLAMA */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Hakkında</h3>
                        <div className="text-gray-400 leading-relaxed space-y-4 text-lg">
                            {data.description}
                        </div>
                    </div>

                    {/* 3. KISIM: FOTOĞRAF GALERİSİ (İstediğin Yer: Özelliklerin Üstü) */}
                    {data.gallery_images && data.gallery_images.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <LucideIcons.Image className="text-yellow-500" /> Galeri
                            </h3>
                            {/* Grid Galeri */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {/* Kapak fotoğrafını da galeriye dahil edelim */}
                                {data.cover_image_url && (
                                    <div className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group">
                                        <img
                                            src={getImageUrl(data.cover_image_url)}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            alt="Kapak"
                                        />
                                    </div>
                                )}
                                {/* Diğer fotoğraflar */}
                                {data.gallery_images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group border border-white/10 hover:border-white/30 transition-all">
                                        <img
                                            src={getImageUrl(img.image)}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            alt={`Galeri ${idx}`}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. KISIM: YURT OLANAKLARI */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <LucideIcons.Sparkles className="text-[#00ff88]" /> Yurt Olanakları
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {data.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-[#111] p-3 rounded-lg border border-white/5 hover:border-white/20 transition-colors">
                                    <DynamicIcon name={feature.icon} className="text-gray-500 w-5 h-5" />
                                    <span className="text-sm text-gray-300">{feature.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* SAĞ KOLON (Desktop Sticky Card) */}
                <div className="hidden lg:block space-y-6">
                    <div className="bg-[#111] border border-white/10 rounded-3xl p-6 sticky top-24 shadow-2xl">
                        <div className="text-gray-400 text-sm mb-1">Başlangıç Fiyatı</div>
                        <div className="text-4xl font-bold text-white mb-6">
                            {data.price.toLocaleString()} <span className="text-lg text-gray-500 font-normal">₺ / Yıllık</span>
                        </div>

                        <div className="space-y-3">
                            <a
                                href={`https://wa.me/${data.phone?.replace(/\s/g, '')}?text=Merhaba, ${data.name} hakkında bilgi almak istiyorum.`}
                                target="_blank"
                                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold py-4 rounded-xl transition-transform hover:scale-105 shadow-[0_0_20px_rgba(37,211,102,0.2)]"
                            >
                                <LucideIcons.MessageCircle size={20} /> WhatsApp'tan Yaz
                            </a>
                            <a
                                href={`tel:${data.phone}`}
                                className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-200 text-black font-bold py-4 rounded-xl transition-colors"
                            >
                                <LucideIcons.Phone size={20} /> Hemen Ara
                            </a>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10 text-center">
                            <p className="text-gray-500 text-xs mb-2">Kontenjan durumu anlık değişebilir.</p>
                            <div className="inline-flex items-center gap-2 text-[#00ff88] text-sm font-bold bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/20">
                                <LucideIcons.ShieldCheck size={14} /> Kampüs Yolunda Onaylı
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- MOBİL STICKY BAR --- */}
            <div className="fixed bottom-0 left-0 w-full bg-[#111]/90 backdrop-blur-md border-t border-white/10 p-4 lg:hidden flex gap-4 items-center z-50 safe-area-bottom">
                <div className="flex-1">
                    <div className="text-xs text-gray-400">Yıllık Fiyat</div>
                    <div className="text-xl font-bold text-white">{data.price.toLocaleString()} ₺</div>
                </div>
                <a
                    href={`https://wa.me/${data.phone?.replace(/\s/g, '')}`}
                    target="_blank"
                    className="bg-[#25D366] text-black p-3 rounded-full shadow-lg"
                >
                    <LucideIcons.MessageCircle size={24} />
                </a>
                <a
                    href={`tel:${data.phone}`}
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm shadow-lg"
                >
                    HEMEN ARA
                </a>
            </div>

        </div>
    );
}