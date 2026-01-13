// Backend'den gelen verinin Frontend'deki karşılığı

export interface Feature {
  id: number;
  name: string;
  icon_code: string;
}

export interface University {
  id: number;
  name: string;
  slug: string;
  city: string;
  uni_type: string; // 'DEVLET' | 'VAKIF' vb.
  logo: string | null;
  cover_image: string | null;
  department_count: number;
}

export interface Department {
  id: number;
  name: string;
  faculty: string;
  language: string;
  education_type?: string;
  quota?: number;
  base_score?: number;
  ranking?: number;
}

export interface UniversityDetail extends University {
  founded_year: number;
  rector: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  map_location: string;
  description: string;
  student_count: number;
  academician_count: number;
  features: Feature[];
  gallery_images: { id: number; image: string; caption: string }[];
  departments: Department[];
  similar: University[];
}

export interface Dormitory {
  id: number;
  name: string;
  slug: string;
  dorm_type: string;
  city: string;
  district?: string; // Backendi güncelledik, buraya da opsiyonel ekleyelim
  price: number;
  logo: string | null;
  cover_image: string | null;
  capacity?: number;
}

export interface DormitoryDetail extends Dormitory {
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  features: Feature[];
  gallery_images: { id: number; image: string }[];
  similar: Dormitory[];
}

export interface StudentHouse {
  id: number;
  title: string;
  slug: string;
  city: string;
  district: string;
  room_count: string;
  price: number;
  is_furnished: boolean;
  cover_image: string | null;
  square_meters?: number;
}

export interface StudentHouseDetail extends StudentHouse {
  description: string;
  contact_phone: string;
  features: Feature[];
  gallery_images: { id: number; image: string }[];
  similar: StudentHouse[];
}