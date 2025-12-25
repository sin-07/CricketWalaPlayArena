'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Calendar, List, LayoutDashboard, Image as ImageIcon, LogOut, Lock } from 'lucide-react';
import { GiCricketBat } from 'react-icons/gi';

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);
  }, [pathname]);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const isActive = (path: string): boolean => {
    return pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/booking', label: 'Book Now', icon: Calendar },
    { path: '/all-bookings', label: 'All Bookings', icon: List },
  ];

  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/gallery', label: 'Gallery', icon: Image },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <Image
                src="/cwpa.jpg"
                alt="Cricket Wala Play Arena"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-800">
              Cricket Wala <span className="text-primary-600">Play Arena</span>
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
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
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
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                } font-medium transition-colors pb-1`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Button */}
          <div className="hidden md:block">
            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg text-sm md:text-base font-semibold hover:bg-red-700 transition-colors shadow-md"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/admin/login"
                className="bg-primary-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg text-sm md:text-base font-semibold hover:bg-primary-700 transition-colors shadow-md"
              >
                Admin Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center text-gray-700 hover:text-primary-600 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
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
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              {/* Sidebar Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10">
                      <Image
                        src="/cwpa.jpg"
                        alt="Cricket Wala Play Arena"
                        fill
                        className="object-contain bg-white rounded-lg p-1"
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Cricket Wala</h2>
                      <p className="text-xs text-primary-100">Play Arena</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-primary-800 rounded-lg transition-colors"
                    whileTap={{ scale: 0.9, rotate: 90 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="p-6 space-y-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                          isActive(item.path)
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5" />
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
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.path}
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: (navItems.length + index) * 0.1 }}
                        >
                          <Link
                            href={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                              isActive(item.path)
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Icon className="w-5 h-5" />
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
                {isAdmin ? (
                  <motion.button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </motion.button>
                ) : (
                  <Link
                    href="/admin/login"
                    className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Lock className="w-5 h-5" />
                    <span>Admin Login</span>
                  </Link>
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
