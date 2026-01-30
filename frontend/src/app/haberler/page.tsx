"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { Calendar, Clock, ChevronRight, ChevronLeft, Loader2, AlertCircle, User } from "lucide-react";

// Backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  cover_image: string | null;
  summary: string | null;
  category: string;
  published_at: string;
  author: string;
}

// Django Pagination Yapısı (Backend'den gelen veri paketi)
interface NewsResponse {
  count: number; // Toplam haber sayısı
  next: string | null;
  previous: string | null;
  results: NewsItem[]; // O sayfadaki haberler
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- SAYFALAMA STATE'LERİ ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 12; // Backend'deki settings.py ile aynı olmalı

  const fetchNews = async (page: number) => {
    setLoading(true);
    try {
      // Sayfa numarasına göre istek atıyoruz: api/news/?page=2
      const res = await axios.get<NewsResponse>(`${BACKEND_URL}/api/news/?page=${page}`);

      // Gelen veriyi işle
      const data = res.data as any;
      let newsArray: NewsItem[] = [];
      let totalCount = 0;

      if (Array.isArray(data)) {
        // Pagination kapalıysa direkt array döner
        newsArray = data;
        totalCount = data.length;
      } else if (data && data.results) {
        // Pagination açıksa results döner
        newsArray = data.results;
        totalCount = data.count;
      }

      setNews(newsArray || []);

      // Toplam sayfa sayısını hesapla
      const calculatedTotalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
      setTotalPages(calculatedTotalPages);

    } catch (error) {
      console.error("Haberler çekilemedi:", error);
    } finally {
      setLoading(false);
      // Sayfa değişince en üste kaydır
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sayfa numarası değiştiğinde (veya ilk açılışta) çalışır
  useEffect(() => {
    fetchNews(currentPage);
  }, [currentPage]);

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

  // Sayfa Değiştirme Fonksiyonu
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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

        {news && news.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item) => (
                <Link
                  href={`/haberler/${item.slug}`}
                  key={item.id}
                  className="group bg-[#111] rounded-2xl overflow-hidden border border-white/10 hover:border-[#00ff88]/50 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full"
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
                  <div className="p-6 flex flex-col flex-grow">
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

                    {item.summary && (
                      <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-grow">
                        {item.summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User size={14} />
                        <span>{item.author || "Editör"}</span>
                      </div>
                      <div className="flex items-center text-[#00ff88] text-sm font-bold group/btn">
                        Haberi Oku
                        <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* --- PAGINATION (SAYFALANDIRMA BUTONLARI) --- */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16">

                {/* Önceki Sayfa */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-3 rounded-xl border flex items-center justify-center transition-all ${currentPage === 1
                    ? "border-white/10 text-gray-700 cursor-not-allowed"
                    : "border-white/20 text-white hover:bg-white/10 hover:border-[#00ff88] hover:text-[#00ff88]"
                    }`}
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Sayfa Numaraları */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-12 h-12 rounded-xl font-bold border transition-all flex items-center justify-center ${currentPage === pageNum
                      ? "bg-[#00ff88] text-black border-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                      : "bg-transparent text-white border-white/20 hover:border-[#00ff88] hover:text-[#00ff88]"
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}

                {/* Sonraki Sayfa */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-3 rounded-xl border flex items-center justify-center transition-all ${currentPage === totalPages
                    ? "border-white/10 text-gray-700 cursor-not-allowed"
                    : "border-white/20 text-white hover:bg-white/10 hover:border-[#00ff88] hover:text-[#00ff88]"
                    }`}
                >
                  <ChevronRight size={20} />
                </button>

              </div>
            )}
            {/* --- PAGINATION SONU --- */}
          </>
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