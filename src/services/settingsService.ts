import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface WhatsAppSettings {
  whatsapp: string;
  whatsappTemplate: string;
}

export interface PromotionSettings {
  active: boolean;
  text: string;
  link?: string;
  type: 'info' | 'sale' | 'new';
}

const WHATSAPP_DOC_ID = 'whatsapp';
const PROMO_DOC_ID = 'promotion';

export const settingsService = {
  async getWhatsAppSettings(): Promise<WhatsAppSettings> {
    try {
      const docRef = doc(db, 'settings', WHATSAPP_DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as WhatsAppSettings;
      }
      return {
        whatsapp: '923350237370',
        whatsappTemplate: 'Salam! I am interested in this product from Fahad Electronics:\n\n*{{item_title}}*\nPrice: *{{price}}*\n\n{{item_url}}\n\nIs this still available in stock?'
      };
    } catch (error) {
      console.error('Error fetching whatsapp settings', error);
      return {
        whatsapp: '923350237370',
        whatsappTemplate: 'Salam! I am interested in this product from Fahad Electronics:\n\n*{{item_title}}*\nPrice: *{{price}}*\n\n{{item_url}}\n\nIs this still available in stock?'
      };
    }
  },

  async updateWhatsAppSettings(settings: WhatsAppSettings): Promise<void> {
    const docRef = doc(db, 'settings', WHATSAPP_DOC_ID);
    await setDoc(docRef, settings, { merge: true });
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
    await setDoc(docRef, settings, { merge: true });
  }
};
