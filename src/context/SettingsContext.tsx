import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService, BrandSettings, WhatsAppSettings, PromotionSettings } from '../services/settingsService';

interface SettingsContextType {
  brandSettings: BrandSettings;
  whatsappSettings: WhatsAppSettings;
  promotionSettings: PromotionSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(() => settingsService.getDefaultBrandSettings());
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>({
    whatsapp: '923350237370',
    whatsappTemplate: 'Salam! I am interested in this product from {{brand_name}}:\n\n*{{item_title}}*\nBrand: *{{brand}}*\nPrice: *{{price}}*\n\n{{item_url}}\n\nIs this still available in stock?',
    shareTemplate: 'Check out this amazing product from {{brand_name}}!\n\n*{{item_title}}*\nBrand: *{{brand}}*\nPrice: *{{price}}*\n\nView details: {{item_url}}'
  });
  const [promotionSettings, setPromotionSettings] = useState<PromotionSettings>({
    active: false,
    text: '',
    type: 'info'
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllSettings = async () => {
    try {
      const [brand, wa, promo] = await Promise.all([
        settingsService.getBrandSettings(),
        settingsService.getWhatsAppSettings(),
        settingsService.getPromotionSettings()
      ]);
      setBrandSettings(brand);
      setWhatsappSettings(wa);
      setPromotionSettings(promo);
    } catch (error) {
      console.error('Error fetching settings in context', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSettings();
  }, []);

  useEffect(() => {
    if (brandSettings && brandSettings.businessName) {
      document.title = `${brandSettings.businessName} | ${brandSettings.businessSub || 'Premium Store'}`;
      
      const desc = brandSettings.description || 'Premium home appliances and electronics store.';
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute('content', desc);
      
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', `${brandSettings.businessName} | ${brandSettings.businessSub || 'Premium Store'}`);
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) ogDescription.setAttribute('content', desc);

      const twitterTitle = document.querySelector('meta[property="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', `${brandSettings.businessName} | ${brandSettings.businessSub || 'Premium Store'}`);

      const twitterDescription = document.querySelector('meta[property="twitter:description"]');
      if (twitterDescription) twitterDescription.setAttribute('content', desc);
    }
  }, [brandSettings]);

  return (
    <SettingsContext.Provider value={{
      brandSettings,
      whatsappSettings,
      promotionSettings,
      isLoading,
      refreshSettings: fetchAllSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
