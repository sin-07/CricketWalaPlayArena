'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, X } from 'lucide-react';

interface Offer {
  _id: string;
  code: string;
  offerTitle: string;
  discountType: 'flat' | 'percent';
  discountValue: number;
  expiryDate: string;
}

export default function OfferMarquee() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch('/api/coupons/homepage-offers');
        const data = await response.json();
        if (data.success && data.offers.length > 0) {
          setOffers(data.offers);
        } else {
          setIsVisible(false);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
        setIsVisible(false);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (loading || !isVisible || offers.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white overflow-hidden relative"
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Tag className="w-4 h-4 animate-pulse" />
          <span className="font-bold text-sm">SPECIAL OFFERS:</span>
        </div>
        
        <div className="flex-1 overflow-hidden mx-4">
          <motion.div
            className="flex gap-8"
            animate={{
              x: ['0%', '-50%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {/* Duplicate offers for seamless loop */}
            {[...offers, ...offers].map((offer, index) => (
              <div
                key={`${offer._id}-${index}`}
                className="flex-shrink-0 flex items-center gap-2 text-sm font-medium whitespace-nowrap"
              >
                <span>✨</span>
                <span>{offer.offerTitle || `${offer.code} - ${offer.discountType === 'percent' ? `${offer.discountValue}%` : `₹${offer.discountValue}`} OFF`}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close offer banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
