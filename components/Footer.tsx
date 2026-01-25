"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

const Footer: React.FC = () => {
  const phoneNumber = "+919876543210";
  const whatsappNumber = "+919876543210";
  const address =
    "Mahatma Gandhi Nagar, Kanti Factory Road, Near- Atithi Banquet Hall, Opposite of Laxmi Girls Hostel, Pin- 800026";

  const handleMapClick = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    window.open(mapsUrl, "_blank");
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber.replace(/\+/g, "")}`, "_blank");
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto relative">
      {/* Floating WhatsApp Button - Left Side */}
      <button
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-green-500/50 flex items-center justify-center group"
        aria-label="Contact us on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping"></span>
        <FaWhatsapp className="w-7 h-7 relative z-10" />
        <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
          Chat on WhatsApp
        </span>
      </button>

      {/* Floating Phone Button - Right Side */}
      <button
        onClick={handlePhoneClick}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50 flex items-center justify-center group"
        aria-label="Call us"
      >
        <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping"></span>
        <FaPhone className="w-7 h-7 relative z-10" />
        <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
          Call Now
        </span>
      </button>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Section - Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {/* Fallback to native <img> to avoid Next/Image loader issues during dev/build */}
                <img
                  src="/cwpa.jpg"
                  alt="CWPA Logo"
                  width={56}
                  height={56}
                  className="rounded-2xl object-cover"
                  decoding="async"
                  loading="lazy"
                />
              </div>
              <h3 className="text-xl font-bold leading-tight">
                Cricket Wala Play Arena
              </h3>
            </div>
            <p className="text-gray-400 mb-6">
              Premium cricket turf booking platform in Kanti Factory, Patna, Bihar. Experience professional-grade facilities with easy online booking.
            </p>
            {/* Social Media Icons */}
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-800 hover:bg-sky-500 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Middle Section - Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 border-b-2 border-green-500 inline-block pb-1">Quick Links</h4>
            <ul className="space-y-3 text-gray-400 mt-6">
              <li>
                <Link
                  href="/"
                  className="hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <span>→</span> Home
                </Link>
              </li>
              <li>
                <Link
                  href="/turf-booking"
                  className="hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <span>→</span> Book Now
                </Link>
              </li>
              <li>
                <Link
                  href="/my-bookings"
                  className="hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <span>→</span> My Bookings
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/gallery"
                  className="hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <span>→</span> Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Section - Contact Us */}
          <div>
            <h4 className="text-lg font-semibold mb-4 border-b-2 border-green-500 inline-block pb-1">Contact Us</h4>
            <ul className="space-y-4 text-gray-400 mt-6">
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaPhone className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <a
                    href={`tel:${phoneNumber}`}
                    className="hover:text-blue-400 transition-colors"
                  >
                    +91 83402 96635
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaWhatsapp className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <button
                    onClick={handleWhatsAppClick}
                    className="text-left hover:text-green-400 transition-colors"
                  >
                    WhatsApp
                  </button>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <a
                    href="mailto:cricketwala1112025@gmail.com"
                    className="hover:text-red-400 transition-colors"
                  >
                    cricketwala1112025@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Mahatma Gandhi Nagar, Kanti</p>
                  <button
                    onClick={handleMapClick}
                    className="text-left hover:text-green-400 transition-colors text-sm"
                  >
                    Factory Road, Near- Atithi Banquet Hall<br />
                    Opposite of Laxmi Girls Hostel<br />
                    Pin- 800026
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Cricket Wala Play Arena. All
              rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-green-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-green-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-green-400 transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
