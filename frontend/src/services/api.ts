import axios from 'axios';

// Backend URL
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000') + '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- TİP TANIMLAMALARI ---
export interface TrackData {
  type: 'university_view' | 'website_click' | 'phone_click' | 'dept_view' | 'house_view' | 'house_contact_click';
  slug?: string;
  id?: number;
  extra_data?: any;
}

// --- ÜNİVERSİTELER ---
export async function getUniversities() {
  try {
    const res = await fetch(`${API_URL}/universities/`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("API Error (Universities):", error);
    return [];
  }
}

export async function getUniversityDetail(slug: string) {
  try {
    const res = await fetch(`${API_URL}/universities/${slug}/`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("API Error (Uni Detail):", error);
    return null;
  }
}

// --- YURTLAR (EKSİK OLAN KISIM GELDİ) ---
export async function getDormitories(query: string = "") {
  try {
    // query parametresi (örn: ?city=ISTANBUL) varsa ekle
    const url = `${API_URL}/dormitories/${query}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("API Error (Dormitories):", error);
    return [];
  }
}

export async function getDormitoryDetail(slug: string) {
  try {
    const res = await fetch(`${API_URL}/dormitories/${slug}/`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("API Error (Dorm Detail):", error);
    return null;
  }
}

// --- ÖĞRENCİ EVLERİ (EKSİK OLAN KISIM GELDİ) ---
export async function getStudentHouses(query: string = "") {
  try {
    const url = `${API_URL}/houses/${query}`; // Backend URL'i /houses/ olarak ayarlamıştık
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("API Error (Student Houses):", error);
    return [];
  }
}

export async function getStudentHouseDetail(slug: string) {
  try {
    const res = await fetch(`${API_URL}/houses/${slug}/`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("API Error (House Detail):", error);
    return null;
  }
}

// --- ANALİTİK TAKİP ---
export async function trackActivity(data: TrackData) {
  try {
    await axios.post(`${API_URL}/track-activity/`, data);
  } catch (e) {
    console.warn("Analytics tracking failed:", e);
  }
}

export default api;