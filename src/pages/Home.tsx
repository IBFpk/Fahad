import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/productService';
import { Product, Category } from '../types';
import { Search, SlidersHorizontal, Package, ArrowRight, Zap, ShieldCheck, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const loadData = async () => {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts(),
        productService.getCategories()
      ]);
      setProducts(prodRes);
      setCategories(catRes);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredProducts = products.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(query) || 
                          (p.brand && p.brand.toLowerCase().includes(query)) ||
                          p.category.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories from products to ensure all used categories are shown
  const allCategories = Array.from(new Set([
    ...categories.map(c => c.name),
    ...products.map(p => p.category)
  ])).filter(Boolean);

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden bg-brand-blue">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-20"
            alt="Hero background"
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
              Premier Electronics Store
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1]">
              Upgrade Your <span className="text-brand-red underline decoration-8 underline-offset-8">Lifestyle</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-lg">
              Explore the latest in cooling, entertainment, and home appliances with Fahad Electronics. Quality guaranteed.
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
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={() => setSelectedCategory('All')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-semibold transition-all border",
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
                "px-6 py-2.5 rounded-xl font-semibold transition-all border",
                selectedCategory === catName 
                  ? "bg-brand-blue text-white border-brand-blue shadow-lg shadow-blue-200" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-blue"
              )}
            >
              {catName}
            </button>
          ))}
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
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
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
