"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DatePickerComponent from "./DatePickerComponent";
import TimeSlotSelector from "./TimeSlotSelector";
import { CRICKET_BOXES } from "@/utils/dummyData";
import {
  generateBookingRef,
  calculateTotalPrice,
  getMinDate,
  getMaxDate,
} from "@/utils/helpers";

interface AdminBookingFormProps {
  onBookingComplete: () => void;
}

const AdminBookingForm: React.FC<AdminBookingFormProps> = ({
  onBookingComplete,
}) => {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    boxId: 1,
    date: getMinDate(),
  });
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch booked slots when date or box changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        const response = await fetch(
          `/api/bookings?boxId=${formData.boxId}&date=${formData.date}`
        );
        const result = await response.json();
        if (result.success) {
          // Extract all timeSlotIds from bookings for this date and box
          const bookedSlotIds: number[] = [];
          result.data.forEach((booking: any) => {
            // Add all slots from timeSlotIds array
            if (booking.timeSlotIds && booking.timeSlotIds.length > 0) {
              bookedSlotIds.push(...booking.timeSlotIds);
            } else if (booking.timeSlotId) {
              // Fallback to single timeSlotId for legacy bookings
              bookedSlotIds.push(booking.timeSlotId);
            }
          });
          setBookedSlots(bookedSlotIds);
        }
      } catch (error) {
        console.error('Failed to fetch booked slots:', error);
      }
    };

    fetchBookedSlots();
  }, [formData.date, formData.boxId]);

  const handleSlotToggle = (slotId: number) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
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

    if (!formData.customerName || !formData.phone) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const selectedBox = CRICKET_BOXES.find(
        (box) => box.id === formData.boxId
      );

      const booking = {
        boxId: formData.boxId,
        boxName: selectedBox?.name || `Box ${formData.boxId}`,
        date: formData.date,
        timeSlotIds: selectedSlots,
        timeSlotId: selectedSlots[0],
        customerName: formData.customerName,
        email: formData.email || "offline@cricketbox.com",
        phone: formData.phone,
        pricePerHour: selectedBox?.pricePerHour || 1500,
        totalAmount: calculateTotalPrice(
          selectedBox?.pricePerHour || 1500,
          selectedSlots.length
        ),
        bookingRef: generateBookingRef(),
        status: "active",
        bookingType: "offline", // Mark as offline booking
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Offline booking created successfully!");
        setFormData({
          customerName: "",
          email: "",
          phone: "",
          boxId: 1,
          date: getMinDate(),
        });
        setSelectedSlots([]);
        onBookingComplete();

        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.error || "Failed to create booking");
      }
    } catch (err) {
      setError("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-700">
          <CardTitle className="text-white flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Create Offline Booking
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Name */}
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                placeholder="Enter customer name"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="9876543210"
                pattern="[0-9]{10}"
                required
              />
            </div>

            {/* Email (Optional) */}
            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="customer@example.com"
              />
            </div>

            {/* Arena Display */}
            <div>
              <Label>Arena</Label>
              <div className="w-full px-4 py-3 bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-300 rounded-lg font-semibold text-primary-800">
                Arena A - ₹10/hour
              </div>
            </div>

            {/* Date */}
            <DatePickerComponent
              selectedDate={formData.date}
              onDateChange={(date) => setFormData({ ...formData, date })}
              minDate={getMinDate()}
              maxDate={getMaxDate()}
            />

            {/* Time Slots */}
            <TimeSlotSelector
              selectedDate={formData.date}
              selectedSlots={selectedSlots}
              bookedSlots={bookedSlots}
              onSlotToggle={handleSlotToggle}
              isAdmin={true}
            />

            {/* Pricing Summary */}
            {selectedSlots.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-50 border border-primary-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {selectedSlots.length} slot
                    {selectedSlots.length > 1 ? "s" : ""}
                  </span>
                  <span className="text-2xl font-bold text-primary-700">
                    ₹
                    {calculateTotalPrice(
                      CRICKET_BOXES.find((b) => b.id === formData.boxId)
                        ?.pricePerHour || 1500,
                      selectedSlots.length
                    )}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm"
              >
                {success}
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Booking...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Offline Booking
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminBookingForm;
