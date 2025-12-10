'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('adminToken');
    setIsAdmin(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    router.push('/');
  };

  const isActive = (path: string): boolean => {
    return pathname === path;
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg md:text-xl font-bold">🏏</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-800">
              Cricket<span className="text-primary-600">Box</span>
            </span>
          </Link>

          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            <Link
              href="/"
              className={`${
                isActive('/')
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              } font-medium transition-colors pb-1`}
            >
              Home
            </Link>
            <Link
              href="/booking"
              className={`${
                isActive('/booking')
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              } font-medium transition-colors pb-1`}
            >
              Book Now
            </Link>
            <Link
              href="/all-bookings"
              className={`${
                isActive('/all-bookings')
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-primary-600'
              } font-medium transition-colors pb-1`}
            >
              All Bookings
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`${
                  isActive('/admin') || isActive('/admin/gallery')
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                } font-medium transition-colors pb-1`}
              >
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin/gallery"
                className={`${
                  isActive('/admin/gallery')
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                } font-medium transition-colors pb-1`}
              >
                Gallery
              </Link>
            )}
          </nav>

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
      </div>
    </header>
  );
};

export default Header;
