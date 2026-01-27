"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Menu, X, Building2, LogOut } from "lucide-react";
import CorporateLoginModal from "@/components/CorporateLoginModal";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCorporateModalOpen, setIsCorporateModalOpen] = useState(false);

  // HOOKS
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // FIX: TypeScript hatasını çözmek için 'user' değişkenini 'any' olarak işaretleyip esneklik sağlıyoruz.
  const currentUser = user as any;

  // Kurumsal Panelde miyiz? (URL '/kurumsal' içeriyorsa)
  const isCorporatePage = pathname?.includes("/kurumsal");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Mobil menü linkine tıklayınca menüyü kapat
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen || isCorporatePage
          ? "bg-black/90 backdrop-blur-md border-b border-white/10 py-3"
          : "bg-transparent py-5"
          }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">

          {/* 1. SOL: LOGO ALANI */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-auto">
              <Image
                src="/logo.png"
                alt="Kampüs Yolunda"
                width={180}
                height={50}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
          </Link>

          {/* 2. ORTA: LİNKLER (DESKTOP) */}
          {!isCorporatePage && (
            <div className="hidden xl:flex items-center gap-8">
              <Link href="/universiteler" className="text-[15px] font-medium text-gray-300 hover:text-white transition-colors">
                Üniversiteler
              </Link>
              <Link href="/yurtlar" className="text-[15px] font-medium text-gray-300 hover:text-white transition-colors">
                Yurtlar
              </Link>
              <Link href="/ogrenci-evleri" className="text-[15px] font-medium text-gray-300 hover:text-white transition-colors">
                Öğrenci Evleri
              </Link>
              <Link href="/tercih-motoru" className="text-[15px] font-medium text-gray-300 hover:text-white transition-colors">
                Tercih Motoru
              </Link>
              <Link href="/burslar" className="flex items-center gap-2 text-[15px] font-medium text-gray-300 hover:text-white transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]" />
                Burslar
              </Link>
              <Link href="/haberler" className="text-[15px] font-medium text-gray-300 hover:text-white transition-colors">
                Kampüs Haber
              </Link>
            </div>
          )}

          {/* 3. SAĞ: AUTH VE AKSİYONLAR */}
          <div className="hidden lg:flex items-center gap-5">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    {currentUser.username ? currentUser.username.substring(0, 2).toUpperCase() : "U"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium">Hoş geldin,</span>
                    <span className="text-sm text-white font-bold leading-none">
                      {currentUser.username || "Kullanıcı"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Çıkış Yap"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsCorporateModalOpen(true)}
                  className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#00ff88] transition-colors uppercase tracking-wide mr-2"
                >
                  <Building2 size={14} />
                  Kurumsal
                </button>

                <Link
                  href="/login"
                  className="text-[15px] font-medium text-white hover:text-gray-300 transition-colors"
                >
                  Giriş Yap
                </Link>

                <Link
                  href="/register"
                  className="bg-[#0066FF] hover:bg-blue-600 text-white px-6 py-2.5 rounded-full text-[15px] font-bold transition-all shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.23)] hover:-translate-y-[1px]"
                >
                  Kaydol
                </Link>
              </>
            )}
          </div>

          {/* MOBİL MENÜ TRIGGER */}
          {!isCorporatePage && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>

        {/* MOBİL MENÜ İÇERİĞİ (GÜNCELLENDİ: TÜM LİNKLER EKLENDİ) */}
        {isMobileMenuOpen && !isCorporatePage && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 p-6 flex flex-col gap-4 shadow-2xl h-screen z-50">
            <Link href="/universiteler" onClick={closeMobileMenu} className="text-gray-300 hover:text-white py-3 border-b border-white/5 text-lg font-medium">Üniversiteler</Link>
            <Link href="/yurtlar" onClick={closeMobileMenu} className="text-gray-300 hover:text-white py-3 border-b border-white/5 text-lg font-medium">Yurtlar</Link>
            <Link href="/ogrenci-evleri" onClick={closeMobileMenu} className="text-gray-300 hover:text-white py-3 border-b border-white/5 text-lg font-medium">Öğrenci Evleri</Link>
            <Link href="/tercih-robotu" onClick={closeMobileMenu} className="text-gray-300 hover:text-white py-3 border-b border-white/5 text-lg font-medium">Tercih Motoru</Link>
            <Link href="/burslar" onClick={closeMobileMenu} className="text-gray-300 hover:text-white py-3 border-b border-white/5 text-lg font-medium flex items-center gap-2">
              Burslar
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            </Link>
            <Link href="/haberler" onClick={closeMobileMenu} className="text-gray-300 hover:text-white py-3 border-b border-white/5 text-lg font-medium">Kampüs Haber</Link>

            <div className="mt-4 flex flex-col gap-3">
              {currentUser ? (
                <button onClick={handleLogout} className="text-red-500 font-bold py-3 text-left border-t border-white/10 mt-2">Çıkış Yap</button>
              ) : (
                <>
                  <Link href="/login" onClick={closeMobileMenu} className="text-white font-bold py-3 text-center bg-white/10 rounded-lg">Giriş Yap</Link>
                  <Link href="/register" onClick={closeMobileMenu} className="bg-[#0066FF] text-white text-center py-3 rounded-xl font-bold">Kaydol</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* MODAL */}
      <CorporateLoginModal
        isOpen={isCorporateModalOpen}
        onClose={() => setIsCorporateModalOpen(false)}
      />
    </>
  );
}