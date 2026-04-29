export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string; // Keep for backward compatibility/main image
  images?: string[]; // Multiple images support
  brand: string;
  specifications: Record<string, string>;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface BusinessInfo {
  name: string;
  email: string;
  phone: string[];
  address: string[];
  hours: Record<string, string>;
  whatsapp: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}
