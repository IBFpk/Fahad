import React from 'react';
import { Navbar } from './Navbar';
import { PromoBanner } from './PromoBanner';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_VERSION } from '../constants';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50">
        <PromoBanner />
        <Navbar />
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-brand-blue text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex flex-col mb-4">
                <h3 className="text-2xl font-bold leading-tight">FAHAD ELECTRONICS</h3>
                <span className="text-sm font-semibold tracking-[0.2em] text-brand-red uppercase">Beauty Shop</span>
              </div>
              <p className="text-blue-100 mb-6 max-w-md">
                Your trusted partner for home appliances and corporate cooling solutions. 
                Deals in Split AC, Floor Standing, LED TV, Refrigerator & more.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-brand-red transition-colors"><Instagram size={24} /></a>
                <a href="#" className="hover:text-brand-red transition-colors"><Facebook size={24} /></a>
                <a href="#" className="hover:text-brand-red transition-colors"><Twitter size={24} /></a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 underline decoration-brand-red underline-offset-8">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-blue-100 hover:text-white transition-colors">Products</Link></li>
                <li><Link to="/about" className="text-blue-100 hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 underline decoration-brand-red underline-offset-8">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="text-brand-red flex-shrink-0" size={20} />
                  <span className="text-sm text-blue-100">#17, Beauty House, Abdullah Haroon Road, Saddar, Karachi. Near Bank Of Punjab</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="text-brand-red flex-shrink-0" size={20} />
                  <span className="text-sm text-blue-100">021-32761001</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="text-brand-red flex-shrink-0" size={20} />
                  <span className="text-sm text-blue-100">farhanmalikfahadelectronic@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-blue-200 text-sm">
            <p>&copy; {new Date().getFullYear()} Fahad Electronics. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="px-2 py-1 bg-blue-900/50 rounded-md text-[10px] font-mono">Build: v{APP_VERSION}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
