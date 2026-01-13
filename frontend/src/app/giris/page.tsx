import Link from 'next/link';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black pt-20 flex items-center justify-center relative overflow-hidden">
      
      {/* Arka Plan Efekti */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-green-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 flex justify-center">
        <div className="w-full max-w-md bg-[#111] p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10">
            
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Tekrar Hoş Geldin</h1>
                <p className="text-gray-400 text-sm">Hesabına giriş yap ve geleceğini planlamaya devam et.</p>
            </div>

            <form className="space-y-4">
                {/* Email */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">E-POSTA ADRESİ</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                        <input 
                            type="email" 
                            placeholder="ornek@mail.com" 
                            className="w-full h-12 pl-12 pr-4 bg-black/50 rounded-xl border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Şifre */}
                <div className="space-y-1">
                    <div className="flex justify-between ml-1">
                        <label className="text-xs font-bold text-gray-500">ŞİFRE</label>
                        <Link href="#" className="text-xs font-bold text-blue-500 hover:text-blue-400">Şifremi Unuttum?</Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            className="w-full h-12 pl-12 pr-4 bg-black/50 rounded-xl border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <button className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                    Giriş Yap <ArrowRight size={18} />
                </button>
            </form>

            <div className="my-6 flex items-center gap-4">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-xs text-gray-500 font-medium">VEYA</span>
                <div className="h-px bg-white/10 flex-1" />
            </div>

            <button className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all border border-white/10 flex items-center justify-center gap-2">
                <Github size={20} /> Google ile Devam Et
            </button>

            <p className="mt-8 text-center text-sm text-gray-400">
                Hesabın yok mu? <Link href="/kayit" className="text-blue-500 font-bold hover:underline">Hemen Kaydol</Link>
            </p>

        </div>
      </div>
    </div>
  );
}