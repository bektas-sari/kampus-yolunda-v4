"use client";

import { useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    LogOut,
    Settings
} from "lucide-react";

export default function CorporateLayout({ children }: { children: React.ReactNode }) {
    const [activeMenu, setActiveMenu] = useState("dashboard");

    return (
        <div className="min-h-screen bg-[#050505] flex font-sans">
            {/* SIDEBAR */}
            <aside className="w-[280px] bg-[#000] border-r border-white/5 flex flex-col fixed h-full z-20">

                {/* Logo Alanı */}
                <div className="p-8">
                    <h2 className="text-xl font-bold text-white">Kampüs<span className="text-blue-500">Yönetim</span></h2>
                    <p className="text-xs text-gray-500 mt-1">Kurumsal Kontrol Paneli</p>
                </div>

                {/* Menü */}
                <nav className="flex-1 px-4 space-y-2">

                    {/* Aktif Buton (Yeşil - Görseldeki gibi) */}
                    <Link
                        href="/kurumsal/dashboard"
                        onClick={() => setActiveMenu("dashboard")}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeMenu === "dashboard"
                            ? "bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.2)]"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <LayoutDashboard size={20} />
                        Genel Bakış
                    </Link>

                    <Link
                        href="/kurumsal/adaylar" // <-- GÜNCELLENDİ (Eskiden # idi)
                        // onClick handler'ı kalabilir veya kaldırılabilir, Next.js active class mantığı daha sağlıklıdır ama şimdilik kalsın.
                        className="..."
                    >
                        <div className="flex items-center gap-3">
                            <Users size={20} />
                            Aday Öğrenciler
                        </div>
                        {/* Bildirim rozetini dinamik yapabiliriz ama şimdilik statik kalsın */}
                        <span className="bg-[#00ff88] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
                    </Link>

                    <Link href="#" className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5">
                        <Settings size={20} />
                        Kurum Ayarları
                    </Link>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/5">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-bold">
                        <LogOut size={18} />
                        Çıkış Yap
                    </Link>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-[280px] bg-[#050505]">
                {children}
            </main>
        </div>
    );
}