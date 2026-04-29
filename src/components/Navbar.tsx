import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { Search, ShoppingCart, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Products', path: '/' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex-shrink-0">
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  "text-sm font-medium transition-colors hover:text-brand-blue",
                  location.pathname === link.path ? "text-brand-blue" : "text-gray-600"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-6 w-px bg-gray-200"></div>
            <Link to="/admin" className="p-2 text-gray-500 hover:text-brand-blue transition-colors">
              <User size={20} />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
             <Link to="/admin" className="p-2 text-gray-500">
              <User size={20} />
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-blue transition-colors rounded-lg"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

import { clsx } from 'clsx';
