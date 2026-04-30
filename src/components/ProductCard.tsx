import React from 'react';
import { Product } from '../types';
import { formatPrice, getWhatsAppUrl } from '../lib/utils';
import { ShoppingCart, Share2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

import { settingsService, WhatsAppSettings } from '../services/settingsService';

interface ProductCardProps {
  product: Product;
  whatsappSettings?: WhatsAppSettings | null;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, whatsappSettings }) => {
  const whatsappMsg = whatsappSettings 
    ? whatsappSettings.whatsappTemplate
        .replace(/{{item_title}}/g, product.name)
        .replace(/{{price}}/g, formatPrice(product.price))
        .replace(/{{item_url}}/g, window.location.origin + `/product/${product.id}`)
    : `Hi Fahad Electronics, I'm interested in ${product.name} (Price: ${formatPrice(product.price)}). Is it available?`;

  const whatsappNumber = whatsappSettings?.whatsapp || "923350237370";
  const whatsappUrl = getWhatsAppUrl(whatsappNumber, whatsappMsg);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.origin + `/product/${product.id}`,
        });
      } catch (err) {
        console.log("Sharing failed", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin + `/product/${product.id}`);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100 italic">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=600'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-brand-blue text-white text-xs font-bold rounded-full shadow-sm uppercase tracking-wider">
            {product.category}
          </span>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2 flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-blue transition-colors line-clamp-1">
            {product.name}
          </h3>
          <button 
            onClick={handleShare}
            className="p-2 text-gray-400 hover:text-brand-blue transition-colors"
            title="Share"
          >
            <Share2 size={18} />
          </button>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {product.description}
        </p>

        <div className="mt-auto">
          <div className="flex items-center justify-between gap-4">
            <span className="text-2xl font-black text-brand-blue">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-5">
            <Link 
              to={`/product/${product.id}`}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-1 hover:bg-gray-200 transition-colors"
            >
              Details <ArrowRight size={14} />
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-brand-blue text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98]"
            >
              <ShoppingCart size={14} /> Buy Now
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
