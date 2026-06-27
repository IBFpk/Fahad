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
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(() => {
    try {
      const cached = localStorage.getItem('cached_brand_settings');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Failed to parse cached brand settings', e);
    }
    return settingsService.getDefaultBrandSettings();
  });
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>(() => {
    try {
      const cached = localStorage.getItem('cached_whatsapp_settings');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Failed to parse cached whatsapp settings', e);
    }
    return {
      whatsapp: '923350237370',
      whatsappTemplate: 'Salam! I am interested in this product from {{brand_name}}:\n\n*{{item_title}}*\nBrand: *{{brand}}*\nPrice: *{{price}}*\n\n{{item_url}}\n\nIs this still available in stock?',
      shareTemplate: 'Check out this amazing product from {{brand_name}}!\n\n*{{item_title}}*\nBrand: *{{brand}}*\nPrice: *{{price}}*\n\nView details: {{item_url}}'
    };
  });
  const [promotionSettings, setPromotionSettings] = useState<PromotionSettings>(() => {
    try {
      const cached = localStorage.getItem('cached_promotion_settings');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Failed to parse cached promotion settings', e);
    }
    return {
      active: false,
      text: '',
      type: 'info'
    };
  });
  const [isLoading, setIsLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_brand_settings');
      return !cached;
    } catch (e) {
      return true;
    }
  });

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

      try {
        localStorage.setItem('cached_brand_settings', JSON.stringify(brand));
        localStorage.setItem('cached_whatsapp_settings', JSON.stringify(wa));
        localStorage.setItem('cached_promotion_settings', JSON.stringify(promo));
      } catch (e) {
        console.error('Failed to save settings to localStorage cache', e);
      }
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

      // Open Graph Image Sync (WhatsApp/Social Share)
      const defaultOgImage = 'https://lh3.googleusercontent.com/d/16tFR0xRBzwAjyhyD0o6UWSH2SOCm1lv5';
      const currentOgImage = brandSettings.ogImageUrl || (brandSettings.logoType === 'custom_image' && brandSettings.logoUrl ? brandSettings.logoUrl : defaultOgImage);

      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', currentOgImage);
      } else {
        const newOgImage = document.createElement('meta');
        newOgImage.setAttribute('property', 'og:image');
        newOgImage.setAttribute('content', currentOgImage);
        document.head.appendChild(newOgImage);
      }

      const twitterImage = document.querySelector('meta[property="twitter:image"]');
      if (twitterImage) {
        twitterImage.setAttribute('content', currentOgImage);
      } else {
        const newTwitterImage = document.createElement('meta');
        newTwitterImage.setAttribute('property', 'twitter:image');
        newTwitterImage.setAttribute('content', currentOgImage);
        document.head.appendChild(newTwitterImage);
      }

      // Favicon Sync
      let favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.setAttribute('rel', 'icon');
        document.head.appendChild(favicon);
      }

      let faviconShortcut = document.querySelector('link[rel="shortcut icon"]');
      if (!faviconShortcut) {
        faviconShortcut = document.createElement('link');
        faviconShortcut.setAttribute('rel', 'shortcut icon');
        document.head.appendChild(faviconShortcut);
      }

      if (brandSettings.logoType === 'custom_image' && brandSettings.logoUrl) {
        favicon.setAttribute('href', brandSettings.logoUrl);
        favicon.removeAttribute('type');
        faviconShortcut.setAttribute('href', brandSettings.logoUrl);
      } else {
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <rect width="100" height="100" rx="20" fill="%231e3a8a"/>
            <path d="M20 20 L30 20 L40 60 L80 60 L90 30 L35 30" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="45" cy="80" r="8" fill="white" />
            <circle cx="75" cy="80" r="8" fill="white" />
            <path d="M45 45 L55 45 L60 35 L70 55 L75 45 L85 45" fill="none" stroke="white" stroke-width="4" />
          </svg>
        `.trim().replace(/\s+/g, ' ');
        const svgUrl = `data:image/svg+xml,${encodeURIComponent(svgString)}`;
        favicon.setAttribute('type', 'image/svg+xml');
        favicon.setAttribute('href', svgUrl);
        faviconShortcut.setAttribute('href', svgUrl);
      }
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
