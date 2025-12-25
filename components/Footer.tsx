import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GiCricketBat } from 'react-icons/gi';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
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
              Premium Cricket Wala Play Arena booking platform. Book your slot and play your game!
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-primary-400 transition-colors">
                  Book Now
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="hover:text-primary-400 transition-colors">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📞 +91 98765 43210</li>
              <li>📧 info@cricketbox.com</li>
              <li>📍 Mumbai, Maharashtra, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2025 CricketBox. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
