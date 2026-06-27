/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { ProductDetail } from './pages/ProductDetail';
import { Admin } from './pages/Admin';
import { ScrollToTop } from './components/ScrollToTop';
import { SettingsProvider, useSettings } from './context/SettingsContext';

function AppContent() {
  const { isLoading } = useSettings();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* High-end minimalist loading animation */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-brand-blue/10"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-brand-blue animate-spin"></div>
          </div>
          <div className="mt-2">
            <h2 className="text-sm font-black tracking-widest text-brand-blue uppercase animate-pulse">Loading Store</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Connecting to database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/admin" element={<Admin />} />
          {/* Simple contact route redirects to about for now */}
          <Route path="/contact" element={<About />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
