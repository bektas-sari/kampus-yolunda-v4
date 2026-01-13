'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Filter, ChevronDown, Check } from 'lucide-react';

export type FilterType = 'text' | 'select' | 'radio' | 'range' | 'checkbox_group';

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterConfig {
    key: string;
    label: string;
    type: FilterType;
    options?: FilterOption[]; // For select, radio, checkbox_group
    placeholder?: string;     // For text
    min?: number;             // For range
    max?: number;             // For range
}

interface FilterSidebarProps {
    filters: FilterConfig[];
    isOpen: boolean; // For mobile visibility
    onClose: () => void;
}

export default function FilterSidebar({ filters, isOpen, onClose }: FilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state to manage inputs before applying (optional, but here we apply instantly or on specific actions)
    // For simplicity in this version, we'll apply changes immediately or use a local state map.

    const handleFilterChange = (key: string, value: string | null) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (value === null || value === '') {
            current.delete(key);
        } else {
            current.set(key, value);
        }

        const search = current.toString();
        const query = search ? `?${search}` : "";

        router.push(`${window.location.pathname}${query}`, { scroll: false });
    };

    // Range handlers (min/max)
    const handleRangeChange = (keyPrefix: string, type: 'min' | 'max', value: string) => {
        const paramKey = type === 'min' ? `${keyPrefix}_min` : `${keyPrefix}_max`; // e.g. price_min
        // Backend expects usually min_price, max_price so let's allow config to define exact keys 
        // OR we stick to a convention. 
        // Let's assume the config key IS the param key for simple inputs.
        // For range, let's look at how backend is setup: min_price, max_price.
        // So the config passed should probably be two separate number inputs OR a special range type.
        // Let's stick to standard input updates for now. 
        handleFilterChange(paramKey, value);
    };

    // Special handling for the 'range' type which implies two inputs (min/max)
    // The key in config (e.g. 'price') will be used as suffix? No, let's conform to backend: min_price, max_price.
    // To keep it generic, let's assume 'range' type in config uses 'min_key' and 'max_key' if we were building a complex one.
    // But to keep it simple and perfectly matching our backend plan:
    // We will render 'range' as two inputs: Min and Max.
    // The Param keys will be derived: `min_${key}` and `max_${key}` (e.g. min_price, max_price).

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden" onClick={onClose} />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-80 bg-[#111] border-r border-white/10 p-6 overflow-y-auto transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-72 lg:block lg:border-none lg:bg-transparent lg:p-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-between mb-8 lg:hidden">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Filter className="text-[#00ff88]" /> Filtrele
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-8">
                    {filters.map((filter) => (
                        <div key={filter.key} className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{filter.label}</h3>

                            {/* TEXT INPUT */}
                            {filter.type === 'text' && (
                                <input
                                    type="text"
                                    placeholder={filter.placeholder || "Ara..."}
                                    defaultValue={searchParams.get(filter.key) || ''}
                                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00ff88] focus:outline-none transition-colors"
                                />
                            )}

                            {/* SELECT INPUT */}
                            {filter.type === 'select' && (
                                <div className="relative">
                                    <select
                                        value={searchParams.get(filter.key) || ''}
                                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm appearance-none focus:border-[#00ff88] focus:outline-none cursor-pointer"
                                    >
                                        <option value="">Tümü</option>
                                        {filter.options?.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                </div>
                            )}

                            {/* RADIO GROUP */}
                            {filter.type === 'radio' && (
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${!searchParams.get(filter.key) ? 'border-[#00ff88] bg-[#00ff88]/10' : 'border-white/20 bg-transparent'}`}>
                                            {!searchParams.get(filter.key) && <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88]" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name={filter.key}
                                            className="hidden"
                                            checked={!searchParams.get(filter.key)}
                                            onChange={() => handleFilterChange(filter.key, null)}
                                        />
                                        <span className={`text-sm transition-colors ${!searchParams.get(filter.key) ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>Tümü</span>
                                    </label>

                                    {filter.options?.map((opt) => {
                                        const isSelected = searchParams.get(filter.key) === opt.value;
                                        return (
                                            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-[#00ff88] bg-[#00ff88]/10' : 'border-white/20 bg-transparent'}`}>
                                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88]" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={filter.key}
                                                    value={opt.value}
                                                    className="hidden"
                                                    checked={isSelected}
                                                    onChange={() => handleFilterChange(filter.key, opt.value)}
                                                />
                                                <span className={`text-sm transition-colors ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                                    {opt.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {/* RANGE INPUTS (Min/Max) */}
                            {filter.type === 'range' && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        defaultValue={searchParams.get(`min_${filter.key}`) || ''}
                                        onChange={(e) => handleFilterChange(`min_${filter.key}`, e.target.value)}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-[#00ff88] focus:outline-none transition-colors"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        defaultValue={searchParams.get(`max_${filter.key}`) || ''}
                                        onChange={(e) => handleFilterChange(`max_${filter.key}`, e.target.value)}
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-[#00ff88] focus:outline-none transition-colors"
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={() => router.push(window.location.pathname)}
                        className="w-full py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all text-sm font-bold"
                    >
                        Filtreleri Temizle
                    </button>
                </div>
            </aside>
        </>
    );
}
