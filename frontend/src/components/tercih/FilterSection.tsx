"use client";
import { useState } from "react";
import { Search } from "lucide-react";

export default function FilterSection({ onSearch }: { onSearch: (f: any) => void }) {
    const [siralama, setSiralama] = useState("");
    const [puanTuru, setPuanTuru] = useState("SAY");
    const [city, setCity] = useState("");
    const [department, setDepartment] = useState("");

    const handleSubmit = () => {
        // virgül ile ayrılmış şehirleri diziye çevir
        const cityList = city.split(',').map(c => c.trim()).filter(c => c.length > 0);
        const deptList = department.split(',').map(d => d.trim()).filter(d => d.length > 0);

        onSearch({
            siralama,
            puanTuru,
            city_filter: cityList,
            department_filter: deptList
        });
    }

    return (
        <div className="bg-[#0f172a] p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                {/* 1. Sıralama */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sıralamanız</label>
                    <input
                        type="number"
                        value={siralama}
                        onChange={(e) => setSiralama(e.target.value)}
                        placeholder="Örn: 50000"
                        className="w-full bg-slate-900 border border-slate-700 p-3.5 rounded-xl text-white font-mono outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    />
                </div>

                {/* 2. Puan Türü */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Puan Türü</label>
                    <select
                        value={puanTuru}
                        onChange={(e) => setPuanTuru(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 p-3.5 rounded-xl text-white outline-none focus:border-indigo-500 transition-all appearance-none"
                    >
                        <option value="SAY">SAY (Sayısal)</option>
                        <option value="EA">EA (Eşit Ağırlık)</option>
                        <option value="SOZ">SOZ (Sözel)</option>
                        <option value="DIL">DIL (Dil)</option>
                    </select>
                </div>

                {/* 3. Şehir */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Şehir (Opsiyonel)</label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="İstanbul, Ankara..."
                        className="w-full bg-slate-900 border border-slate-700 p-3.5 rounded-xl text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                    />
                </div>

                {/* 4. Bölüm */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bölüm (Opsiyonel)</label>
                    <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Bilgisayar, Tıp..."
                        className="w-full bg-slate-900 border border-slate-700 p-3.5 rounded-xl text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                    />
                </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={handleSubmit}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-3"
                >
                    <Search className="w-5 h-5" />
                    ANALİZİ BAŞLAT
                </button>
            </div>
        </div>
    );
}