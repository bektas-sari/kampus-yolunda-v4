import Link from 'next/link';
import { BrainCircuit, Sparkles, ArrowRight, Target, BarChart3 } from 'lucide-react';

export default function PreferenceEnginePage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-20 relative overflow-hidden">
      
      {/* Arka Plan Efekti */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        
        {/* DÜZELTME: Kognitect yerine Kampüs Yolunda yazıldı */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-sm font-bold mb-8 animate-pulse">
            <BrainCircuit size={18} />
            Kampüs Yolunda AI Teknolojisi
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          Geleceğini <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-600">
            Veriyle Tasarla
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Klasik tercih robotlarını unut. Yapay zeka algoritmamız; akademik başarını, ilgi alanlarını ve kişilik analizini birleştirerek sana en uygun kariyer yolunu çizer.
        </p>

        {/* Aksiyon Kutusu */}
        <div className="max-w-md mx-auto bg-[#111] p-8 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex flex-col gap-4">
                <input 
                    type="text" 
                    placeholder="TYT/AYT Puanını Gir (Opsiyonel)" 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
                    <Sparkles size={20} /> Analizi Başlat
                </button>
            </div>
            <p className="mt-4 text-xs text-gray-500">
                *Şu an BETA sürümündedir. Sonuçlar rehberlik amaçlıdır.
            </p>
        </div>

        {/* Özellikler */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
            <FeatureBox 
                icon={<Target className="text-red-400" />} 
                title="Nokta Atışı" 
                desc="Binlerce veri noktası taranarak senin için en gerçekçi hedefler belirlenir." 
            />
            <FeatureBox 
                icon={<BarChart3 className="text-green-400" />} 
                title="Trend Analizi" 
                desc="Hangi bölümün geleceği parlak? Sektör trendlerine göre öneriler al." 
            />
            <FeatureBox 
                icon={<BrainCircuit className="text-purple-400" />} 
                title="Yetenek Eşleşmesi" 
                desc="Sadece puana değil, yeteneklerine uygun bölümleri keşfet." 
            />
        </div>

      </div>
    </div>
  );
}

function FeatureBox({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left hover:border-white/10 transition-colors">
            <div className="mb-4 bg-white/5 w-12 h-12 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400">{desc}</p>
        </div>
    )
}