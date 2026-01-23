'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, Search, LayoutDashboard, Images, LogOut, Lock, LucideIcon, Phone, MessageCircle, MapPin } from 'lucide-react';
import { GiCricketBat } from 'react-icons/gi';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Don't check auth on login page
    if (pathname === '/admin/login') {
      setIsAdmin(false);
      return;
    }

    // Check if admin is logged in via API
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check-auth', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.authenticated);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };
    checkAuth();
  }, [pathname]);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Freeze body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Wait 800ms to show the logging out message
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsAdmin(false);
    setIsMobileMenuOpen(false);
    setIsLoggingOut(false);
    // Force page reload to update all components' admin state
    window.location.href = '/';
  };

  const isActive = (path: string): boolean => {
    return pathname === path;
  };

  const navItems: NavItem[] = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/turf-booking', label: 'Book Now', icon: Calendar },
    { path: '/my-bookings', label: 'My Bookings', icon: Search },
  ];

  const adminNavItems: NavItem[] = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/gallery', label: 'Gallery', icon: Images },
  ];

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      {/* Mobile Quick Contact Bar */}
      <div className="md:hidden bg-gradient-to-r from-green-700 via-green-600 to-emerald-600">
        <div className="flex items-center justify-center gap-5 py-2">
          <a 
            href="tel:+918340296635" 
            className="flex items-center gap-1.5 text-white/90 hover:text-white text-xs font-medium transition-colors"
            aria-label="Call Us"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
          <span className="text-white/40">|</span>
          <a 
            href="https://wa.me/918340296635" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white/90 hover:text-white text-xs font-medium transition-colors"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
          <span className="text-white/40">|</span>
          <a 
            href="https://maps.google.com/?q=Cricket+wala+play+arena,+H5V9+V8F,+Mahatma+Gandhi+nagar,+Kanti+Factory+Rd,+Kankarbagh,+Patna,+Bihar+800026" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white/90 hover:text-white text-xs font-medium transition-colors"
            aria-label="Location"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Location</span>
          </a>
        </div>
      </div>

      {/* Logging Out Modal */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut className="w-10 h-10 text-red-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Logging Out...</h2>
              <p className="text-gray-600">
                Please wait while we securely log you out.
              </p>
              <div className="mt-6">
                <div className="w-12 h-12 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto"></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Contact Bar */}
      <div className="hidden md:block bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 text-white py-1.5">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+918340296635" className="flex items-center gap-2 hover:text-green-100 transition-colors font-medium">
              <Phone className="w-4 h-4" />
              +91-8340296635
            </a>
            <a href="https://maps.google.com/?q=Cricket+wala+play+arena,+H5V9+V8F,+Mahatma+Gandhi+nagar,+Kanti+Factory+Rd,+Kankarbagh,+Patna,+Bihar+800026" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-100 transition-colors">
              <MapPin className="w-4 h-4" />
              Click for Cricket Wala location
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://wa.me/918340296635" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-1.5 transition-colors font-medium">
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex-shrink-0">
              <Image
                src="/cwpa.jpg"
                alt="Cricket Wala Play Arena"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 whitespace-nowrap">
              Cricket Wala <span className="text-green-600">Play Arena</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${
                  isActive(item.path)
                    ? 'text-green-600 border-b-2 border-green-600 font-semibold'
                    : 'text-gray-700 hover:text-green-600'
                } font-medium transition-colors pb-1`}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && adminNavItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${
                  isActive(item.path)
                    ? 'text-green-600 border-b-2 border-green-600 font-semibold'
                    : 'text-gray-700 hover:text-green-600'
                } font-medium transition-colors pb-1`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Button + Contact Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Auth Button */}
            {pathname !== '/admin/login' && (
              <>
                {isAdmin ? (
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/admin/login"
                    className="bg-green-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Admin Login
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden relative w-10 h-10 flex items-center justify-center focus:outline-none group z-[80] transition-colors ${
              isMobileMenuOpen ? 'bg-green-600' : ''
            }`}
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-5 flex flex-col justify-center items-center">
              {/* Top line */}
              <span
                className={`absolute w-6 h-0.5 rounded-full transform transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen 
                    ? 'rotate-45 translate-y-0 bg-white' 
                    : '-translate-y-2 bg-gray-700 group-hover:bg-green-600'
                }`}
              />
              {/* Middle line */}
              <span
                className={`absolute w-6 h-0.5 rounded-full transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen 
                    ? 'opacity-0 scale-0 bg-white' 
                    : 'opacity-100 scale-100 bg-gray-700 group-hover:bg-green-600'
                }`}
              />
              {/* Bottom line */}
              <span
                className={`absolute w-6 h-0.5 rounded-full transform transition-all duration-300 ease-in-out ${
                  isMobileMenuOpen 
                    ? '-rotate-45 translate-y-0 bg-white' 
                    : 'translate-y-2 bg-gray-700 group-hover:bg-green-600'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed top-[calc(2.25rem+4rem)] left-0 right-0 bottom-0 bg-black/50 z-[60] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-[calc(2.25rem+4rem)] right-0 bottom-0 w-80 bg-white shadow-2xl z-[70] md:hidden overflow-y-auto"
            >
              {/* Navigation Links */}
              <nav className="p-6 space-y-2">
                {navItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 transition-all ${
                          isActive(item.path)
                            ? 'bg-green-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-green-50'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}

                {isAdmin && (
                  <>
                    <div className="border-t border-gray-200 my-4 pt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                        Admin Panel
                      </p>
                    </div>
                    {adminNavItems.map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <motion.div
                          key={item.path}
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: (navItems.length + index) * 0.1 }}
                        >
                          <Link
                            href={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 transition-all ${
                              isActive(item.path)
                                ? 'bg-green-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-green-50'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <IconComponent className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </nav>

              {/* Auth Button */}
              <div className="p-6 border-t border-gray-200 mt-auto">
                {/* Don't show any auth button on login page */}
                {pathname !== '/admin/login' && (
                  <>
                    {isAdmin ? (
                      <motion.button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 font-semibold hover:bg-red-700 transition-colors shadow-md"
                        whileTap={{ scale: 0.95 }}
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </motion.button>
                    ) : (
                      <Link
                        href="/admin/login"
                        className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 font-semibold hover:bg-green-700 transition-colors shadow-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Lock className="w-5 h-5" />
                        <span>Admin Login</span>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
