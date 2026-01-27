export interface UniversityResult {
    id: number;
    name: string;
    program_code?: string;
    university_name?: string;
    university_slug?: string;
    university_city?: string;
    university_type?: string;
    university_logo?: string | null;
    university?: { // Backward compatibility just in case
        name: string;
        city_display: string;
    };
    ranking: number;
    base_score: number;
    score_type: string;
    category?: "HAYAL" | "HEDEF" | "GÜVENLİ"; // Optional now
    language: string;
    education_type: string;
    quota?: number;
    duration?: number;
}

export interface FilterParams {
    siralama: number;
    puanTuru: string;
}