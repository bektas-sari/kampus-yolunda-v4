
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, ExternalLink, Clock, Building2 } from "lucide-react";

// Types
interface ScholarshipDetail {
    id: number;
    title: string;
    slug: string;
    provider: string;
    logo: string | null;
    description: string;
    requirements: string;
    amount: string;
    deadline: string;
    city: string | null;
    category: string;
    application_url: string;
    is_active: boolean;
}

async function getScholarship(slug: string): Promise<ScholarshipDetail | null> {
    try {
        // Using the correct endpoint: /api/scholarships/{slug}/
        const res = await fetch(`http://127.0.0.1:8000/api/scholarships/${slug}/`, {
            cache: "no-store"
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Failed to fetch scholarship:", error);
        return null;
    }
}

// Ensure params is handled correctly (awaiting it due to Next.js 15+ potential)
export default async function BursDetayPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const scholarship = await getScholarship(slug);

    if (!scholarship) {
        notFound();
    }

    // Calculate Days Left for display
    const deadlineDate = new Date(scholarship.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(23, 59, 59, 999);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header */}
                    <div className="flex items-center gap-6 p-6 bg-zinc-900/40 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
                        <div className="w-24 h-24 relative rounded-xl overflow-hidden bg-white border border-zinc-700 flex-shrink-0 p-2">
                            {scholarship.logo ? (
                                <Image src={scholarship.logo} alt={scholarship.provider} fill className="object-contain p-1" />
                            ) : (
                                <Building2 className="w-10 h-10 m-auto text-zinc-400" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">{scholarship.title}</h1>
                            <p className="text-xl text-[#00ff88] font-medium">{scholarship.provider}</p>
                        </div>
                    </div>

                    {/* Rich Text Content: Description */}
                    <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
                            Burs Detayları
                        </h2>
                        <div
                            className="prose prose-invert prose-lg max-w-none text-gray-300 prose-headings:text-white prose-a:text-[#00ff88] prose-strong:text-white"
                            dangerouslySetInnerHTML={{ __html: scholarship.description }}
                        />
                    </div>

                    {/* Rich Text Content: Requirements */}
                    <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
                            Başvuru Şartları
                        </h2>
                        <div
                            className="prose prose-invert prose-lg max-w-none text-gray-300 prose-headings:text-white prose-li:marker:text-[#00ff88]"
                            dangerouslySetInnerHTML={{ __html: scholarship.requirements }}
                        />
                    </div>
                </div>

                {/* Right Column: Sticky Action Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-zinc-900 border border-zinc-700 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
                        {/* Amount Box */}
                        <div className="text-center mb-8 bg-black/20 p-6 rounded-2xl border border-white/5">
                            <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider font-semibold">Burs Miktarı</p>
                            <p className="text-4xl md:text-5xl font-bold text-[#00ff88] drop-shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                                {scholarship.amount}
                            </p>
                        </div>

                        {/* Meta Info */}
                        <div className="space-y-4 mb-8 px-2">
                            <div className="flex items-center justify-between text-gray-300 border-b border-zinc-800 pb-3">
                                <span className="flex items-center gap-2 text-zinc-400"><Clock className="w-4 h-4" /> Son Başvuru</span>
                                <span className={`font-semibold ${daysLeft <= 3 ? 'text-red-500' : 'text-white'}`}>
                                    {scholarship.deadline} ({daysLeft < 0 ? 'Doldu' : `${daysLeft} Gün`})
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-gray-300 border-b border-zinc-800 pb-3">
                                <span className="flex items-center gap-2 text-zinc-400"><MapPin className="w-4 h-4" /> Şehir / Kapsam</span>
                                <span className="font-semibold text-white truncate max-w-[150px]">
                                    {scholarship.city ? scholarship.city : "Tüm Türkiye"}
                                </span>
                            </div>
                        </div>

                        {/* CTA Button */}
                        {scholarship.is_active && daysLeft >= 0 ? (
                            <a
                                href={scholarship.application_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#00ff88] hover:bg-[#00cc6a] text-black font-extrabold text-lg py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(0,255,136,0.25)] flex items-center justify-center gap-2 group"
                            >
                                BAŞVURU YAP <ExternalLink className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                            </a>
                        ) : (
                            <button
                                disabled
                                className="w-full bg-zinc-800 text-zinc-500 font-bold text-lg py-5 rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                BAŞVURU KAPANDI
                            </button>
                        )}

                        <p className="text-xs text-center text-zinc-500 mt-6 leading-relaxed">
                            "Başvuru Yap" butonuna tıkladığınızda resmi başvuru sayfasına yönlendirileceksiniz.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
