import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/productService';
import { settingsService, WhatsAppSettings } from '../services/settingsService';
import { Product, Category } from '../types';
import { Search, SlidersHorizontal, Package, ArrowRight, Zap, ShieldCheck, Heart, ChevronDown, X, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

type SortOption = 
  | 'featured'
  | 'az'
  | 'za'
  | 'price-low'
  | 'price-high'
  | 'date-new'
  | 'date-old';

const sortLabels: Record<SortOption, string> = {
  featured: 'Featured',
  az: 'Alphabetically, A-Z',
  za: 'Alphabetically, Z-A',
  'price-low': 'Price, low to high',
  'price-high': 'Price, high to low',
  'date-new': 'Date, new to old',
  'date-old': 'Date, old to new'
};

export const Home = () => {
  const { brandSettings, whatsappSettings: ctxWhatsappSettings } = useSettings();
  const { businessName, businessSub, description } = brandSettings;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts(),
        productService.getCategories()
      ]);
      setProducts(prodRes);
      setCategories(catRes);
      setWhatsappSettings(ctxWhatsappSettings);
      setLoading(false);
    };
    loadData();
  }, [ctxWhatsappSettings]);

  const filteredProducts = products.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(query) || 
                          (p.brand && p.brand.toLowerCase().includes(query)) ||
                          p.category.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'az':
        return a.name.localeCompare(b.name);
      case 'za':
        return b.name.localeCompare(a.name);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'date-new':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'date-old':
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      default:
        return 0; // Featured (original order)
    }
  });

  // Extract unique categories from products to ensure all used categories are shown
  const allCategories = Array.from(new Set([
    ...categories.map(c => c.name),
    ...products.map(p => p.category)
  ])).filter(Boolean).sort();

  const allBrands = Array.from(new Set(
    products.map(p => p.brand).filter(Boolean)
  )).sort();

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden bg-brand-blue">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-20"
            alt="Hero background"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-blue/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1 bg-brand-red text-white text-xs font-bold tracking-widest rounded-full mb-6 uppercase">
              {businessSub || "Welcome to our store"}
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] uppercase">
              {businessName}
            </h1>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-lg">
              {description}
            </p>
            {/* Removed Hero Buttons */}
          </motion.div>
        </div>
      </section>

      {/* Features bar */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-brand-blue">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="font-bold">Fast Delivery</h3>
              <p className="text-sm text-gray-500">To your doorstep across Karachi</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-brand-red">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold">Genuine Products</h3>
              <p className="text-sm text-gray-500">Authorized dealer for top brands</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <Heart size={24} />
            </div>
            <div>
              <h3 className="font-bold">Expert Support</h3>
              <p className="text-sm text-gray-500">Corporate cooling consultants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Product Catalog</h2>
            <p className="text-gray-500">Finding the perfect appliance for your home</p>
          </div>

          <div className="flex items-center gap-4 flex-grow max-w-xl">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products, brands..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-blue outline-none transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Sort Button */}
            <div className="relative">
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-2xl hover:border-brand-blue transition-all shadow-sm text-gray-600 font-semibold"
              >
                <ArrowUpDown size={20} />
                <span className="hidden sm:inline">Sort by</span>
                <ChevronDown size={16} className={cn("transition-transform", isSortOpen && "rotate-180")} />
              </button>

              {/* Desktop Sort Dropdown */}
              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-30 overflow-hidden hidden md:block"
                  >
                    {Object.entries(sortLabels).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSortBy(key as SortOption);
                          setIsSortOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors text-sm font-medium",
                          sortBy === key ? "text-brand-blue bg-blue-50/50" : "text-gray-600"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Sort Bottom Sheet */}
        <AnimatePresence>
          {isSortOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSortOpen(false)}
                className="fixed inset-0 bg-black/40 z-[60] md:hidden"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[70] md:hidden overflow-hidden pb-safe"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black uppercase tracking-wider text-gray-900">Sort By</h3>
                    <button onClick={() => setIsSortOpen(false)} className="p-2 bg-gray-100 rounded-full">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(sortLabels).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSortBy(key as SortOption);
                          setIsSortOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-6 py-4 rounded-2xl transition-all font-semibold",
                          sortBy === key 
                            ? "bg-blue-50 text-brand-blue" 
                            : "bg-white text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Brands Filter */}
        {allBrands.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Shop by Brand</h3>
              {selectedBrand !== 'All' && (
                <button 
                  onClick={() => setSelectedBrand('All')}
                  className="text-xs font-bold text-brand-blue hover:underline"
                >
                  Clear Brand
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedBrand('All')}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all border",
                  selectedBrand === 'All' 
                    ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-blue-200" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-blue"
                )}
              >
                All Brands
              </button>
              {allBrands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-sm font-bold transition-all border",
                    selectedBrand === brand 
                      ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-blue-200" 
                      : "bg-white text-gray-600 border-gray-200 hover:border-brand-blue"
                  )}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Shop by Category</h3>
            {selectedCategory !== 'All' && (
              <button 
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-bold text-brand-blue hover:underline"
              >
                Clear Category
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('All')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all border",
                selectedCategory === 'All' 
                  ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-blue-200" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-blue"
              )}
            >
              All Products
            </button>
            {allCategories.map((catName) => (
              <button
                key={catName}
                onClick={() => setSelectedCategory(catName)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all border",
                  selectedCategory === catName 
                    ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-blue-200" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-blue"
                )}
              >
                {catName}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 p-4">
                <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-full mb-4" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                whatsappSettings={whatsappSettings} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <Package className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-900 mb-1">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </section>
    </div>
  );
};

import { cn } from '../lib/utils';
