"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { Calendar, User, ArrowLeft, Loader2, Share2, Clock } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface NewsDetail {
    id: number;
    title: string;
    slug: string;
    cover_image: string | null;
    summary: string | null; // DÜZELTİLDİ: Backend'deki isim 'summary'
    content: string;
    category: string;
    author: string;
    published_at: string;
}

export default function NewsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [news, setNews] = useState<NewsDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewsDetail = async () => {
            if (!slug) return;
            try {
                const res = await axios.get(`${BACKEND_URL}/api/news/${slug}/`);
                setNews(res.data);
            } catch (error) {
                console.error("Haber detayı çekilemedi:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNewsDetail();
    }, [slug]);

    const getImageUrl = (path: string | null) => {
        if (!path) return "/placeholder.jpg";
        if (path.startsWith("http")) return path;
        return `${BACKEND_URL}${path}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#00ff88]" size={40} />
            </div>
        );
    }

    if (!news) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-bold mb-4">Haber Bulunamadı</h2>
                <button
                    onClick={() => router.push('/haberler')}
                    className="bg-[#00ff88] text-black px-6 py-2 rounded-lg font-bold"
                >
                    Haberlere Dön
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 pb-20">

            {/* Hero / Cover Image */}
            <div className="relative w-full h-[60vh] min-h-[400px]">
                <Image
                    src={getImageUrl(news.cover_image)}
                    alt={news.title}
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

                {/* Back Button */}
                <div className="absolute top-24 left-4 md:left-10 z-20">
                    <Link
                        href="/haberler"
                        className="flex items-center gap-2 bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-md transition-all border border-white/10"
                    >
                        <ArrowLeft size={18} /> Tüm Haberler
                    </Link>
                </div>

                {/* Title Block */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-5xl mx-auto">
                    <div className="mb-4 flex flex-wrap gap-3">
                        <span className="bg-[#00ff88] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            {news.category}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
                        {news.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border border-white/20">
                                <User size={14} className="text-[#00ff88]" />
                            </div>
                            <span className="font-medium">{news.author || "Editör"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-[#00ff88]" />
                            <span>{formatDate(news.published_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-[#00ff88]" />
                            <span>3 dk okuma</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Main Content */}
                <div className="lg:col-span-8">

                    {/* --- ÖZET ALANI (DÜZELTİLDİ) --- */}
                    {/* Backend 'summary' olarak gönderiyor */}
                    {news.summary && (
                        <div className="mb-10">
                            <p className="text-xl md:text-2xl text-gray-300 italic font-medium leading-relaxed border-l-4 border-[#00ff88] pl-6 py-2 bg-white/5 rounded-r-lg">
                                {news.summary}
                            </p>
                        </div>
                    )}
                    {/* --- ÖZET ALANI BİTİŞ --- */}

                    <article className="prose prose-invert prose-lg max-w-none text-gray-300">
                        {/* İçerik */}
                        <div className="whitespace-pre-line leading-relaxed">
                            {news.content}
                        </div>
                    </article>

                    {/* Paylaş Butonları */}
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Share2 size={18} /> Haberi Paylaş
                        </h4>
                        <div className="flex gap-3">
                            <button className="bg-[#1DA1F2] hover:bg-[#1a91da] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Twitter</button>
                            <button className="bg-[#4267B2] hover:bg-[#365899] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Facebook</button>
                            <button className="bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">WhatsApp</button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 sticky top-24">
                        <h3 className="text-xl font-bold text-white mb-4">Bültene Abone Ol</h3>
                        <p className="text-gray-400 text-sm mb-4">Kampüs gelişmelerinden anında haberdar olmak için e-posta adresini bırak.</p>
                        <div className="flex flex-col gap-3">
                            <input type="email" placeholder="E-posta adresin" className="bg-black border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#00ff88] outline-none" />
                            <button className="bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold py-3 rounded-lg transition-colors">Abone Ol</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}