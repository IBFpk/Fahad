import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface WhatsAppSettings {
  whatsapp: string;
  whatsappTemplate: string;
}

const SETTINGS_DOC_ID = 'whatsapp';

export const settingsService = {
  async getWhatsAppSettings(): Promise<WhatsAppSettings> {
    try {
      const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as WhatsAppSettings;
      }
      // Default settings
      return {
        whatsapp: '923350237370',
        whatsappTemplate: 'Salam! I am interested in this product from Fahad Electronics:\n\n*{{item_title}}*\nPrice: *{{price}}*\n\n{{item_url}}\n\nIs this still available in stock?'
      };
    } catch (error) {
      console.error('Error fetching settings', error);
      return {
        whatsapp: '923350237370',
        whatsappTemplate: 'Salam! I am interested in this product from Fahad Electronics:\n\n*{{item_title}}*\nPrice: *{{price}}*\n\n{{item_url}}\n\nIs this still available in stock?'
      };
    }
  },

  async updateWhatsAppSettings(settings: WhatsAppSettings): Promise<void> {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(docRef, settings, { merge: true });
  }
};
