'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Loader } from 'lucide-react';

interface CouponApplierProps {
  bookingType: 'match' | 'practice';
  sport: string;
  date: string;
  slot: string;
  basePrice: number;
  userEmail: string;
  onCouponApply?: (coupon: {
    code: string;
    discount: number;
    finalPrice: number;
  }) => void;
}

export default function CouponApplier({
  bookingType,
  sport,
  date,
  slot,
  basePrice,
  userEmail,
  onCouponApply,
}: CouponApplierProps) {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    message: string;
    discount?: number;
    finalPrice?: number;
  } | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<
    Array<{ code: string; discountType: string; discountValue: number }>
  >([]);
  const [showAvailable, setShowAvailable] = useState(false);

  // Fetch available coupons
  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      try {
        const response = await fetch(
          `/api/coupons/list?userEmail=${userEmail}&date=${date}&slot=${slot}&sport=${sport}&bookingType=${bookingType}`
        );
        const data = await response.json();
        if (response.ok) {
          setAvailableCoupons(data.coupons);
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };

    if (userEmail && date && slot) {
      fetchAvailableCoupons();
    }
  }, [userEmail, date, slot, sport, bookingType]);

  // Validate coupon
  const handleValidate = async (code: string) => {
    if (!code.trim()) {
      setValidationStatus({
        isValid: false,
        message: 'Please enter a coupon code',
      });
      return;
    }

    setLoading(true);
    setValidationStatus(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          bookingType,
          sport,
          date,
          slot,
          basePrice,
          userEmail,
        }),
      });

      const data = await response.json();

      setValidationStatus({
        isValid: response.ok,
        message: data.message,
        discount: data.discount,
        finalPrice: data.finalPrice,
      });

      if (response.ok && onCouponApply && data.discount) {
        onCouponApply({
          code: code.toUpperCase(),
          discount: data.discount,
          finalPrice: data.finalPrice,
        });
      }
    } catch (error) {
      setValidationStatus({
        isValid: false,
        message: 'Error validating coupon',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <Label htmlFor="couponCode" className="block mb-2">
          Have a Coupon Code?
        </Label>

        <div className="flex gap-2">
          <Input
            id="couponCode"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase());
              setValidationStatus(null);
            }}
            placeholder="Enter coupon code"
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleValidate(couponCode);
              }
            }}
          />
          <Button
            onClick={() => handleValidate(couponCode)}
            disabled={loading || !couponCode.trim()}
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              'Apply'
            )}
          </Button>
        </div>

        {validationStatus && (
          <div
            className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
              validationStatus.isValid
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {validationStatus.isValid ? (
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{validationStatus.message}</p>
              {validationStatus.isValid && validationStatus.discount && (
                <p className="text-sm mt-1">
                  Discount: ₹{validationStatus.discount.toFixed(0)} | Final Price: ₹
                  {validationStatus.finalPrice?.toFixed(0)}
                </p>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Available Coupons */}
      {availableCoupons.length > 0 && (
        <Card className="p-4">
          <button
            onClick={() => setShowAvailable(!showAvailable)}
            className="font-medium text-blue-600 hover:underline w-full text-left"
          >
            {showAvailable
              ? '▼ Available Coupons'
              : '▶ Available Coupons'}{' '}
            ({availableCoupons.length})
          </button>

          {showAvailable && (
            <div className="mt-3 space-y-2">
              {availableCoupons.map((coupon) => (
                <button
                  key={coupon.code}
                  onClick={() => {
                    setCouponCode(coupon.code);
                    handleValidate(coupon.code);
                  }}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded border border-gray-200 text-sm"
                >
                  <span className="font-bold">{coupon.code}</span> -{' '}
                  {coupon.discountType === 'flat'
                    ? `₹${coupon.discountValue}`
                    : `${coupon.discountValue}%`}{' '}
                  off
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
