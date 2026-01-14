"use client";

import { X, CheckCircle, Loader2, Send } from "lucide-react";
import { useState } from "react";
import axios from "axios";

// Modalın hangi sayfada açıldığını belirten tipler
type SourceType = 'university' | 'dormitory' | 'house' | 'scholarship';

interface LeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    universityName: string; // Bu başlık olarak kullanılır (Örn: Ev Başlığı, Yurt Adı)
    sourceType?: SourceType; // YENİ ÖZELLİK: Kaynak Tipi (Varsayılan: university)
}

export default function LeadModal({ isOpen, onClose, universityName, sourceType = 'university' }: LeadModalProps) {
    const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    // --- DİNAMİK METİN AYARLAYICI ---
    const getTexts = () => {
        switch (sourceType) {
            case 'house':
                return {
                    title: "İlan Sahibiyle Görüş",
                    subtitle: "İletişim bilgilerinizi bırakın, ev sahibi veya emlak danışmanı size ulaşsın.",
                    success: "Talebiniz ilan sahibine iletildi! En kısa sürede dönüş yapılacaktır.",
                    button: "İlan Sahibine Gönder"
                };
            case 'dormitory':
                return {
                    title: "Fiyat ve Bilgi Al",
                    subtitle: "Yurt yetkililerinin size ulaşıp güncel fiyatları ve oda durumunu iletmesi için formu doldurun.",
                    success: "Bilgileriniz yurt yönetimine iletildi. Sizinle iletişime geçecekler.",
                    button: "Yurda Gönder"
                };
            case 'scholarship':
                return {
                    title: "Burs Bilgisi Al",
                    subtitle: "Burs veren kurumun sizinle iletişime geçmesi için bilgilerinizi bırakın.",
                    success: "Başvurunuz kuruma iletildi.",
                    button: "Başvuruyu İlet"
                };
            default: // university
                return {
                    title: "Bilgi ve İletişim Talebi",
                    subtitle: "Üniversite yetkililerinin size ulaşıp detaylı bilgi vermesi için formu doldurun.",
                    success: "Talebiniz üniversiteye iletildi! Yetkililer en kısa sürede sizinle iletişime geçecektir.",
                    button: "Talebi Gönder"
                };
        }
    };

    const texts = getTexts();
    // --------------------------------

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Backend'e gönder
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/leads/create/`, {
                lead_type: sourceType === 'house' ? 'INFO_REQUEST' : 'INFO_REQUEST', // İlerde özelleştirilebilir
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                message: `İlgilenilen Kayıt: ${universityName} (Tip: ${sourceType}) - Mesaj: ${formData.message}`
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setFormData({ name: "", phone: "", email: "", message: "" });
            }, 3000);
        } catch (err) {
            setError("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-16 h-16 bg-[#00ff88]/20 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="text-[#00ff88]" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Harika! 🎉</h3>
                        <p className="text-gray-400">{texts.success}</p>
                    </div>
                ) : (
                    <>
                        <h3 className="text-xl font-bold text-white mb-2">{texts.title}</h3>
                        <p className="text-sm text-gray-400 mb-6">
                            <span className="text-[#00ff88] font-bold">{universityName}</span> için {texts.subtitle}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Adınız Soyadınız</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#00ff88] outline-none transition-colors"
                                    placeholder="Örn: Ahmet Yılmaz"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Telefon Numaranız</label>
                                <input
                                    required
                                    type="tel"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#00ff88] outline-none transition-colors"
                                    placeholder="0555 123 45 67"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">E-posta Adresiniz</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#00ff88] outline-none transition-colors"
                                    placeholder="ahmet@ornek.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Varsa Mesajınız (İsteğe bağlı)</label>
                                <textarea
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#00ff88] outline-none transition-colors resize-none h-20"
                                    placeholder="Ev ne zaman müsait? Depozito ne kadar?"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            {error && <p className="text-red-400 text-xs">{error}</p>}

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                {texts.button}
                            </button>

                            <p className="text-[10px] text-center text-gray-600 mt-4">
                                Göndererek KVKK aydınlatma metnini kabul etmiş olursunuz.
                            </p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}