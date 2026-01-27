"use client";
import React from "react";
import { UniversityResult } from "@/types/tercih";
import { GraduationCap, MapPin } from "lucide-react"; // Düzeltildi: lucide-react

export default function ResultCard({ data }: { data: UniversityResult }) {
    const categoryColors = {
        HAYAL: "border-l-purple-500 bg-purple-50",
        HEDEF: "border-l-blue-500 bg-blue-50",
        GÜVENLİ: "border-l-emerald-500 bg-emerald-50"
    };

    const formattedRanking = data.ranking ? data.ranking.toLocaleString('tr-TR') : "---";

    return (
        <div className={`p-5 border border-slate-200 rounded-xl border-l-4 mb-4 shadow-sm transition-all hover:shadow-md ${data.category ? categoryColors[data.category] : 'bg-white'}`}>
            <div className="flex justify-between items-center">
                <div className="text-left">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.category || "Analiz"}</span>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight mt-1">{data.name}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600 font-medium">
                        <span className="flex items-center gap-1.5 text-indigo-600">
                            <GraduationCap size={16} /> {data.university.name}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MapPin size={16} className="text-slate-400" /> {data.university.city_display}
                        </span>
                    </div>
                </div>
                <div className="text-right min-w-[100px]">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SIRALAMA</p>
                    <p className="text-xl font-mono font-black text-indigo-700 tracking-tighter">{formattedRanking}</p>
                </div>
            </div>
        </div>
    );
}