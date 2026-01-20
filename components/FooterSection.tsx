'use client';

import React from 'react';
import Link from 'next/link';
import { GiCricketBat } from 'react-icons/gi';
import { Phone, MessageCircle, Mail, MapPin } from 'lucide-react';

export default function FooterSection() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 mt-auto">
      {/* Main Footer Content */}
      <div className="w-full px-0 sm:px-0 md:px-0 py-12 sm:py-14 md:py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {/* Brand Section */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <GiCricketBat className="w-6 sm:w-8 h-6 sm:h-8 text-green-500 flex-shrink-0" />
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">
                  Cricket Wala Play Arena
                </h2>
              </div>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                Premium Cricket Wala Play Arena booking platform. Book your slot and play your game!
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-4 sm:mb-6">
                Quick Links
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link 
                    href="/" 
                    className="text-sm sm:text-base text-gray-400 hover:text-green-400 transition-colors duration-200"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/booking" 
                    className="text-sm sm:text-base text-gray-400 hover:text-green-400 transition-colors duration-200"
                  >
                    Book Now
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/all-bookings" 
                    className="text-sm sm:text-base text-gray-400 hover:text-green-400 transition-colors duration-200"
                  >
                    My Bookings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Section */}
            <div className="flex flex-col">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-4 sm:mb-6">
                Contact
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {/* Phone */}
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <Phone className="w-4 sm:w-5 h-4 sm:h-5 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <a 
                    href="tel:+918340296635" 
                    className="text-sm sm:text-base text-gray-400 hover:text-green-400 transition-colors duration-200 break-all"
                  >
                    +918340296635
                  </a>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <a 
                    href="https://wa.me/918340296635" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm sm:text-base text-gray-400 hover:text-green-400 transition-colors duration-200 break-all"
                  >
                    WhatsApp
                  </a>
                </div>

                {/* Email */}
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <a 
                    href="mailto:info@cricketbox.com" 
                    className="text-sm sm:text-base text-gray-400 hover:text-green-400 transition-colors duration-200 break-all"
                  >
                    info@cricketbox.com
                  </a>
                </div>

                {/* Address */}
                <div className="flex gap-2 sm:gap-3 pt-2">
                  <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-gray-400">
                    <p className="font-semibold text-white mb-1">Mahatma Gandhi Nagar, Kanti</p>
                    <p>Factory Road, Near- Atithi Banquet Hall</p>
                    <p>Opposite of Laxmi Girls Hostel</p>
                    <p>Pin- 800026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-700"></div>

      {/* Bottom Footer */}
      <div className="w-full px-0 sm:px-0 md:px-0 py-4 sm:py-6 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left order-2 sm:order-1">
              © 2026 Cricket Wala Play Arena. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-6 justify-center sm:justify-end order-1 sm:order-2">
              <Link 
                href="#" 
                className="text-xs sm:text-sm text-gray-400 hover:text-green-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link 
                href="#" 
                className="text-xs sm:text-sm text-gray-400 hover:text-green-400 transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link 
                href="#" 
                className="text-xs sm:text-sm text-gray-400 hover:text-green-400 transition-colors duration-200"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Line */}
      <div className="w-full px-0 sm:px-0 md:px-0 py-3 sm:py-4 bg-gray-950 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-gray-500">
            Crafted by <span className="text-green-400 font-semibold">A2R Software Solutions</span>
          </p>
        </div>
      </div>

    </footer>
  );
}
