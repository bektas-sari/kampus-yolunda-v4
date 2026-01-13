"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Backend'deki kayıt endpoint'ine istek at
            await axios.post(`${BACKEND_URL}/api/auth/register/`, formData);
            setSuccess(true);

            // 2 saniye sonra giriş sayfasına yönlendir
            setTimeout(() => router.push("/login"), 2000);
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.username) {
                setError("Bu kullanıcı adı zaten alınmış.");
            } else {
                setError("Kayıt işlemi başarısız. Lütfen bilgileri kontrol et.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-20 flex items-center justify-center relative overflow-hidden">

            {/* Arka Plan Efekti */}
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#00ff88]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 flex justify-center">
                <div className="w-full max-w-md bg-[#111] p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10">

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-white mb-2">Aramıza Katıl</h1>
                        <p className="text-gray-400 text-sm">Kampüs Yolunda hesabını oluştur, üniversite serüvenini başlat.</p>
                    </div>

                    {success ? (
                        <div className="text-center py-10 animate-in zoom-in">
                            <CheckCircle className="w-16 h-16 text-[#00ff88] mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">Kayıt Başarılı!</h3>
                            <p className="text-gray-400">Giriş sayfasına yönlendiriliyorsun...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 ml-1">KULLANICI ADI</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-[#00ff88]" />
                                    <input
                                        type="text"
                                        placeholder="Kullanıcı adın"
                                        className="w-full h-12 pl-12 pr-4 bg-[#1A1A1A] rounded-xl border border-white/10 text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 ml-1">E-POSTA ADRESİ</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-[#00ff88]" />
                                    <input
                                        type="email"
                                        placeholder="ornek@mail.com"
                                        className="w-full h-12 pl-12 pr-4 bg-[#1A1A1A] rounded-xl border border-white/10 text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 ml-1">ŞİFRE OLUŞTUR</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-[#00ff88]" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full h-12 pl-12 pr-4 bg-[#1A1A1A] rounded-xl border border-white/10 text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 leading-relaxed">
                                Kaydolarak <Link href="#" className="text-gray-300 underline">Kullanım Koşulları</Link>'nı kabul etmiş olursun.
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold transition-all shadow-[0_0_20px_rgba(0,255,136,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <>Hesap Oluştur <ArrowRight size={18} /></>}
                            </button>
                        </form>
                    )}

                    <p className="mt-8 text-center text-sm text-gray-400">
                        Zaten hesabın var mı? <Link href="/login" className="text-[#00ff88] font-bold hover:underline">Giriş Yap</Link>
                    </p>

                </div>
            </div>
        </div>
    );
}