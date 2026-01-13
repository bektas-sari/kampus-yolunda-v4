"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { User, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Canlıda farklı, localde farklı çalışması için
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${BACKEND_URL}/api/token/`, {
                username,
                password
            });

            const { access, refresh } = response.data;
            login(access, refresh);

        } catch (err: any) {
            console.error("Login hatası:", err);
            setError('Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">

            {/* Arkaplan Efektleri (Marka Rengi: Yeşil) */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#00ff88]/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#00ff88]/10 blur-[120px]" />

            <div className="w-full max-w-md p-8 rounded-3xl bg-[#111] border border-white/10 shadow-2xl relative z-10 mx-4">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                        Tekrar Hoş Geldin
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Kampüs Yolunda hesabına giriş yap
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {error && (
                        <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00ff88] transition-colors">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Kullanıcı Adı"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-[#00ff88] transition-all placeholder:text-gray-600"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00ff88] transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                placeholder="Şifre"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-[#00ff88] transition-all placeholder:text-gray-600"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,136,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} /> Giriş Yapılıyor...
                            </>
                        ) : (
                            <>
                                Giriş Yap <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        Henüz hesabın yok mu?{' '}
                        <a href="/kayit" className="text-[#00ff88] hover:underline font-bold transition-colors">
                            Kayıt Ol
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}