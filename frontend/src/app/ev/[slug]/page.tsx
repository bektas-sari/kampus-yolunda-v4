'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Heart, Loader2 } from 'lucide-react';

// --- TİP TANIMLAMALARI ---
interface Feature {
    name: string;
    icon: string;
}

interface GalleryImage {
    image: string;
}

interface StudentHouse {
    id: number;
    title: string;
    slug: string;
    room_count: string;
    city: string;
    district: string;
    price: number;
    description: string;
    contact_phone: string;
    square_meters: number | null;
    is_furnished: boolean;
    cover_image: string | null;
    features: Feature[];
    gallery_images: GalleryImage[];
}

// --- DİNAMİK İKON ---
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    const IconComponent = (LucideIcons as any)[name];
    return IconComponent ? <IconComponent className={className} /> : <LucideIcons.CheckCircle2 className={className} />;
};

// --- URL DÜZELTİCİ ---
const getImageUrl = (path: string | null) => {
    if (!path) return "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop";
    if (path.startsWith("http")) return path;
    return `http://127.0.0.1:8000${path}`;
};

export default function StudentHouseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    // Slug'ı params'tan güvenli bir şekilde al
    const slug = params?.slug as string;

    const [data, setData] = useState<StudentHouse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) return;

            try {
                // 1. Ev Detayını Çek
                const response = await axios.get(`http://127.0.0.1:8000/api/houses/${slug}/`);
                const houseData = response.data;
                setData(houseData);

                // 2. Kullanıcı giriş yapmışsa favori durumunu kontrol et
                const token = localStorage.getItem('access');
                // user true ise ve token varsa kontrol et
                if (user && token && houseData.id) {
                    try {
                        const favResponse = await axios.get('http://127.0.0.1:8000/api/favorites/', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const favorites = favResponse.data;
                        // Backend'den dönen listede bu ev var mı?
                        const isFavorited = favorites.some((fav: any) => fav.student_house.id === houseData.id);
                        setIsLiked(isFavorited);
                        setIsLiked(isFavorited);
                    } catch (err: any) {
                        if (err.response && err.response.status === 401) {
                            console.warn("Oturum süresi dolmuş. Favori durumu çekilemedi.");
                        } else {
                            console.error("Favori kontrolü hatası:", err);
                        }
                    }
                }

            } catch (error) {
                console.error("Veri çekme hatası:", error);

                // Fallback: Slug ile detay endpoint'i çalışmazsa listeyi tara (Eski Yöntem)
                try {
                    const listRes = await axios.get(`http://127.0.0.1:8000/api/houses/?slug=${slug}`);
                    if (listRes.data && listRes.data.length > 0) {
                        setData(listRes.data[0]);
                    }
                } catch (fallbackError) {
                    console.error("Fallback veri çekme hatası:", fallbackError);
                }
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchData();
        }
    }, [slug, user, authLoading]);

    const toggleFavorite = async () => {
        if (!user) {
            // Giriş yapmamışsa login'e yönlendir
            router.push('/login');
            return;
        }

        const token = localStorage.getItem('access');
        if (!token) return;

        try {
            // Optimistic Update: Hemen arayüzü güncelle
            const previousState = isLiked;
            setIsLiked(!isLiked);

            const response = await axios.post('http://127.0.0.1:8000/api/favorites/toggle/',
                { student_house_id: data?.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Backend yanıtı ile senkronize et (Gerekirse)
            if (response.data.liked !== !previousState) {
                setIsLiked(response.data.liked);
            }

        } catch (error) {
            console.error("Favori işlem hatası:", error);
            // Hata olursa geri al
            setIsLiked(!isLiked);
        }
    };

    if (loading) return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
            <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
    );

    if (!data) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">İlan bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans pb-24">

            {/* KAPAK GÖRSELİ */}
            <div className="relative w-full h-[50vh] md:h-[60vh] bg-gray-900">
                {data.cover_image ? (
                    <img
                        src={getImageUrl(data.cover_image)}
                        className="w-full h-full object-cover opacity-80"
                        alt={data.title}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">Görsel Yok</div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/20 to-transparent" />

                {/* Geri Butonu */}
                <Link href={`/yurtlar`} className="absolute top-24 left-6 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10">
                    <LucideIcons.ArrowLeft size={24} />
                </Link>

                {/* Başlık Alanı */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 container mx-auto">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-blue-600/80 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                            {data.room_count}
                        </span>
                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1 backdrop-blur-md ${data.is_furnished ? 'bg-[#00ff88]' : 'bg-gray-300'}`}>
                            {data.is_furnished ? <><LucideIcons.Armchair size={12} /> EŞYALI</> : 'BOŞ DAİRE'}
                        </span>
                        <span className="bg-black/60 text-gray-200 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                            <MapPin size={12} /> {data.district}, {data.city}
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-2 leading-tight">
                                {data.title}
                            </h1>
                            <div className="flex items-center gap-2 text-gray-300 text-lg">
                                <MapPin size={20} className="text-blue-500" />
                                {data.district}, {data.city}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-3xl font-bold text-green-400">
                                    {data.price.toLocaleString()} ₺
                                </div>
                                <div className="text-gray-400 text-sm">Aylık Kira</div>
                            </div>

                            {/* FAVORİ BUTONU */}
                            <button
                                onClick={toggleFavorite}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/10 transition-all active:scale-95 group"
                            >
                                <Heart
                                    size={28}
                                    className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white group-hover:text-red-400'}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ANA İÇERİK --- */}
            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* SOL KOLON (Detaylar) */}
                <div className="lg:col-span-2 space-y-12">

                    {/* 1. KISIM: HIZLI BAKIŞ */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#111] p-4 rounded-2xl border border-white/10 text-center">
                            <div className="text-gray-500 text-xs uppercase font-bold mb-1">Oda Sayısı</div>
                            <div className="text-white text-xl font-bold">{data.room_count}</div>
                        </div>
                        <div className="bg-[#111] p-4 rounded-2xl border border-white/10 text-center">
                            <div className="text-gray-500 text-xs uppercase font-bold mb-1">Büyüklük</div>
                            <div className="text-white text-xl font-bold">{data.square_meters ? `${data.square_meters} m²` : '-'}</div>
                        </div>
                        <div className="bg-[#111] p-4 rounded-2xl border border-white/10 text-center">
                            <div className="text-gray-500 text-xs uppercase font-bold mb-1">Durumu</div>
                            <div className="text-white text-xl font-bold">{data.is_furnished ? 'Eşyalı' : 'Boş'}</div>
                        </div>
                    </div>

                    {/* 2. KISIM: AÇIKLAMA */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">İlan Detayı</h3>
                        <div className="text-gray-400 leading-relaxed space-y-4 text-lg">
                            {data.description}
                        </div>
                    </div>

                    {/* 3. KISIM: GALERİ */}
                    {data.gallery_images && data.gallery_images.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <LucideIcons.Image className="text-blue-500" /> Daire Fotoğrafları
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {/* Kapak fotosu */}
                                {data.cover_image && (
                                    <div className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group">
                                        <img src={getImageUrl(data.cover_image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Kapak" />
                                    </div>
                                )}
                                {/* Diğerleri */}
                                {data.gallery_images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-white/10">
                                        <img src={getImageUrl(img.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Galeri ${idx}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. KISIM: ÖZELLİKLER */}
                    {data.features && data.features.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <LucideIcons.Sparkles className="text-blue-500" /> Olanaklar
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {data.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-[#111] p-3 rounded-lg border border-white/5">
                                        <DynamicIcon name={feature.icon} className="text-gray-500 w-5 h-5" />
                                        <span className="text-sm text-gray-300">{feature.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* SAĞ KOLON (STICKY FİYAT & İLETİŞİM) */}
                <div className="hidden lg:block space-y-6">
                    <div className="bg-[#111] border border-white/10 rounded-3xl p-6 sticky top-24 shadow-2xl">
                        <div className="text-gray-400 text-sm mb-1">Aylık Kira</div>
                        <div className="text-4xl font-bold text-white mb-6">
                            {data.price.toLocaleString()} <span className="text-lg text-gray-500 font-normal">₺</span>
                        </div>

                        <div className="space-y-3">
                            <a
                                href={`https://wa.me/${data.contact_phone?.replace(/\s/g, '')}?text=Merhaba, ${data.title} ilanınız için yazıyorum.`}
                                target="_blank"
                                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold py-4 rounded-xl transition-transform hover:scale-105 shadow-[0_0_20px_rgba(37,211,102,0.2)]"
                            >
                                <LucideIcons.MessageCircle size={20} /> WhatsApp'tan Yaz
                            </a>
                            <a
                                href={`tel:${data.contact_phone}`}
                                className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-200 text-black font-bold py-4 rounded-xl transition-colors"
                            >
                                <LucideIcons.Phone size={20} /> İlan Sahibini Ara
                            </a>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10 text-center">
                            <div className="inline-flex items-center gap-2 text-blue-400 text-sm font-bold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                                <LucideIcons.ShieldCheck size={14} /> Öğrenci Dostu İlan
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- MOBİL STICKY BAR --- */}
            <div className="fixed bottom-0 left-0 w-full bg-[#111]/90 backdrop-blur-md border-t border-white/10 p-4 lg:hidden flex gap-4 items-center z-50 safe-area-bottom">
                <div className="flex-1">
                    <div className="text-xs text-gray-400">Aylık Kira</div>
                    <div className="text-xl font-bold text-white">{data.price.toLocaleString()} ₺</div>
                </div>
                <a
                    href={`https://wa.me/${data.contact_phone?.replace(/\s/g, '')}`}
                    target="_blank"
                    className="bg-[#25D366] text-black p-3 rounded-full shadow-lg"
                >
                    <LucideIcons.MessageCircle size={24} />
                </a>
                <a
                    href={`tel:${data.contact_phone}`}
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm shadow-lg"
                >
                    ARA
                </a>
            </div>

        </div>
    );
}