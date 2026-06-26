import React from 'react';
import { cn } from '../lib/utils';
import { useSettings } from '../context/SettingsContext';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, showText = true }) => {
  const { brandSettings } = useSettings();
  const { businessName, businessSub, logoType, logoUrl } = brandSettings;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {logoType === 'custom_image' && logoUrl ? (
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg shadow-md overflow-hidden bg-white border border-gray-100">
          <img src={logoUrl} alt={businessName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      ) : (
        <div className="relative flex items-center justify-center w-10 h-10 bg-brand-blue rounded-lg shadow-md overflow-hidden">
          {/* Simplified Shopping Cart / Electronic Pulse Icon */}
          <svg
            viewBox="0 0 100 100"
            className="w-8 h-8 text-white fill-current"
          >
            <path d="M20 20 L30 20 L40 60 L80 60 L90 30 L35 30" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="45" cy="80" r="8" />
            <circle cx="75" cy="80" r="8" />
            <path d="M45 45 L55 45 L60 35 L70 55 L75 45 L85 45" fill="none" stroke="white" strokeWidth="4" />
          </svg>
        </div>
      )}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-bold tracking-tight text-brand-blue uppercase">{businessName}</span>
          <span className="text-sm font-semibold tracking-[0.2em] text-brand-red uppercase">{businessSub}</span>
        </div>
      )}
    </div>
  );
};
