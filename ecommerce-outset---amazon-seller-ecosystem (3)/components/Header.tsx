
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MAIN_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '../constants';
import { trackNavClick } from '../utils/trackingUtils'; // Updated Import
import type { NavItem } from '../types';
import { LogoIcon, MenuIcon, CloseIcon, SearchIcon, GlobeIcon, ChevronDownIcon } from './icons';
import Button from './Button';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLink: React.FC<{ item: NavItem, mobile?: boolean }> = ({ item, mobile = false }) => (
    <a
      href={item.href}
      onClick={() => {
        trackNavClick(item.label);
        if (mobile) setIsMobileMenuOpen(false);
      }}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ease-in-out
        ${mobile ? 'block hover:bg-gray-700' : 'hover:text-orange-400'}
        ${isScrolled && !mobile ? 'text-gray-200' : 'text-gray-100'}
      `}
    >
      {item.label}
    </a>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${isScrolled ? 'bg-gray-800 shadow-lg py-3' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <LogoIcon className="h-10 w-10 text-orange-500" />
            <span className="ml-2 text-xl font-bold text-white">Ecommerce Outset</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {MAIN_NAV_ITEMS.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </nav>

          {/* Desktop Secondary Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-300 hover:text-white transition-colors">
              <SearchIcon className="h-5 w-5" />
            </button>
            <div className="relative">
              <button className="flex items-center text-gray-300 hover:text-white transition-colors">
                <GlobeIcon className="h-5 w-5 mr-1" />
                <span className="text-sm">EN</span>
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </button>
              {/* Language dropdown placeholder */}
            </div>
            {SECONDARY_NAV_ITEMS.map((item) => (
               <a key={item.label} href={item.href} onClick={() => trackNavClick(item.label)} className="text-sm font-medium text-gray-300 hover:text-orange-400 transition-colors">{item.label}</a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label="Open main menu"
            >
              {isMobileMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-gray-800 absolute top-full left-0 right-0 shadow-lg"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {MAIN_NAV_ITEMS.map((item) => (
                <NavLink key={item.label} item={item} mobile />
              ))}
              <div className="border-t border-gray-700 pt-4 mt-3">
                {SECONDARY_NAV_ITEMS.map((item) => (
                   <a key={item.label} href={item.href} onClick={() => trackNavClick(item.label)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">{item.label}</a>
                ))}
                <div className="flex items-center px-3 py-2 mt-2">
                    <GlobeIcon className="h-5 w-5 mr-1 text-gray-300" />
                    <span className="text-sm text-gray-300">EN</span>
                    <ChevronDownIcon className="h-4 w-4 ml-1 text-gray-300" />
                </div>
                 <div className="px-3 py-2 mt-1">
                    <SearchIcon className="h-5 w-5 text-gray-300" />
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
