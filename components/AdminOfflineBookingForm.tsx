"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Save, Calendar, Clock, User, Phone, Mail, IndianRupee, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface SlotInfo {
  slot: string;
  available: boolean;
  isBooked: boolean;
  isFrozen: boolean;
}

interface AdminOfflineBookingFormProps {
  onBookingComplete: () => void;
}

const SPORTS = ['Cricket', 'Football', 'Badminton'];
const BOOKING_TYPES = [
  { value: 'practice', label: 'Practice' },
  { value: 'match', label: 'Match' },
];

const AdminOfflineBookingForm: React.FC<AdminOfflineBookingFormProps> = ({
  onBookingComplete,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    sport: "Cricket",
    bookingType: "practice",
    date: "",
    paymentCollected: 0,
  });
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [slotsData, setSlotsData] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get today's date in YYYY-MM-DD format
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get max date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  // Initialize date
  useEffect(() => {
    setFormData(prev => ({ ...prev, date: getMinDate() }));
  }, []);

  // Fetch available slots when date, sport, or booking type changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.date || !formData.sport || !formData.bookingType) return;
      
      setLoadingSlots(true);
      setSelectedSlots([]); // Clear selected slots when filters change
      
      try {
        const response = await fetch(
          `/api/turf-bookings/slots?date=${formData.date}&sport=${formData.sport}&bookingType=${formData.bookingType}`
        );
        const result = await response.json();
        
        if (result.success) {
          setSlotsData(result.data.slots);
        } else {
          console.error('Failed to fetch slots:', result.message);
          setSlotsData([]);
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
        setSlotsData([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [formData.date, formData.sport, formData.bookingType]);

  const handleSlotToggle = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((s) => s !== slot)
        : [...prev, slot]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (selectedSlots.length === 0) {
      setError("Please select at least one time slot");
      return;
    }

    if (!formData.name || !formData.mobile) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError("Please enter a valid 10-digit mobile number starting with 6-9");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/turf-bookings/admin-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingType: formData.bookingType,
          sport: formData.sport,
          date: formData.date,
          slots: selectedSlots,
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email || undefined,
          paymentCollected: formData.paymentCollected,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError("Permission denied: You don't have permission to create bookings");
        } else {
          setError(result.message || "Failed to create booking");
        }
        return;
      }

      if (result.success) {
        setSuccess(`Booking created successfully! Ref: ${result.data.bookingRef}`);
        // Reset form
        setFormData({
          name: "",
          email: "",
          mobile: "",
          sport: "Cricket",
          bookingType: "practice",
          date: getMinDate(),
          paymentCollected: 0,
        });
        setSelectedSlots([]);
        onBookingComplete();
        
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(result.message || "Failed to create booking");
      }
    } catch (err) {
      setError("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price for display
  const calculateDisplayPrice = () => {
    if (selectedSlots.length === 0) return 0;
    const pricePerSlot = formData.bookingType === 'match' ? 1200 : 
      (Number(process.env.NEXT_PUBLIC_TEST_PRICE_PER_HOUR) || 1);
    return pricePerSlot * selectedSlots.length;
  };

  // Filter out past slots for today's date
  const filterPastSlots = (slots: SlotInfo[]) => {
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Only filter if the selected date is today
    if (selectedDate.getTime() === today.getTime()) {
      const currentHour = new Date().getHours();
      return slots.filter(slotInfo => {
        const slotHour = parseInt(slotInfo.slot.split(':')[0]);
        return slotHour > currentHour;
      });
    }
    
    return slots;
  };

  const filteredSlots = filterPastSlots(slotsData);
  const availableSlots = filteredSlots.filter(s => s.available);
  const bookedSlots = filteredSlots.filter(s => s.isBooked);
  const frozenSlots = filteredSlots.filter(s => s.isFrozen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <UserPlus className="w-6 h-6" />
          Create Offline Booking
        </h2>
        <p className="text-emerald-100 text-sm mt-1">
          Book slots for walk-in customers. These slots will be blocked for online users.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-medium">{success}</p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Customer Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            Customer Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter customer name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, mobile: value });
                  }}
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (Optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Booking Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sport <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
              >
                {SPORTS.map((sport) => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.bookingType}
                onChange={(e) => setFormData({ ...formData, bookingType: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
              >
                {BOOKING_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                min={getMinDate()}
                max={getMaxDate()}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Slot Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Select Time Slots
            <span className="text-sm font-normal text-gray-500">
              ({availableSlots.length} available)
            </span>
          </h3>
          
          {loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="ml-2 text-gray-600">Loading slots...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {filteredSlots.map((slotInfo) => {
                const isSelected = selectedSlots.includes(slotInfo.slot);
                const isDisabled = !slotInfo.available;
                
                return (
                  <button
                    key={slotInfo.slot}
                    type="button"
                    onClick={() => !isDisabled && handleSlotToggle(slotInfo.slot)}
                    disabled={isDisabled}
                    className={`
                      px-3 py-2 text-xs sm:text-sm rounded-lg font-medium transition-all duration-200 border-2 relative
                      ${isSelected 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                        : isDisabled
                          ? slotInfo.isBooked
                            ? 'bg-red-100 text-red-400 border-red-200 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-400 border-blue-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50'
                      }
                    `}
                    title={
                      slotInfo.isBooked 
                        ? 'Already booked' 
                        : slotInfo.isFrozen 
                          ? 'Slot frozen' 
                          : 'Click to select'
                    }
                  >
                    <div className="flex flex-col items-center">
                      <span>{slotInfo.slot}</span>
                      {slotInfo.isBooked && (
                        <span className="text-[9px] sm:text-[10px] font-semibold mt-0.5">BOOKED</span>
                      )}
                      {slotInfo.isFrozen && (
                        <span className="text-[9px] sm:text-[10px] font-semibold mt-0.5">FROZEN</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedSlots.length > 0 && (
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-emerald-800 font-medium">
                Selected: {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''}
              </p>
              <p className="text-emerald-600 text-sm mt-1">
                {selectedSlots.sort().join(', ')}
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-emerald-600"></span>
              <span className="text-gray-600">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-white border-2 border-gray-200"></span>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-100 border-2 border-red-200"></span>
              <span className="text-gray-600">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-200"></span>
              <span className="text-gray-600">Frozen</span>
            </div>
          </div>
        </div>

        {/* Payment Collection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <IndianRupee className="w-4 h-4" />
            Payment Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Estimated Total</p>
              <p className="text-2xl font-bold text-gray-800">
                ₹{calculateDisplayPrice().toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} × ₹{formData.bookingType === 'match' ? '1200' : '1'}/slot
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Collected (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.paymentCollected}
                  onChange={(e) => setFormData({ ...formData, paymentCollected: Number(e.target.value) || 0 })}
                  placeholder="0"
                  min={0}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter amount collected from customer (if any)
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading || selectedSlots.length === 0}
            className={`
              w-full py-3 px-6 rounded-lg font-semibold text-white
              flex items-center justify-center gap-2 transition-all duration-200
              ${loading || selectedSlots.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Booking...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Offline Booking
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AdminOfflineBookingForm;
