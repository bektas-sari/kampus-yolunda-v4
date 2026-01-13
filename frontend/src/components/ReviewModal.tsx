"use client";

import React, { useState } from "react";
import axios from "axios";
import { Star, X, CheckCircle, Loader2 } from "lucide-react";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetName: string; // Örn: "ODTÜ"
    targetType: "university" | "dormitory" | "venue"; // Backend'deki model_type
    targetId: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function ReviewModal({ isOpen, onClose, targetName, targetType, targetId }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [authorName, setAuthorName] = useState("");
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal kapalıysa render etme
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError("Lütfen bir puan seçiniz.");
            return;
        }
        if (!comment.trim()) {
            setError("Lütfen yorumunuzu yazınız.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await axios.post(`${BACKEND_URL}/api/reviews/create/`, {
                model_type: targetType,
                object_id: targetId,
                author_name: authorName || "Misafir Kullanıcı",
                rating: rating,
                comment: comment
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setRating(0);
                setComment("");
                setAuthorName("");
            }, 3000); // 3 saniye sonra kapat

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || "Bir hata oluştu. Lütfen tekrar deneyiniz.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md relative overflow-hidden shadow-2xl">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {success ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                        <div className="w-16 h-16 bg-[#00ff88]/20 rounded-full flex items-center justify-center mb-4 text-[#00ff88]">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Teşekkürler!</h3>
                        <p className="text-gray-400">Yorumunuz başarıyla alındı ve onay sürecine eklendi.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8">
                        <h2 className="text-2xl font-bold text-white mb-1">Değerlendir</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            <span className="text-[#00ff88] font-bold">{targetName}</span> hakkındaki deneyimlerini paylaş.
                        </p>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        {/* PUANLAMA */}
                        <div className="mb-6 flex flex-col items-center">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2">Puanın</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setRating(star)} // Hover efekti opsiyonel
                                        className={`transition-transform duration-200 hover:scale-110 ${rating >= star ? "text-yellow-400" : "text-gray-700"}`}
                                    >
                                        <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* İSİM (Opsiyonel) */}
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Görünen İsim (İsteğe Bağlı)</label>
                            <input
                                type="text"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-[#00ff88] outline-none transition-colors"
                                placeholder="Adınız Soyadınız veya Takma Ad"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                            />
                        </div>

                        {/* YORUM */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Yorumun</label>
                            <textarea
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-[#00ff88] outline-none transition-colors min-h-[100px] resize-none"
                                placeholder="Deneyimlerini burada anlat..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Değerlendirmeyi Gönder"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
