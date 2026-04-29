import React, { useEffect, useState } from 'react';
import { settingsService, PromotionSettings } from '../services/settingsService';
import { Megaphone, X, Sparkles, Flame, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PromoBanner = () => {
  const [settings, setSettings] = useState<PromotionSettings | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    settingsService.getPromotionSettings().then(setSettings);
  }, []);

  if (!settings || !settings.active || !isVisible) return null;

  const getIcon = () => {
    switch (settings.type) {
      case 'sale': return <Flame className="animate-pulse" size={18} />;
      case 'new': return <Sparkles size={18} />;
      default: return <Info size={18} />;
    }
  };

  const getBgColor = () => {
    switch (settings.type) {
      case 'sale': return 'bg-brand-red';
      case 'new': return 'bg-brand-blue';
      default: return 'bg-gray-900';
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`${getBgColor()} text-white overflow-hidden relative z-50 shadow-lg`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-grow justify-center">
            <span className="flex bg-white/20 p-1 rounded-lg">
              {getIcon()}
            </span>
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-center">
              {settings.text}
              {settings.link && (
                <a href={settings.link} className="ml-2 underline decoration-2 underline-offset-2 hover:opacity-80 transition-opacity">
                  Learn More →
                </a>
              )}
            </p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Animated accent line */}
        <motion.div 
          className="absolute bottom-0 left-0 h-[2px] bg-white/40"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </AnimatePresence>
  );
};
