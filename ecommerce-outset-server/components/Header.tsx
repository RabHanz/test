import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MAIN_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '../constants';
import { trackNavClick } from '../utils/trackingUtils'; // Updated Import
import type { NavItem } from '../types';
import { LogoIcon, MenuIcon, CloseIcon, SearchIcon, GlobeIcon, ChevronDownIcon } from './icons';
import Button from './Button';
import { CartIcon } from '@/components/layout/CartIcon'; // Import CartIcon

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState(typeof window !== "undefined" ? window.location.hash : "");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('hashchange', handleHashChange);
    
    // Set initial state
    handleScroll(); 
    handleHashChange();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const NavLink: React.FC<{ item: NavItem, mobile?: boolean }> = ({ item, mobile = false }) => (
    <a
      href={item.href}
      onClick={() => {
        trackNavClick(item.label);
        if (mobile) setIsMobileMenuOpen(false);
        // setActiveHash(item.href); // Set active hash on click for immediate feedback if desired
      }}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ease-in-out
        ${mobile ? 'block hover:bg-gray-700 w-full text-left' : 'hover:text-orange-400'}
        ${isScrolled && !mobile ? 'text-gray-200' : 'text-gray-100'}
      `}
      aria-current={activeHash === item.href ? "page" : undefined}
    >
      {item.label}
    </a>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${isScrolled ? 'bg-gray-800 shadow-lg py-3' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#landing" className="flex-shrink-0 flex items-center" aria-label="Ecommerce Outset Home Page">
            <LogoIcon className="h-10 w-10 text-orange-500" aria-hidden="true" />
            <span className="ml-2 text-xl font-bold text-white">Ecommerce Outset</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main website navigation">
            {MAIN_NAV_ITEMS.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </nav>

          {/* Desktop Secondary Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button type="button" className="text-gray-300 hover:text-white transition-colors" aria-label="Search site">
              <SearchIcon className="h-5 w-5" />
            </button>
            <div className="relative">
              {/* Language Dropdown - Placeholder functionality */}
              <button type="button" className="flex items-center text-gray-300 hover:text-white transition-colors" aria-label="Select language, current: English">
                <GlobeIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                <span className="text-sm">EN</span>
                <ChevronDownIcon className="h-4 w-4 ml-1" aria-hidden="true" />
              </button>
              {/* Language dropdown content would go here, managed by state */}
            </div>
            {SECONDARY_NAV_ITEMS.map((item) => (
               <a key={item.label} href={item.href} onClick={() => trackNavClick(item.label)} className="text-sm font-medium text-gray-300 hover:text-orange-400 transition-colors">{item.label}</a>
            ))}
            <CartIcon />{/* Add CartIcon */}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label={isMobileMenuOpen ? "Close main menu" : "Open main menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu-content"
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
            id="mobile-menu-content" // ID for aria-controls
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-gray-800 absolute top-full left-0 right-0 shadow-lg overflow-hidden"
          >
            <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3" aria-label="Mobile main navigation">
              {MAIN_NAV_ITEMS.map((item) => (
                <NavLink key={item.label} item={item} mobile />
              ))}
              <div className="border-t border-gray-700 pt-4 mt-3">
                {SECONDARY_NAV_ITEMS.map((item) => (
                   <a key={item.label} href={item.href} onClick={() => { trackNavClick(item.label); setIsMobileMenuOpen(false); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">{item.label}</a>
                ))}
                <div className="flex items-center px-3 py-2 mt-2">
                    <button type="button" className="flex items-center text-gray-300 hover:text-white w-full text-left" aria-label="Select language, current: English">
                        <GlobeIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                        <span className="text-sm">EN</span>
                        <ChevronDownIcon className="h-4 w-4 ml-1" aria-hidden="true" />
                    </button>
                     {/* Add CartIcon to mobile menu */}
                    <CartIcon />
                </div>
                 <div className="px-3 py-2 mt-1">
                    <button type="button" className="text-gray-300 hover:text-white" aria-label="Search site">
                        <SearchIcon className="h-5 w-5" />
                    </button>
                 </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
