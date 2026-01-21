"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Instagram, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link"; // Link eklendi

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface ReelItem {
    id: number;
    title: string;
    embed_code: string;
}

export default function SocialEmbeds() {
    const [embeds, setEmbeds] = useState<ReelItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false); // Daha fazla video var mı kontrolü

    useEffect(() => {
        const fetchEmbeds = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/reels/?homepage=true`);
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);

                // Eğer 8'den fazla veri geldiyse butonu göster
                if (data.length > 8) {
                    setHasMore(true);
                }

                // Sadece ilk 8 tanesini ekrana bas
                setEmbeds(data.slice(0, 8));

            } catch (error) {
                console.error("Reels verileri çekilemedi:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmbeds();
    }, []);

    const extractVideoUrl = (input: string) => {
        try {
            if (!input) return null;
            const regex = /(?:reel|p)\/([a-zA-Z0-9_-]+)/;
            const match = input.match(regex);
            if (match && match[1]) {
                return `https://www.instagram.com/p/${match[1]}/embed/captioned/`;
            }
            return null;
        } catch (e) {
            return null;
        }
    };

    if (loading) {
        return (
            <section className="py-20 bg-[#050505] border-b border-white/10 flex justify-center items-center">
                <Loader2 className="animate-spin text-pink-500" size={32} />
            </section>
        );
    }

    if (embeds.length === 0) return null;

    return (
        <section className="py-20 bg-[#050505] border-b border-white/10 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">

                {/* Başlık */}
                <div className="flex items-center gap-3 mb-10 justify-center md:justify-start">
                    <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-purple-500/20">
                        <Instagram size={20} className="text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                        Kampüs <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Reels</span>
                    </h2>
                </div>

                {/* Video Izgarası */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center mb-12">
                    {embeds.map((item) => {
                        const embedUrl = extractVideoUrl(item.embed_code);
                        if (!embedUrl) return null;

                        return (
                            <div key={item.id} className="flex flex-col gap-3 w-full max-w-[300px]">
                                <div className="relative w-full aspect-[4/5] bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                                    <iframe
                                        className="w-full h-full relative z-10"
                                        src={embedUrl}
                                        frameBorder="0"
                                        scrolling="no"
                                        // @ts-ignore
                                        allowtransparency="true"
                                        allow="encrypted-media; autoplay; clipboard-write; picture-in-picture"
                                        style={{ objectFit: 'cover' }}
                                    ></iframe>

                                    {/* Güvenlik Kalkanları */}
                                    <div className="absolute top-0 left-0 w-full h-[20%] z-50 bg-transparent cursor-default"></div>
                                    <div className="absolute bottom-0 left-0 w-full h-[55%] z-50 bg-transparent cursor-default"></div>
                                </div>
                                <h3 className="text-white text-sm md:text-base font-semibold text-center leading-tight px-1 line-clamp-2 hover:text-pink-400 transition-colors cursor-default">
                                    {item.title}
                                </h3>
                            </div>
                        );
                    })}
                </div>

                {/* --- TÜMÜNÜ GÖR BUTONU --- */}
                {hasMore && (
                    <div className="flex justify-center mt-8">
                        <Link
                            href="/reels"
                            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#111] hover:bg-[#1a1a1a] border border-white/20 hover:border-pink-500/50 rounded-full transition-all duration-300 shadow-lg hover:shadow-pink-500/20"
                        >
                            <span className="text-white font-bold text-lg">Tüm Videoları Keşfet</span>
                            <div className="bg-pink-600 p-1.5 rounded-full group-hover:translate-x-1 transition-transform">
                                <ArrowRight size={20} className="text-white" />
                            </div>
                        </Link>
                    </div>
                )}

            </div>
        </section>
    );
}