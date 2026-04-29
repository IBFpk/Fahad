/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { ProductDetail } from './pages/ProductDetail';
import { Admin } from './pages/Admin';
import { ScrollToTop } from './components/ScrollToTop';

export default function App() {
  const basename = import.meta.env.DEV ? '/' : '/Fahad';
  
  return (
    <Router basename={basename}>
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
