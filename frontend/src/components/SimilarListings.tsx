import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowRight, School, Building2, Home } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface SimilarItem {
    id: number;
    name?: string; // University, Dormitory
    title?: string; // StudentHouse
    slug: string;
    city: string;
    cover_image: string | null;
    price?: number; // Dormitory, StudentHouse
    dorm_type?: string; // Dormitory
    room_count?: string; // StudentHouse
    uni_type?: string; // University
}

interface SimilarListingsProps {
    title: string;
    items: SimilarItem[];
    type: 'university' | 'dormitory' | 'house';
}

export default function SimilarListings({ title, items, type }: SimilarListingsProps) {
    if (!items || items.length === 0) return null;

    const getLink = (slug: string) => {
        switch (type) {
            case 'university': return `/universite/${slug}`;
            case 'dormitory': return `/yurt/${slug}`;
            case 'house': return `/ev/${slug}`;
            default: return '#';
        }
    };

    const getTypeLabel = (item: SimilarItem) => {
        if (type === 'university') return item.uni_type === 'DEVLET' ? 'Devlet' : 'Vakıf';
        if (type === 'dormitory') return item.dorm_type;
        if (type === 'house') return item.room_count;
        return '';
    };

    return (
        <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map((item) => {
                    const getImageUrl = (path: string | null) => {
                        if (!path) return null;
                        if (path.startsWith('http')) return path;
                        return `${BACKEND_URL}${path}`;
                    };
                    const coverUrl = getImageUrl(item.cover_image);

                    const displayTitle = item.name || item.title;

                    return (
                        <Link
                            key={item.id}
                            href={getLink(item.slug)}
                            className="group block bg-[#111] rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all hover:transform hover:-translate-y-1"
                        >
                            <div className="relative h-48 w-full bg-[#1A1A1A] flex items-center justify-center">
                                {coverUrl ? (
                                    <>
                                        <Image
                                            src={coverUrl}
                                            alt={displayTitle || 'Görsel'}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    </>
                                ) : (
                                    type === 'university' ? <School className="text-gray-800 h-16 w-16" strokeWidth={1} /> :
                                        type === 'dormitory' ? <Building2 className="text-gray-800 h-16 w-16" strokeWidth={1} /> :
                                            <Home className="text-gray-800 h-16 w-16" strokeWidth={1} />
                                )}

                                <div className="absolute top-4 right-4 z-10">
                                    <span className="px-3 py-1 text-xs font-medium bg-blue-600/90 text-white rounded-full backdrop-blur-sm">
                                        {getTypeLabel(item)}
                                    </span>
                                </div>

                                <div className="absolute bottom-4 left-4 right-4 z-10">
                                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{displayTitle}</h3>
                                    <div className="flex items-center text-gray-300 text-sm">
                                        <MapPin size={14} className="mr-1 text-blue-400" />
                                        {item.city}
                                    </div>
                                </div>
                            </div>

                            {item.price && (
                                <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/5">
                                    <div className="text-sm text-gray-400">Başlangıç</div>
                                    <div className="font-bold text-blue-400">{item.price.toLocaleString('tr-TR')} ₺</div>
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
