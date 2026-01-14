"use client";

import { X, MapPin, BedDouble, Square, CheckCircle2, Phone, Calendar, Armchair, Share2, Image as ImageIcon, Sparkles } from "lucide-react";
// Dinamik ikonları çekmek için tüm kütüphaneyi import ediyoruz
import * as LucideIcons from "lucide-react";
import { useState, useEffect } from "react";
import LeadModal from "./LeadModal";
import { trackActivity } from "@/services/api";

interface HouseDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    house: any;
}

const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder_house.jpg";
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}${path}`;
};

// --- DİNAMİK İKON BİLEŞENİ ---
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    // @ts-ignore
    const IconComponent = LucideIcons[name];
    // Eğer ikon bulunamazsa varsayılan olarak Sparkles (Parıltı) göster
    if (!IconComponent) return <Sparkles className={className} />;
    return <IconComponent className={className} />;
};

export default function HouseDetailModal({ isOpen, onClose, house }: HouseDetailModalProps) {
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [gallery, setGallery] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen && house) {
            try {
                trackActivity({
                    type: 'house_view',
                    id: house.id,
                    slug: house.slug,
                    extra_data: { price: house.price }
                });
            } catch (e) { console.error(e); }

            const images = [];
            if (house.cover_image) images.push(getImageUrl(house.cover_image));

            if (house.gallery_images && Array.isArray(house.gallery_images)) {
                house.gallery_images.forEach((imgObj: any) => {
                    if (imgObj.image) images.push(getImageUrl(imgObj.image));
                });
            }

            setGallery(images);
            setActiveImage(images[0] || "/placeholder_house.jpg");
        }
    }, [isOpen, house]);

    if (!isOpen || !house) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

                <div className="relative w-full max-w-5xl bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-300">

                    <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-red-500/80 transition-colors backdrop-blur-md">
                        <X size={20} />
                    </button>

                    {/* --- SOL TARAF (GALERİ) --- */}
                    <div className="w-full md:w-[55%] relative bg-black flex flex-col">
                        <div className="relative h-64 md:h-full w-full group">
                            <img
                                src={activeImage || "/placeholder_house.jpg"}
                                alt={house.title}
                                className="w-full h-full object-contain md:object-cover bg-gray-900 transition-opacity duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent md:hidden" />

                            <div className="absolute bottom-4 left-4 md:hidden">
                                <span className="bg-[#00ff88] text-black text-xs font-bold px-2 py-1 rounded mb-1 inline-block">{house.city}</span>
                                <h2 className="text-xl font-bold text-white line-clamp-1">{house.title}</h2>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {gallery.length > 1 && (
                            <div className="absolute bottom-4 left-4 right-4 hidden md:flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 z-10">
                                {gallery.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${activeImage === img ? "border-[#00ff88] scale-110" : "border-white/20 opacity-70 hover:opacity-100"}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt={`thumb-${idx}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                        {gallery.length > 1 && (
                            <div className="flex md:hidden gap-2 overflow-x-auto p-3 bg-[#111] border-b border-white/10">
                                {gallery.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${activeImage === img ? "border-[#00ff88]" : "border-white/20 opacity-70"}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt={`thumb-mob-${idx}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- SAĞ TARAF (BİLGİ) --- */}
                    <div className="w-full md:w-[45%] p-6 md:p-8 flex flex-col overflow-y-auto bg-[#111]">

                        <div className="hidden md:block mb-6">
                            <span className="inline-block bg-[#00ff88] text-black text-xs font-bold px-3 py-1 rounded-lg mb-2 shadow-lg">
                                {house.city}
                            </span>
                            <h2 className="text-2xl font-bold text-white leading-tight">
                                {house.title}
                            </h2>
                            <div className="flex items-center gap-2 text-gray-400 mt-2 text-sm">
                                <MapPin size={16} className="text-[#00ff88]" />
                                {house.district} / {house.city}
                            </div>
                        </div>

                        <div className="flex items-end justify-between mb-6 pb-6 border-b border-white/10">
                            <div>
                                <p className="text-gray-400 text-xs uppercase font-bold mb-1">AYLIK KİRA</p>
                                <div className="text-3xl font-bold text-[#00ff88]">
                                    {house.price.toLocaleString()} ₺
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Temel Bilgiler Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white/5 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                                <BedDouble className="text-blue-400 shrink-0" size={20} />
                                <div><div className="text-[10px] text-gray-500 uppercase font-bold">Oda</div><div className="text-white font-bold">{house.room_count}</div></div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                                <Square className="text-purple-400 shrink-0" size={20} />
                                <div><div className="text-[10px] text-gray-500 uppercase font-bold">Boyut</div><div className="text-white font-bold">{house.square_meters || '-'} m²</div></div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                                <Armchair className="text-yellow-400 shrink-0" size={20} />
                                <div><div className="text-[10px] text-gray-500 uppercase font-bold">Eşya</div><div className="text-white font-bold">{house.is_furnished ? "Eşyalı" : "Boş"}</div></div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                                <ImageIcon className="text-pink-400 shrink-0" size={20} />
                                <div><div className="text-[10px] text-gray-500 uppercase font-bold">Foto</div><div className="text-white font-bold">{gallery.length} Adet</div></div>
                            </div>
                        </div>

                        {/* --- YENİ EKLENEN KISIM: ÖZELLİKLER (FEATURES) --- */}
                        {house.features && house.features.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                                    <Sparkles size={16} className="text-[#00ff88]" /> Ev İmkanları
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {house.features.map((feature: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-xs text-gray-300 hover:border-[#00ff88]/50 hover:text-white transition-colors">
                                            {/* Backend'den gelen 'icon' ismini burada render ediyoruz */}
                                            <DynamicIcon name={feature.icon} className="text-[#00ff88] w-4 h-4" />
                                            <span className="font-medium">{feature.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* ------------------------------------------------ */}

                        <div className="mb-8 flex-1">
                            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                                <CheckCircle2 size={18} className="text-[#00ff88]" /> Ev Hakkında
                            </h4>
                            <div className="text-gray-400 text-sm leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                                {house.description || "Bu ilan için detaylı açıklama girilmemiş."}
                            </div>
                        </div>

                        <button
                            onClick={() => { setShowLeadForm(true); trackActivity({ type: 'house_contact_click', id: house.id }); }}
                            className="w-full bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] flex items-center justify-center gap-2 group mt-auto"
                        >
                            <Phone size={20} className="group-hover:scale-110 transition-transform" />
                            İlan Sahibiyle Görüş
                        </button>

                    </div>
                </div>
            </div>

            <LeadModal isOpen={showLeadForm} onClose={() => setShowLeadForm(false)} universityName={`İlan: ${house.title}`} />
        </>
    );
}