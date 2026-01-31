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
        social_score: number;
        career_score: number;
        tech_score: number;
        city_score: number;
    };
}

const UniversityRadarChart: React.FC<StatsProps> = ({ stats }) => {
    // Veri yoksa varsayılan 50 göster
    const safeStats = stats || {
        academic_score: 50,
        campus_score: 50,
        social_score: 50,
        career_score: 50,
        tech_score: 50,
        city_score: 50,
    };

    // TÜMA Verilerini Ekrana Yansıtma
    const data = [
        { subject: 'Akademik', A: safeStats.academic_score, fullMark: 100 },
        { subject: 'Kampüs', A: safeStats.campus_score, fullMark: 100 },
        { subject: 'Şehir', A: safeStats.city_score, fullMark: 100 },
        { subject: 'Kariyer', A: safeStats.career_score, fullMark: 100 },
        { subject: 'Yönetim', A: safeStats.social_score, fullMark: 100 },
        { subject: 'İmkanlar', A: safeStats.tech_score, fullMark: 100 },
    ];

    return (
        <div className="w-full h-[320px] flex flex-col items-center justify-center bg-slate-900/50 rounded-xl p-2 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    TÜMA 2025 Analizi
                </h3>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                {/* outerRadius %65'e çekildi ki yazılar kesilmesin */}
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 600 }}
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
                        // TypeScript hatası için düzeltme:
                        formatter={(value: any) => [`${value}/100`, 'Puan']}
                    />
                </RadarChart>
            </ResponsiveContainer>

            <div className="text-[10px] text-slate-600 mt-1">
                *Veriler TÜMA raporundan derlenmiştir.
            </div>
        </div>
    );
};

export default UniversityRadarChart;