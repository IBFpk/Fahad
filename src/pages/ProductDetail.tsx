import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { settingsService, WhatsAppSettings } from '../services/settingsService';
import { Product } from '../types';
import { formatPrice, getWhatsAppUrl } from '../lib/utils';
import { ShoppingCart, Share2, ArrowLeft, ShieldCheck, Zap, RotateCcw, PackageCheck } from 'lucide-react';
import { motion } from 'motion/react';

import ReactMarkdown from 'react-markdown';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (id) {
      Promise.all([
        productService.getProductById(id),
        settingsService.getWhatsAppSettings()
      ]).then(([prod, settings]) => {
        setProduct(prod);
        setWhatsappSettings(settings);
        if (prod) {
          setActiveImage(prod.image);
          document.title = `${prod.name} | Fahad Electronics`;
        }
        setLoading(false);
      });
    }

    return () => {
      document.title = 'Fahad Electronics | Premium Home Appliances';
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Product Not Found</h2>
        <Link to="/" className="text-brand-blue font-bold">Back to Catalog</Link>
      </div>
    );
  }

  const generateWhatsAppUrl = () => {
    if (!product || !whatsappSettings) return '#';
    
    let msg = whatsappSettings.whatsappTemplate;
    msg = msg.replace(/{{item_title}}/g, product.name);
    msg = msg.replace(/{{price}}/g, formatPrice(product.price));
    msg = msg.replace(/{{item_url}}/g, window.location.href);
    msg = msg.replace(/{{image_url}}/g, product.image || '');
    
    return getWhatsAppUrl(whatsappSettings.whatsapp, msg);
  };

  const whatsappUrl = generateWhatsAppUrl();

  return (
    <div className="pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-blue transition-colors mb-8 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to Shopping</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl">
              <img
                src={activeImage || 'https://images.unsplash.com/photo-1556911220-e15b44079565?auto=format&fit=crop&q=80&w=1200'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {[product.image, ...product.images].filter(Boolean).map((img, i) => (
                  <button 
                    key={i} 
                    className={cn(
                      "aspect-square bg-white rounded-xl overflow-hidden border transition-all focus:ring-2 focus:ring-brand-blue",
                      activeImage === img ? "border-brand-blue ring-2 ring-brand-blue" : "border-gray-100 hover:border-brand-blue"
                    )}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <span className="inline-block px-4 py-1.5 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-full mb-4 uppercase tracking-widest">
                {product.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-6 mb-8">
                <span className="text-4xl font-black text-brand-blue">
                  {formatPrice(product.price)}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-lg text-sm font-bold",
                  product.inStock ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div className="markdown-body text-lg text-gray-600 leading-relaxed">
                <ReactMarkdown>{product.description}</ReactMarkdown>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-8">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <PackageCheck className="text-brand-blue" size={20} />
                  Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-500 text-sm">{key}</span>
                      <span className="font-semibold text-sm">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl text-center">
                <ShieldCheck className="text-brand-blue mb-2" size={24} />
                <span className="text-xs font-bold text-gray-500 uppercase">Warranty</span>
                <span className="text-sm font-bold">1 Year Official</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl text-center">
                <Zap className="text-brand-red mb-2" size={24} />
                <span className="text-xs font-bold text-gray-500 uppercase">Delivery</span>
                <span className="text-sm font-bold">Same Day</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl text-center">
                <RotateCcw className="text-orange-500 mb-2" size={24} />
                <span className="text-xs font-bold text-gray-500 uppercase">Return</span>
                <span className="text-sm font-bold">7 Days Policy</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-grow flex items-center justify-center gap-3 bg-brand-blue text-white px-8 py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-blue-900/20 active:scale-[0.98] transition-all"
              >
                <ShoppingCart size={24} /> Buy via WhatsApp
              </a>
              <button 
                 onClick={() => {
                   if (navigator.share) {
                     navigator.share({ title: product.name, url: window.location.href });
                   } else {
                     navigator.clipboard.writeText(window.location.href);
                     alert("Link copied!");
                   }
                 }}
                 className="px-8 py-5 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-all font-bold flex items-center justify-center gap-2"
              >
                <Share2 size={24} /> Share
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

import { cn } from '../lib/utils';
