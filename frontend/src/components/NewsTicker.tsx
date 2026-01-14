"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { Megaphone, ArrowRight, Image as ImageIcon } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  image?: string | null;
  cover_image?: string | null;
  category?: string;
}

export default function NewsTicker() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isMounted, setIsMounted] = useState(false); // Sadece client'ta render etmek için

  useEffect(() => {
    setIsMounted(true); // Bileşen tarayıcıya indi

    async function fetchNews() {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/news/`);
        let data: NewsItem[] = [];

        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (res.data && Array.isArray(res.data.results)) {
          data = res.data.results;
        }

        // SWIPER LOOP İÇİN GÜVENLİ ÇOĞALTMA
        // Veri varsa ama azsa çoğalt, yoksa dokunma.
        if (data.length > 0) {
          // Maksimum 20 öğeye kadar çoğalt (Sonsuz while döngüsü riskini kaldırıyoruz)
          let safeGuard = 0;
          while (data.length < 10 && safeGuard < 5) {
            data = [...data, ...data];
            safeGuard++;
          }
        }

        setNewsItems(data);
      } catch (error) {
        console.error("Haber verisi hatası:", error);
      }
    }

    fetchNews();
  }, []);

  // Eğer sayfa henüz sunucudaysa veya veri yoksa HİÇBİR ŞEY gösterme (Layout bozulmasın)
  if (!isMounted || newsItems.length === 0) return null;

  return (
    <div className="w-full bg-[#0A0A0A] border-b border-white/5 py-4 relative z-40">
      <div className="container mx-auto px-4 flex items-center h-16">

        {/* SOL ETİKET */}
        <div className="hidden md:flex items-center gap-2 bg-[#00ff88] text-black px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-wider shrink-0 mr-8 shadow-[0_0_15px_rgba(0,255,136,0.4)] animate-pulse">
          <Megaphone size={18} fill="black" />
          <span>GÜNDEM</span>
        </div>

        {/* SWIPER */}
        <div className="flex-1 overflow-hidden mask-linear-fade">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={40}
            slidesPerView="auto"
            loop={true}
            speed={6000}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
            }}
            allowTouchMove={false}
            className="w-full [&>.swiper-wrapper]:ease-linear!"
          >
            {newsItems.map((item, index) => {
              const imgUrl = item.cover_image || item.image;
              return (
                <SwiperSlide key={`${item.id}-${index}`} className="w-auto!">
                  <Link
                    href={`/haberler/${item.slug}`}
                    className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 pr-8 pl-2 py-2 rounded-full border border-white/5 hover:border-[#00ff88]/50 transition-all cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-black flex items-center justify-center shrink-0 border-2 border-white/10 group-hover:border-[#00ff88] group-hover:scale-105 transition-all shadow-xl relative">
                      {imgUrl ? (
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-[#111]">
                          <ImageIcon size={24} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#00ff88] uppercase tracking-wider mb-0.5">
                        {item.category || "HABER"}
                      </span>
                      <span className="text-base font-bold text-gray-200 group-hover:text-white transition-colors whitespace-nowrap">
                        {item.title}
                      </span>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        <Link href="/haberler" className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors shrink-0 ml-6 group">
          TÜMÜNÜ GÖR <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}