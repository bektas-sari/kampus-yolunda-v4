"use client";

import { useState } from "react";
import { Department } from "@/types";
import { Search, GraduationCap } from "lucide-react";

interface UniversityTabsProps {
    description: string;
    departments: Department[];
}

export default function UniversityTabs({ description, departments }: UniversityTabsProps) {
    const [activeTab, setActiveTab] = useState<"about" | "departments">("about");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredDepartments = departments?.filter((dept) =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="mt-8">
            {/* Sekme Başlıkları */}
            <div className="flex border-b border-white/10 mb-8">
                <button
                    onClick={() => setActiveTab("about")}
                    className={`px-8 py-4 text-sm font-medium transition-colors relative ${activeTab === "about"
                            ? "text-blue-500"
                            : "text-gray-400 hover:text-white"
                        }`}
                >
                    Hakkında
                    {activeTab === "about" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("departments")}
                    className={`px-8 py-4 text-sm font-medium transition-colors relative ${activeTab === "departments"
                            ? "text-blue-500"
                            : "text-gray-400 hover:text-white"
                        }`}
                >
                    Bölümler ({departments?.length || 0})
                    {activeTab === "departments" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />
                    )}
                </button>
            </div>

            {/* Sekme İçeriği */}
            <div className="min-h-[400px]">
                {activeTab === "about" ? (
                    <div className="bg-[#111] p-8 rounded-3xl border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-6">Genel Bilgiler</h2>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                            {description || "Açıklama bulunmuyor."}
                        </p>
                    </div>
                ) : (
                    <div className="bg-[#111] p-8 rounded-3xl border border-white/10">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-white">Lisans Programları</h2>

                            {/* Bölüm Arama */}
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Bölüm ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        {filteredDepartments.length > 0 ? (
                            <div className="grid gap-4">
                                {filteredDepartments.map((dept) => (
                                    <div
                                        key={dept.id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                <GraduationCap className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                    {dept.name}
                                                </h3>
                                                {dept.faculty && (
                                                    <p className="text-xs text-gray-400">{dept.faculty}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs font-medium px-2 py-1 rounded bg-black/50 text-gray-300 border border-white/10">
                                                {dept.language}
                                            </span>
                                            {dept.base_score && (
                                                <span className="text-xs text-blue-400">
                                                    Taban: {dept.base_score}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                Aradığınız kriterlere uygun bölüm bulunamadı.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
