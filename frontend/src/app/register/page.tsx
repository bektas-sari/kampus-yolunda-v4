'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, Loader2, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/register/`, formData);

            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 2000); // 2 saniye sonra login'e yönlendir

        } catch (err: any) {
            console.error("Kayıt hatası:", err);
            // Django'dan gelen detaylı hata mesajlarını gösterebiliriz
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                const firstError = Object.values(errorData)[0];
                if (Array.isArray(firstError)) {
                    setError(firstError[0]);
                } else if (typeof firstError === 'string') {
                    setError(firstError);
                } else {
                    setError('Kayıt işlemi başarısız oldu. Lütfen bilgilerinizi kontrol edin.');
                }
            } else {
                setError('Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">

            {/* Arkaplan Efektleri */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />

            {/* Register Card - Glassmorphism */}
            <div className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl relative z-10 mx-4">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Aramıza Katıl
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Kampüs Yolunda hesabını oluştur
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {error && (
                        <div className="p-3 text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-lg animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 text-sm text-green-200 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle size={16} />
                            Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                name="username"
                                placeholder="Kullanıcı Adı"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="E-posta Adresi"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Şifre"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || success}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={20} />
                                Kayıt Yapılıyor...
                            </>
                        ) : (
                            "Kayıt Ol"
                        )}
                    </button>

                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        Zaten hesabın var mı?{' '}
                        <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Giriş Yap
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
