"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Filter, Download, Mail, Phone, Calendar, MoreHorizontal, Loader2 } from "lucide-react";

interface Lead {
    id: number;
    lead_type: string;
    name: string;
    email: string;
    phone: string | null;
    message: string | null;
    created_at: string;
    is_read: boolean;
}

export default function CandidatesPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function fetchLeads() {
            try {
                // Token'ı almayı unutma, çünkü burası korumalı alan
                const token = localStorage.getItem('access');
                const res = await axios.get('http://127.0.0.1:8000/api/dashboard/leads/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLeads(res.data);
            } catch (error) {
                console.error("Lead verileri çekilemedi", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLeads();
    }, []);

    // Basit Arama Filtresi
    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#00ff88]" size={32} /></div>;

    return (
        <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">

            {/* BAŞLIK ALANI */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Aday Öğrenciler</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Üniversitenizle ilgilenen ve iletişim kuran potansiyel kayıtlar.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-[#111] border border-white/10 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-white/5 transition-colors">
                        <Download size={16} />
                        Excel İndir
                    </button>
                    <button className="bg-[#00ff88] text-black px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-[#00cc6a] transition-colors shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                        <Filter size={16} />
                        Filtrele
                    </button>
                </div>
            </div>

            {/* ARAMA VE TABLO */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden">

                {/* Toolbar */}
                <div className="p-5 border-b border-white/5 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="İsim veya e-posta ile ara..."
                            className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tablo */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#111] text-gray-400 text-xs uppercase tracking-wider font-medium border-b border-white/5">
                                <th className="p-5 pl-8">Aday Bilgisi</th>
                                <th className="p-5">İlgilendiği Konu</th>
                                <th className="p-5">İletişim</th>
                                <th className="p-5">Tarih</th>
                                <th className="p-5 text-right pr-8">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredLeads.length > 0 ? (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="p-5 pl-8">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm border border-blue-500/20">
                                                    {lead.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-sm">{lead.name}</div>
                                                    <div className="text-gray-500 text-xs">{lead.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${lead.lead_type === 'SCHOLARSHIP' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                    lead.lead_type === 'INFO_REQUEST' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                }`}>
                                                {lead.lead_type === 'SCHOLARSHIP' ? 'Burs Başvurusu' :
                                                    lead.lead_type === 'INFO_REQUEST' ? 'Bilgi Talebi' : lead.lead_type}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                {lead.phone ? (
                                                    <div className="flex items-center gap-2 text-gray-400 text-xs hover:text-white transition-colors cursor-pointer">
                                                        <Phone size={12} /> {lead.phone}
                                                    </div>
                                                ) : <span className="text-gray-600 text-xs">-</span>}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                                                <Calendar size={12} /> {lead.created_at}
                                            </div>
                                        </td>
                                        <td className="p-5 text-right pr-8">
                                            <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-12 w-12 rounded-full bg-[#111] flex items-center justify-center mb-2">
                                                <Mail className="text-gray-600" />
                                            </div>
                                            <p>Henüz başvuru bulunmuyor.</p>
                                            <p className="text-xs text-gray-600">Öğrenciler form doldurduğunda burada görünecek.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="p-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
                    <span>Toplam {leads.length} kayıt gösteriliyor</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-[#111] rounded hover:bg-white/10 disabled:opacity-50" disabled>Önceki</button>
                        <button className="px-3 py-1.5 bg-[#111] rounded hover:bg-white/10 disabled:opacity-50" disabled>Sonraki</button>
                    </div>
                </div>

            </div>
        </div>
    );
}