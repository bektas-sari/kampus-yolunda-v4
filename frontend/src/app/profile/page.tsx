'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    User, LogOut, Mail, Calendar, Loader2,
    School, Building, Home, MapPin, Star, ChevronRight, Heart
} from 'lucide-react';

interface UserData {
    username: string;
    email: string;
    date_joined?: string;
}

// --- Interfaces for Favorites ---
// Not: Backend'den dönen yapıya göre düzenlenmiştir.
interface FavoriteUniversity {
    id: number;
    university: {
        id: number;
        name: string;
        slug: string;
        city: string;
        logo_url: string | null;
        cover_image_url: string | null;
    };
    created_at: string;
}

interface FavoriteDormitory {
    id: number;
    dormitory: {
        id: number;
        name: string;
        slug: string;
        city: string;
        district: string;
        type: string;
        price: number;
        cover_image: string | null;
    };
    created_at: string;
}

// House serializer yapısını kontrol ettik, nested 'student_house' dönüyor
interface FavoriteHouse {
    id: number; // Favorite ID
    student_house: {
        id: number;
        title: string; // House Detail
        slug: string;
        city: string;
        district: string;
        price: number;
        room_count: string;
        cover_image: string | null;
    };
    created_at: string;
}

export default function ProfilePage() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [userData, setUserData] = useState<UserData | null>(null);
    const [activeTab, setActiveTab] = useState<'universities' | 'dorms' | 'houses'>('universities');

    // Data States
    const [favUniversities, setFavUniversities] = useState<FavoriteUniversity[]>([]);
    const [favDorms, setFavDorms] = useState<FavoriteDormitory[]>([]);
    const [favHouses, setFavHouses] = useState<FavoriteHouse[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        const fetchAllData = async () => {
            const token = localStorage.getItem('access');
            if (!token) return;

            setLoading(true);
            try {
                // 1. User Data
                const userRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/user/`, { headers: { Authorization: `Bearer ${token}` } });
                setUserData(userRes.data);

                // 2. Favorites - Universities
                const uniRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/favorites/universities/`, { headers: { Authorization: `Bearer ${token}` } });
                setFavUniversities(uniRes.data);

                // 3. Favorites - Dormitories
                const dormRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/favorites/dormitories/`, { headers: { Authorization: `Bearer ${token}` } });
                setFavDorms(dormRes.data);

                // 4. Favorites - Houses
                // Not: House fav endpointi 'api/favorites/' olarak tanımlı
                const houseRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/favorites/`, { headers: { Authorization: `Bearer ${token}` } });
                setFavHouses(houseRes.data);

            } catch (error: any) {
                console.error("Veri çekme hatası:", error);
                if (error.response && error.response.status === 401) {
                    // Token geçersiz, çıkış yap ve login'e yönlendir
                    logout();
                    router.push('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchAllData();
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="animate-spin text-[#00ff88]" size={40} />
            </div>
        );
    }

    if (!userData) return null;

    // --- HELPER: GET IMAGE URL ---
    const getImageUrl = (path: string | null) => {
        if (!path) return "/placeholder.jpg";
        if (path.startsWith("http")) return path;
        return `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}${path}`;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 md:px-8 font-sans text-gray-200">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* --- LEFT SIDEBAR (Profil Özeti) --- */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
                        {/* Dekoratif Arkaplan */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-full blur-2xl group-hover:bg-[#00ff88]/10 transition-colors" />

                        <div className="w-24 h-24 rounded-full bg-linear-to-tr from-[#00ff88] to-blue-500 p-1 mb-4 shadow-[0_0_20px_rgba(0,255,136,0.3)]">
                            <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center">
                                <User size={40} className="text-white" />
                            </div>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-1">{userData.username}</h2>
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full mb-6">
                            <Mail size={12} /> {userData.email}
                        </div>

                        <button
                            onClick={logout}
                            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-red-500/20 hover:border-red-500/50"
                        >
                            <LogOut size={16} /> Çıkış Yap
                        </button>
                    </div>

                    <div className="bg-[#111] border border-white/10 rounded-3xl p-6 hidden lg:block">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">İstatistikler</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                <span className="text-sm text-gray-300">Favori Üniversite</span>
                                <span className="text-[#00ff88] font-bold">{favUniversities.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                <span className="text-sm text-gray-300">Favori Yurt</span>
                                <span className="text-[#00ff88] font-bold">{favDorms.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                <span className="text-sm text-gray-300">Favori Ev</span>
                                <span className="text-[#00ff88] font-bold">{favHouses.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MAIN CONTENT (Tabs & Grid) --- */}
                <div className="lg:col-span-3">

                    {/* TABS */}
                    <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('universities')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'universities'
                                ? 'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                                : 'bg-[#111] text-gray-400 hover:bg-white/10 border border-white/5'
                                }`}
                        >
                            <School size={18} /> Favori Üniversitelerim
                            <span className="bg-black/20 px-2 py-0.5 rounded-full text-xs ml-1">{favUniversities.length}</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('dorms')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'dorms'
                                ? 'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                                : 'bg-[#111] text-gray-400 hover:bg-white/10 border border-white/5'
                                }`}
                        >
                            <Building size={18} /> Favori Yurtlar
                            <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs ml-1">{favDorms.length}</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('houses')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'houses'
                                ? 'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                                : 'bg-[#111] text-gray-400 hover:bg-white/10 border border-white/5'
                                }`}
                        >
                            <Home size={18} /> Favori Evler
                            <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs ml-1">{favHouses.length}</span>
                        </button>
                    </div>

                    {/* CONTENT GRID */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* 1. UNIVERSITIES GRID */}
                        {activeTab === 'universities' && (
                            favUniversities.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {favUniversities.map((item) => (
                                        <Link href={`/universite/${item.university.slug}`} key={item.id} className="block group">
                                            <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden hover:border-[#00ff88]/50 transition-all hover:-translate-y-1 shadow-lg relative h-full flex flex-col">
                                                <div className="h-40 relative overflow-hidden">
                                                    <img
                                                        src={getImageUrl(item.university.cover_image_url)}
                                                        alt={item.university.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                                    <div className="absolute top-4 right-4 bg-white p-1.5 rounded-full shadow-lg">
                                                        <Heart size={16} className="fill-red-500 text-red-500" />
                                                    </div>
                                                </div>
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                                                            <img src={getImageUrl(item.university.logo_url)} className="w-full h-full object-contain" />
                                                        </div>
                                                        <div className="text-xs font-bold text-[#00ff88] border border-[#00ff88]/20 px-2 py-1 rounded bg-[#00ff88]/5">
                                                            {item.university.city}
                                                        </div>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-[#00ff88] transition-colors">
                                                        {item.university.name}
                                                    </h3>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={School}
                                    title="Henüz Favori Üniversiten Yok"
                                    desc="Hayalindeki üniversiteyi bulmak için keşfe çık!"
                                    actionLink="/universiteler"
                                    actionText="Üniversiteleri Keşfet"
                                />
                            )
                        )}

                        {/* 2. DORMS GRID */}
                        {activeTab === 'dorms' && (
                            favDorms.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {favDorms.map((item) => (
                                        <Link href={`/yurt/${item.dormitory.slug}`} key={item.id} className="block group">
                                            <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden hover:border-[#00ff88]/50 transition-all hover:-translate-y-1 shadow-lg h-full flex flex-col">
                                                <div className="h-40 relative overflow-hidden">
                                                    <img
                                                        src={getImageUrl(item.dormitory.cover_image)}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className="absolute top-4 right-4 bg-white p-1.5 rounded-full shadow-lg">
                                                        <Heart size={16} className="fill-red-500 text-red-500" />
                                                    </div>
                                                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white border border-white/10">
                                                        {item.dormitory.type}
                                                    </div>
                                                </div>
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                                                        <MapPin size={12} /> {item.dormitory.district}, {item.dormitory.city}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white mb-auto group-hover:text-[#00ff88] transition-colors">{item.dormitory.name}</h3>
                                                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">Başlangıç</span>
                                                        <span className="text-[#00ff88] font-bold">{item.dormitory.price.toLocaleString()} ₺</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Building}
                                    title="Favori Yurt Eklenmemiş"
                                    desc="Kampüsüne en yakın ve konforlu yurtları incele."
                                    actionLink="/yurtlar"
                                    actionText="Yurtları İncele"
                                />
                            )
                        )}

                        {/* 3. HOUSES GRID */}
                        {activeTab === 'houses' && (
                            favHouses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {favHouses.map((item) => (
                                        <Link href={`/ev/${item.student_house.slug}`} key={item.id} className="block group">
                                            <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden hover:border-[#00ff88]/50 transition-all hover:-translate-y-1 shadow-lg h-full flex flex-col">
                                                <div className="h-40 relative overflow-hidden">
                                                    <img
                                                        src={getImageUrl(item.student_house.cover_image)}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className="absolute top-4 right-4 bg-white p-1.5 rounded-full shadow-lg">
                                                        <Heart size={16} className="fill-red-500 text-red-500" />
                                                    </div>
                                                </div>
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-gray-400 border border-white/10 px-2 py-0.5 rounded">{item.student_house.room_count}</span>
                                                        <span className="text-[#00ff88] font-bold">{item.student_house.price.toLocaleString()} ₺</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#00ff88] transition-colors line-clamp-1">{item.student_house.title}</h3>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <MapPin size={10} /> {item.student_house.district}, {item.student_house.city}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Home}
                                    title="Favori Ev Listesi Boş"
                                    desc="Arkadaşlarınla kalabileceğin en güzel evleri bul."
                                    actionLink="/evler" // Varsayılan evler linki
                                    actionText="Evlere Göz At"
                                />
                            )
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}

// --- SUB-COMPONENT: EMPTY STATE ---
function EmptyState({ icon: Icon, title, desc, actionLink, actionText }: { icon: any, title: string, desc: string, actionLink: string, actionText: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-[#111] rounded-3xl border border-dashed border-white/10 text-center">
            <div className="w-20 h-20 bg-[#0a0a0a] rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">
                <Icon size={32} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 max-w-sm mb-8">{desc}</p>
            <Link
                href={actionLink}
                className="bg-[#00ff88] hover:bg-[#00cc6a] text-black px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:shadow-[0_0_30px_rgba(0,255,136,0.5)] transform hover:scale-105"
            >
                {actionText}
            </Link>
        </div>
    );
}
