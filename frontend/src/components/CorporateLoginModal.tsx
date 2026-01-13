"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { X, Building2, Lock, ArrowRight, Loader2 } from "lucide-react";

interface CorporateLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CorporateLoginModal({ isOpen, onClose }: CorporateLoginModalProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 1. Giriş işlemini dene
            await login(username, password);

            // 2. Modalı kapat
            onClose();

            // 3. KRİTİK DÜZELTME: Doğrudan Kurumsal Panele yönlendir
            router.push('/kurumsal/dashboard');

        } catch (err: any) {
            console.error("Login Error:", err);
            setError("Giriş başarısız. Kullanıcı adı veya şifre hatalı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

                {/* Kapat Butonu */}
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="p-8">
                    <div className="flex flex-col items-center mb-6">
                        <div className="h-16 w-16 bg-[#00ff88]/10 rounded-full flex items-center justify-center text-[#00ff88] mb-4">
                            <Building2 size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Kurumsal Giriş</h2>
                        <p className="text-gray-500 text-xs mt-1 text-center">
                            Üniversite ve yurt yetkilileri için yönetim paneli.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Kullanıcı Adı</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 text-gray-600" size={16} />
                                <input
                                    type="text"
                                    required
                                    placeholder="Kurum kullanıcı adınız"
                                    className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Şifre</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-600" size={16} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-bold text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} /> Giriş Yapılıyor...
                                </>
                            ) : (
                                <>
                                    Panele Git <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a href="#" className="text-xs text-gray-500 hover:text-white transition-colors">Şifrenizi mi unuttunuz?</a>
                    </div>
                </div>

                <div className="bg-[#111] p-4 text-center border-t border-white/5">
                    <p className="text-xs text-gray-500">
                        Henüz kurumsal hesabınız yok mu? <a href="#" className="text-[#00ff88] font-bold hover:underline">Başvuru Yapın</a>
                    </p>
                </div>
            </div>
        </div>
    );
}