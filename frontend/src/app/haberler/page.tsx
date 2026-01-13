"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Calendar, Clock, ChevronRight, Loader2, AlertCircle } from "lucide-react";

// Backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  cover_image: string | null;
  summary: string;
  category: string;
  published_at: string;
  author: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/news/`);
        // Backend pagination (results) dönüyor mu kontrol et
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setNews(data);
      } catch (error) {
        console.error("Haberler çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder.jpg"; // Placeholder görselin yoksa bir tane ekle
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 pt-24 pb-20">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Kampüs Haber</h1>
          <p className="text-xl text-gray-400">Üniversite dünyasından en güncel gelişmeler, duyurular ve başarı hikayeleri.</p>
        </div>

        {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => (
              <Link
                href={`/haberler/${item.slug}`} // BURASI KRİTİK: Doğru adrese gitmeli
                key={item.id}
                className="group bg-[#111] rounded-2xl overflow-hidden border border-white/10 hover:border-[#00ff88]/50 transition-all hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Görsel */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={getImageUrl(item.cover_image)}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#00ff88] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* İçerik */}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-[#00ff88]" />
                      {formatDate(item.published_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-[#00ff88]" />
                      3 dk okuma
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[#00ff88] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-gray-400 text-sm line-clamp-3 mb-6">
                    {item.summary}
                  </p>

                  <div className="flex items-center text-[#00ff88] text-sm font-bold group/btn">
                    Haberi Oku
                    <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl bg-[#111]">
            <AlertCircle size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white">Henüz Haber Yok</h3>
            <p className="text-gray-500">Şu anda yayınlanmış bir haber bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}