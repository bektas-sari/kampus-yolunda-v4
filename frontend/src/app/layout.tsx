import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // <-- Footer'ı import et
import { Providers } from "@/components/Providers";
import { GoogleTagManager } from '@next/third-parties/google'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kampüs Yolunda - Hayalindeki Üniversiteyi Keşfet",
  description: "Türkiye'nin en kapsamlı üniversite ve yurt rehberi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <GoogleTagManager gtmId="GTM-MRMC2SDZ" />
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <Providers>
          {/* Navbar her sayfada sabit */}
          <Navbar />

          {/* Sayfa İçerikleri */}
          <main className="pt-20">
            {children}
          </main>

          {/* Footer her sayfanın altında sabit */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}