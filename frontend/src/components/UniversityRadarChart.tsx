"use client";

import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

interface StatsProps {
    stats?: {
        academic_score: number;
        campus_score: number;
        social_score: number; // CSV'deki 'Yönetim' buraya denk geliyor
        career_score: number;
        tech_score: number;   // CSV'deki 'Öğrenme İmkanları' buraya denk geliyor
        city_score: number;   // CSV'deki 'Akademik Destek' (veya Şehir) 
    };
}

const UniversityRadarChart: React.FC<StatsProps> = ({ stats }) => {
    // Veri yoksa varsayılan göster
    const safeStats = stats || {
        academic_score: 50,
        campus_score: 50,
        social_score: 50,
        career_score: 50,
        tech_score: 50,
        city_score: 50,
    };

    // TÜMA BAŞLIKLARIYLA EŞLEŞTİRME
    // academic_score -> Öğrenim Deneyimi
    // campus_score   -> Yerleşke ve Yaşam
    // social_score   -> Kurum Yönetimi (TÜMA'daki Yönetim)
    // tech_score     -> Öğrenme İmkanları (TÜMA'daki İmkanlar)
    // career_score   -> Kariyer Desteği
    // city_score     -> Akademik Destek (Burayı Şehir yerine Akademik Destek olarak etiketleyelim)

    const data = [
        { subject: 'Öğrenim Deneyimi', A: safeStats.academic_score, fullMark: 100 },
        { subject: 'Akademik Destek', A: safeStats.city_score, fullMark: 100 }, // City slotunu Akademik Destek yaptık
        { subject: 'Yerleşke & Yaşam', A: safeStats.campus_score, fullMark: 100 },
        { subject: 'Kurum Yönetimi', A: safeStats.social_score, fullMark: 100 },
        { subject: 'Öğrenme İmkanları', A: safeStats.tech_score, fullMark: 100 },
        { subject: 'Kariyer Desteği', A: safeStats.career_score, fullMark: 100 },
    ];

    return (
        <div className="w-full h-[320px] flex flex-col items-center justify-center bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    TÜMA 2025 Memnuniyet Analizi
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Resmi Veri
                </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Memnuniyet Puanı"
                        dataKey="A"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fill="#8b5cf6"
                        fillOpacity={0.4}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                        // HATA VEREN SATIRI ŞÖYLE DEĞİŞTİR (value: any yaparak):
                        formatter={(value: any) => [`${value}/100`, 'Puan']}
                    />
                </RadarChart>
            </ResponsiveContainer>

            <div className="flex justify-between w-full px-4 mt-1">
                <div className="text-[10px] text-slate-500">
                    *Veriler TÜMA 2025 raporundan alınmıştır.
                </div>
            </div>
        </div>
    );
};

export default UniversityRadarChart;