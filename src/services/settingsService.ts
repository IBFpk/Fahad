import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface WhatsAppSettings {
  whatsapp: string;
  whatsappTemplate: string;
  shareTemplate?: string;
}

export interface PromotionSettings {
  active: boolean;
  text: string;
  link?: string;
  type: 'info' | 'sale' | 'new';
}

export interface BankAccount {
  bank: string;
  title: string;
  acc: string;
  iban: string;
  branch?: string;
  color?: string;
}

export interface BrandSettings {
  businessName: string;
  businessSub: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  logoUrl?: string;
  logoType?: 'icon' | 'custom_image';
  bankAccounts: BankAccount[];
}

const WHATSAPP_DOC_ID = 'whatsapp';
const PROMO_DOC_ID = 'promotion';
const BRAND_DOC_ID = 'brand';

export const settingsService = {
  async getBrandSettings(): Promise<BrandSettings> {
    try {
      const docRef = doc(db, 'settings', BRAND_DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Make sure bankAccounts is always an array
        if (!data.bankAccounts) {
          data.bankAccounts = [];
        }
        return data as BrandSettings;
      }
      return this.getDefaultBrandSettings();
    } catch (error) {
      console.error('Error fetching brand settings', error);
      return this.getDefaultBrandSettings();
    }
  },

  getDefaultBrandSettings(): BrandSettings {
    return {
      businessName: 'Fahad Electronics',
      businessSub: 'Beauty Shop',
      description: 'Your trusted partner for home appliances and corporate cooling solutions. Deals in Split AC, Floor Standing, LED TV, Refrigerator & more.',
      address: '#17, Beauty House, Abdullah Haroon Road, Saddar, Karachi. Near Bank Of Punjab',
      phone: '021-32761001',
      email: 'farhanmalikfahadelectronic@gmail.com',
      instagramUrl: '#',
      facebookUrl: '#',
      twitterUrl: '#',
      logoType: 'icon',
      logoUrl: '',
      bankAccounts: [
        {
          bank: "Meezan Bank",
          title: "Fahad Electronics",
          acc: "01530104382610",
          iban: "PK41MEZN0001530104382610",
          branch: "Abdullah Haroon Road KHI",
          color: "bg-purple-50 border-purple-200"
        },
        {
          bank: "Meezan Bank",
          title: "Fahad",
          acc: "01530100532611",
          iban: "PK61MEZN0001530100532611",
          branch: "Abdullah Haroon Road KHI",
          color: "bg-purple-100/50 border-purple-200"
        },
        {
          bank: "JS BANK",
          title: "MUHAMMAD FAISAL RAZA",
          acc: "9606 0000 0056 6747",
          iban: "PK89 JSBL 9606 0000 0056 6747",
          color: "bg-yellow-50 border-yellow-200"
        },
        {
          bank: "Askari Bank",
          title: "Fahad",
          acc: "0007 2602 0000 0311",
          iban: "PK86 ASCM 0007 2602 0000 0311",
          color: "bg-blue-50 border-blue-200"
        },
        {
          bank: "Faysal Bank",
          title: "Fahad Electronics",
          acc: "3485 3010 0000 1047",
          iban: "PK33 FAYS 3485 3010 0000 1047",
          color: "bg-blue-100/50 border-blue-200"
        },
        {
          bank: "Bank AL Habib Limited",
          title: "MUHAMMAD FAISAL RAZA",
          acc: "5056 0081 0001 2001",
          iban: "PK02 BAHL 5056 0081 0001 2001",
          color: "bg-green-100/50 border-green-200"
        },
        {
          bank: "HABIBMETRO",
          title: "Fahad Electronics",
          acc: "0120 02714019 7032",
          iban: "PK31MPBL 0120 02714019 7032",
          color: "bg-green-50 border-green-200"
        },
        {
          bank: "Summit Bank",
          title: "Fahad Electronics",
          acc: "2160 2714 0118 013",
          iban: "PK91SUMB 0216 027140118013",
          color: "bg-orange-50 border-orange-200"
        },
        {
          bank: "Bank Alfalah",
          title: "FAHAD ELECTRONICS",
          acc: "00151009017819",
          iban: "PK97ALFH0015001009017819",
          color: "bg-red-50 border-red-200"
        },
        {
          bank: "HBL",
          title: "Fahad Electronics",
          acc: "0000347900919903",
          iban: "PK84 HABB 0000347900919903",
          color: "bg-green-50 border-green-200"
        },
        {
          bank: "BankIslami",
          title: "Fahad Electronics",
          acc: "0108600227300001",
          iban: "PK86BKIP 0108600227300001",
          color: "bg-blue-50 border-blue-200"
        },
        {
          bank: "UBL",
          title: "Fahad Electronics",
          acc: "0109000303443238",
          iban: "PK88UNIL0109000303443238",
          color: "bg-cyan-50 border-cyan-200"
        }
      ]
    };
  },

  async updateBrandSettings(settings: BrandSettings): Promise<void> {
    const docRef = doc(db, 'settings', BRAND_DOC_ID);
    const sanitized = JSON.parse(JSON.stringify(settings));
    await setDoc(docRef, sanitized, { merge: true });
  },
  async getWhatsAppSettings(): Promise<WhatsAppSettings> {
    try {
      const docRef = doc(db, 'settings', WHATSAPP_DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as WhatsAppSettings;
      }
      return {
        whatsapp: '923350237370',
        whatsappTemplate: 'Salam! I am interested in this product from Fahad Electronics:\n\n*{{item_title}}*\nBrand: *{{brand}}*\nPrice: *{{price}}*\n\n{{item_url}}\n\nIs this still available in stock?',
        shareTemplate: 'Check out this amazing product from Fahad Electronics!\n\n*{{item_title}}*\nBrand: *{{brand}}*\nPrice: *{{price}}*\n\nView details: {{item_url}}'
      };
    } catch (error) {
      console.error('Error fetching whatsapp settings', error);
      return {
        whatsapp: '923350237370',
        whatsappTemplate: 'Salam! I am interested in this product from Fahad Electronics:\n\n*{{item_title}}*\nBrand: *{{brand}}*\nPrice: *{{price}}*\n\n{{item_url}}\n\nIs this still available in stock?',
        shareTemplate: 'Check out this amazing product from Fahad Electronics!\n\n*{{item_title}}*\nBrand: *{{brand}}*\nPrice: *{{price}}*\n\nView details: {{item_url}}'
      };
    }
  },

  async updateWhatsAppSettings(settings: WhatsAppSettings): Promise<void> {
    const docRef = doc(db, 'settings', WHATSAPP_DOC_ID);
    const sanitized = JSON.parse(JSON.stringify(settings));
    await setDoc(docRef, sanitized, { merge: true });
  },

  async getPromotionSettings(): Promise<PromotionSettings> {
    try {
      const docRef = doc(db, 'settings', PROMO_DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as PromotionSettings;
      }
      return {
        active: true,
        text: '🔥 Eid Special Sale: Get up to 20% OFF on all Refrigerators and ACs! Limited Time Offer.',
        type: 'sale'
      };
    } catch (error) {
      console.error('Error fetching promo settings', error);
      return {
        active: false,
        text: '',
        type: 'info'
      };
    }
  },

  async updatePromotionSettings(settings: PromotionSettings): Promise<void> {
    const docRef = doc(db, 'settings', PROMO_DOC_ID);
    const sanitized = JSON.parse(JSON.stringify(settings));
    await setDoc(docRef, sanitized, { merge: true });
  }
};
