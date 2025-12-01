// Strapi response wrapper types
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: object;
}

// Base document type from Strapi
export interface StrapiDocument {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Shared component types
export interface ContactInfo {
  id: number;
  address?: string;
  phone?: string;
  phones?: string[];
  email?: string;
  website?: string;
}

export interface Service {
  id: number;
  serviceId?: string;
  name: string;
  description?: string;
  contact?: ContactInfo;
}

export interface StaffMember {
  id: number;
  name: string;
  phone?: string;
  specialty?: string;
}

export interface DepartmentContact {
  id: number;
  role: string;
  phone?: string;
  email?: string;
}

export interface Department {
  id: number;
  departmentId?: string;
  name: string;
  address?: string;
  description?: string;
  phone?: string;
  email?: string;
  contacts?: DepartmentContact[];
}

// Collection types
export interface Provider extends StrapiDocument {
  providerId: string;
  name: string;
  description?: string;
  services?: Service[];
  contact?: ContactInfo;
  slug?: string;
}

export interface LifeSituation extends StrapiDocument {
  situationId: string;
  name: string;
  providerRefs: string[];
  order: number;
}

export interface CrisisLine extends StrapiDocument {
  lineId?: string;
  name: string;
  phone?: string;
  description?: string;
  availability?: string;
  free: boolean;
  email?: string;
  website?: string;
  targetGroup?: string;
  order: number;
}

export interface Authority extends StrapiDocument {
  authorityId: string;
  name: string;
  address?: string;
  website?: string;
  departments?: Department[];
}

export type HealthcareCategory =
  | 'pediatrician'
  | 'generalPractitioner'
  | 'gynecology'
  | 'surgery'
  | 'cardiology'
  | 'ophthalmology'
  | 'pulmonary'
  | 'allergology'
  | 'rehabilitation'
  | 'ent'
  | 'dentist'
  | 'dentalHygiene'
  | 'physiotherapy'
  | 'optician'
  | 'pharmacy';

export interface HealthcareProvider extends StrapiDocument {
  providerId: string;
  name: string;
  category: HealthcareCategory;
  address?: string;
  phone?: string;
  phones?: string[];
  website?: string;
  staff?: StaffMember[];
}

export interface EmergencyNumber extends StrapiDocument {
  name: string;
  phone?: string;
  phones?: string[];
  order: number;
}

export interface SiteMetadata {
  id: number;
  documentId: string;
  title: string;
  city: string;
  region?: string;
  publisher?: string;
  publishDate?: string;
  language: string;
}

// Category label mappings for Czech UI
export const healthcareCategoryLabels: Record<HealthcareCategory, string> = {
  pediatrician: 'Pediatrie',
  generalPractitioner: 'Praktici pro dospělé',
  gynecology: 'Gynekologie',
  surgery: 'Chirurgie',
  cardiology: 'Kardiologie',
  ophthalmology: 'Oftalmologie',
  pulmonary: 'Plicní',
  allergology: 'Alergologie',
  rehabilitation: 'Rehabilitace',
  ent: 'ORL',
  dentist: 'Zubní lékaři',
  dentalHygiene: 'Dentální hygiena',
  physiotherapy: 'Fyzioterapie',
  optician: 'Optika',
  pharmacy: 'Lékárny',
};
