'use client';

import React from 'react';
import Link from 'next/link';
import { GiCricketBat } from 'react-icons/gi';
import { Phone, MessageCircle, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import NewsletterSubscribe from './NewsletterSubscribe';

export default function FooterSection() {
  return (
    <footer className="w-full bg-black text-gray-400 mt-auto border-t border-gray-800">
      {/* Newsletter Section */}
      <div className="w-full py-8 sm:py-12 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Stay Updated! 📬</h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Subscribe for exclusive offers, slot alerts & cricket updates
            </p>
          </div>
          <NewsletterSubscribe variant="inline" />
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="w-full py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 text-center sm:text-left">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 justify-center sm:justify-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="/cwpa.jpg"
                    alt="Cricket Wala Play Arena Logo"
                    width={40}
                    height={40}
                    className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Cricket Wala Play Arena
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4 sm:mb-6 max-w-md mx-auto sm:mx-0">
                Premium cricket turf booking platform in Kanti Factory, Patna, Bihar. Experience professional-grade facilities with easy online booking.
              </p>
              {/* Social Media Links */}
              <div className="flex gap-2.5 sm:gap-3 justify-center sm:justify-start">
                <a 
                  href="#" 
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-900 hover:bg-green-600 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-900 hover:bg-green-600 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
                <a 
                  href="https://www.instagram.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-900 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-900 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 group"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 relative inline-block">
                Quick Links
                <span className="absolute bottom-0 left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 w-12 h-0.5 bg-green-500"></span>
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link 
                    href="/" 
                    className="text-xs sm:text-sm text-gray-400 hover:text-green-400 hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    → Home
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/booking" 
                    className="text-xs sm:text-sm text-gray-400 hover:text-green-400 hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    → Book Now
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/all-bookings" 
                    className="text-xs sm:text-sm text-gray-400 hover:text-green-400 hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    → My Bookings
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/gallery" 
                    className="text-xs sm:text-sm text-gray-400 hover:text-green-400 hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    → Gallery
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Section */}
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 relative inline-block">
                Contact Us
                <span className="absolute bottom-0 left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 w-12 h-0.5 bg-green-500"></span>
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {/* Phone */}
                <div className="group">
                  <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 group-hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 group-hover:text-white transition-colors" />
                    </div>
                    <a 
                      href="tel:+918340296635" 
                      className="text-xs sm:text-sm text-gray-400 hover:text-green-400 transition-colors"
                    >
                      +91 83402 96635
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="group">
                  <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 group-hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 group-hover:text-white transition-colors" />
                    </div>
                    <a 
                      href="https://wa.me/918340296635" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs sm:text-sm text-gray-400 hover:text-green-400 transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 group-hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 group-hover:text-white transition-colors" />
                    </div>
                    <a 
                      href="mailto:info@cricketbox.com" 
                      className="text-xs sm:text-sm text-gray-400 hover:text-green-400 transition-colors break-all"
                    >
                      info@cricketbox.com
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="group pt-1 sm:pt-2">
                  <a 
                    href="https://maps.google.com/?q=Cricket+wala+play+arena,+H5V9+V8F,+Mahatma+Gandhi+nagar,+Kanti+Factory+Rd,+Kankarbagh,+Patna,+Bihar+800026" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex gap-2 sm:gap-3 justify-center sm:justify-start"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 group-hover:bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-400 text-left group-hover:text-green-400 transition-colors">
                      <p className="font-semibold text-white group-hover:text-green-400 mb-0.5 sm:mb-1">H5V9+V8F, Mahatma Gandhi nagar</p>
                      <p className="text-gray-500 group-hover:text-green-400">Kanti Factory Rd, Kankarbagh</p>
                      <p className="text-gray-500 group-hover:text-green-400">Near- Atithi Banquet Hall</p>
                      <p className="text-gray-500 group-hover:text-green-400">Patna, Bihar 800026</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider with gradient */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

      {/* Bottom Footer */}
      <div className="w-full py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              © 2026 Cricket Wala Play Arena. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-6 justify-center">
              <Link 
                href="#" 
                className="text-xs sm:text-sm text-gray-500 hover:text-green-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="#" 
                className="text-xs sm:text-sm text-gray-500 hover:text-green-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                href="#" 
                className="text-xs sm:text-sm text-gray-500 hover:text-green-400 transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Line */}
      <div className="w-full py-3 sm:py-4 bg-gradient-to-r from-gray-950 via-black to-gray-950 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-gray-600">
            Crafted with <span className="text-red-500">❤</span> by <span className="text-green-400 font-semibold hover:text-green-300 transition-colors">A2R Software Solutions</span>
          </p>
        </div>
      </div>

    </footer>
  );
}
