import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black pt-20 pb-10">
      <div className="container mx-auto px-6">
        {/* ÜST KISIM: 4 SÜTUNLU GRİD */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {/* 1. SÜTUN: MARKA VE MİSYON */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-10 w-40">
                <Image
                  src="/logo.png"
                  alt="Kampüs Yolunda"
                  fill
                  className="object-contain object-left"
                  sizes="200px"
                />
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Geleceğini şansa bırakma. Türkiye'nin en kapsamlı veri tabanı ve
              akıllı eşleştirme sistemiyle hayalindeki üniversiteyi ve yaşam
              alanını keşfet.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Twitter size={18} />} href="#" />
              <SocialIcon icon={<Instagram size={18} />} href="#" />
              <SocialIcon icon={<Linkedin size={18} />} href="#" />
            </div>
          </div>

          {/* 2. SÜTUN: HIZLI MENÜ */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">
              Kurumsal
            </h3>
            <ul className="space-y-4">
              <FooterLink href="/hakkimizda" text="Hakkımızda" />
              <FooterLink href="/kunye" text="Künye & Ekip" />
              <FooterLink href="/reklam" text="Reklam Verin" />
              <FooterLink href="/iletisim" text="İletişim" />
              <FooterLink href="/kvkk" text="KVKK ve Gizlilik" />
            </ul>
          </div>

          {/* 3. SÜTUN: POPÜLER ARAMALAR (SEO İÇİN) */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">
              Popüler Aramalar
            </h3>
            <ul className="space-y-4">
              <FooterLink
                href="/universiteler/istanbul"
                text="İstanbul Üniversiteleri"
              />
              <FooterLink
                href="/universiteler/ankara"
                text="Ankara Üniversiteleri"
              />
              <FooterLink
                href="/yurtlar/kiz-yurdu"
                text="İstanbul Kız Yurtları"
              />
              <FooterLink
                href="/yurtlar/erkek-yurdu"
                text="Özel Erkek Yurtları"
              />
              <FooterLink href="/tercih-robotu" text="YKS Tercih Robotu" />
            </ul>
          </div>

          {/* 4. SÜTUN: BÜLTEN ABONELİĞİ */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">
              Haberdar Ol
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              Tercih dönemleri, burs duyuruları ve kampüs etkinliklerinden ilk
              senin haberin olsun.
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="E-posta adresin"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700">
                Abone Ol <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* AYIRACI ÇİZGİ */}
        {/* AYIRACI ÇİZGİ */}
        <div className="my-10 h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
        {/* ALT KISIM: COPYRIGHT */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-xs text-gray-500">
          <p>© 2026 Kampüs Yolunda. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-6">
            <span>
              Powered by{" "}
              <span className="text-blue-500 font-bold">Kognitect</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Yardımcı Ufak Bileşenler
function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <Link
      href={href}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-blue-600 hover:text-white"
    >
      {icon}
    </Link>
  );
}

function FooterLink({ href, text }: { href: string; text: string }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-gray-400 transition-colors hover:text-blue-400 hover:underline"
      >
        {text}
      </Link>
    </li>
  );
}
