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
        {" "}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <div className="relative w-8 h-8 mr-2">
                <Image
                  src="/cwpa.jpg"
                  alt="CWPA Logo"
                  fill
                  className="object-contain"
                />
              </div>
              Cricket Wala Play Arena
            </h3>
            <p className="text-gray-400">
              Premium Cricket Wala Play Arena booking platform. Book your slot
              and play your game!
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href="/"
                  className="hover:text-primary-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/booking"
                  className="hover:text-primary-400 transition-colors"
                >
                  Book Now
                </Link>
              </li>
              <li>
                <Link
                  href="/my-bookings"
                  className="hover:text-primary-400 transition-colors"
                >
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-2">
                <FaPhone className="w-4 h-4 mt-1 text-primary-400 flex-shrink-0" />
                <a
                  href={`tel:${phoneNumber}`}
                  className="hover:text-primary-400 transition-colors"
                >
                  {phoneNumber}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <FaWhatsapp className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                <button
                  onClick={handleWhatsAppClick}
                  className="text-left hover:text-green-400 transition-colors"
                >
                  WhatsApp: {whatsappNumber}
                </button>
              </li>
              <li className="flex items-start gap-2">
                <FaEnvelope className="w-4 h-4 mt-1 text-primary-400 flex-shrink-0" />
                <a
                  href="mailto:info@cricketbox.com"
                  className="hover:text-primary-400 transition-colors"
                >
                  info@cricketbox.com
                </a>
              </li>
              {/* Embedded Google Map */}
              <div className="mt-8 rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3598.0!2d85.1376!3d25.5941!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDM1JzM4LjgiTiA4NcKwMDgnMTUuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Cricket Wala Play Arena Location"
                  className="w-full"
                />
              </div>

              <li className="flex items-start gap-2">
                <FaMapMarkerAlt className="w-4 h-4 mt-1 text-primary-400 flex-shrink-0" />
                <button
                  onClick={handleMapClick}
                  className="text-left hover:text-primary-400 transition-colors"
                >
                  Mahatma Gandhi Nagar, Kanti Factory Road, Near- Atithi Banquet
                  Hall, Opposite of Laxmi Girls Hostel, Pin- 800026
                </button>
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
