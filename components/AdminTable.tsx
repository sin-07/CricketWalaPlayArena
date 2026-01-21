'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Calendar, Clock, User, Mail, Phone, MapPin, Hash, Search, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Booking } from '@/types';

// TurfBooking interface matching the TurfBooking model
interface TurfBooking {
  _id: string;
  bookingType: 'match' | 'practice';
  sport: 'Cricket' | 'Football' | 'Badminton';
  date: string;
  slot: string;
  name: string;
  mobile: string;
  email: string;
  basePrice: number;
  finalPrice: number;
  discountPercentage: number;
  totalPrice?: number;
  source?: 'online' | 'offline';
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Helper function to convert slot ID to time range
const getTimeRange = (slotId: number): string => {
  const startHour = slotId;
  const endHour = slotId + 1;
  const startTime = `${startHour.toString().padStart(2, '0')}:00`;
  const endTime = `${endHour.toString().padStart(2, '0')}:00`;
  return `${startTime} - ${endTime}`;
};

// Helper function to get all time ranges from slot IDs
const getTimeRanges = (timeSlotIds: number[] | undefined, fallbackSlotId?: number): string => {
  if (timeSlotIds && timeSlotIds.length > 0) {
    // Sort slot IDs to display in chronological order
    const sortedSlots = [...timeSlotIds].sort((a, b) => a - b);
    if (sortedSlots.length === 1) {
      return getTimeRange(sortedSlots[0]);
    }
    // For multiple slots, show first and last
    return `${getTimeRange(sortedSlots[0])}, ${getTimeRange(sortedSlots[sortedSlots.length - 1])}, etc.`;
  }
  // Fallback to single timeSlotId
  if (fallbackSlotId !== undefined) {
    return getTimeRange(fallbackSlotId);
  }
  return 'N/A';
};

// Helper function to get detailed time slot list
const getDetailedTimeSlots = (timeSlotIds: number[] | undefined, fallbackSlotId?: number): string[] => {
  if (timeSlotIds && timeSlotIds.length > 0) {
    const sortedSlots = [...timeSlotIds].sort((a, b) => a - b);
    return sortedSlots.map(id => getTimeRange(id));
  }
  if (fallbackSlotId !== undefined) {
    return [getTimeRange(fallbackSlotId)];
  }
  return ['N/A'];
};

interface AdminTableProps {
  bookings?: Booking[];
  turfBookings?: TurfBooking[];
  loading?: boolean;
}

const AdminTable: React.FC<AdminTableProps> = ({ 
  bookings = [],
  turfBookings = [],
  loading = false 
}) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedTurfBooking, setSelectedTurfBooking] = useState<TurfBooking | null>(null);
  const [userHistory, setUserHistory] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter turf bookings based on search term
  const filteredTurfBookings = useMemo(() => {
    if (!searchTerm.trim()) return turfBookings;
    
    const search = searchTerm.toLowerCase();
    return turfBookings.filter(booking => 
      booking.name?.toLowerCase().includes(search) ||
      booking.mobile?.toLowerCase().includes(search) ||
      booking.email?.toLowerCase().includes(search) ||
      booking.sport?.toLowerCase().includes(search) ||
      booking.bookingType?.toLowerCase().includes(search) ||
      booking.status?.toLowerCase().includes(search)
    );
  }, [turfBookings, searchTerm]);

  // Filter old bookings based on search term
  const filteredBookings = useMemo(() => {
    if (!searchTerm.trim()) return bookings;
    
    const search = searchTerm.toLowerCase();
    return bookings.filter(booking => 
      booking.customerName?.toLowerCase().includes(search) ||
      booking.phone?.toLowerCase().includes(search) ||
      booking.email?.toLowerCase().includes(search) ||
      booking.bookingRef?.toLowerCase().includes(search) ||
      booking.boxName?.toLowerCase().includes(search) ||
      booking.status?.toLowerCase().includes(search)
    );
  }, [bookings, searchTerm]);

  const handleTurfBookingClick = useCallback((booking: TurfBooking) => {
    setSelectedTurfBooking(booking);
    setSelectedBooking(null);
    setIsModalOpen(true);
  }, []);

  const fetchUserHistory = useCallback(async (booking: Booking) => {
    try {
      const response = await fetch(
        `/api/bookings/history?phone=${booking.phone}&email=${booking.email}`
      );
      const result = await response.json();
      if (result.success) {
        setUserHistory(result.data.bookings);
      }
    } catch (error) {
      console.error('Failed to fetch user history:', error);
    }
  }, []);

  const handleRowClick = useCallback(async (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
    await fetchUserHistory(booking);
  }, [fetchUserHistory]);

  // Calculate dynamic status based on booking time
  const getCalculatedStatus = useCallback((booking: TurfBooking) => {
    if (booking.status === 'cancelled') return 'cancelled';
    
    // Get the last slot end time
    const slots = booking.slot.split(',').map(s => s.trim());
    const lastSlot = slots[slots.length - 1];
    const endTime = lastSlot.split('-')[1]; // e.g., "00:00" from "23:00-00:00"
    
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Create booking end datetime
    const bookingDate = new Date(booking.date);
    
    // Handle midnight case (00:00 means next day)
    if (endHour === 0 && endMinute === 0) {
      bookingDate.setDate(bookingDate.getDate() + 1);
      bookingDate.setHours(0, 0, 0, 0);
    } else {
      bookingDate.setHours(endHour, endMinute, 0, 0);
    }
    
    const now = new Date();
    
    // If current time is past the booking end time, it's completed
    if (now > bookingDate) {
      return 'completed';
    }
    
    return 'active';
  }, []);

  const getStatusBadge = useCallback((status?: string, booking?: TurfBooking) => {
    // If it's a TurfBooking, calculate the actual status based on time
    let displayStatus = status;
    
    if (booking) {
      displayStatus = getCalculatedStatus(booking);
    } else {
      // Legacy: Treat 'confirmed' as 'active' for display
      displayStatus = (status === 'confirmed' || status === 'active') ? 'active' : status;
    }
    
    const statusClass =
      displayStatus === 'active'
        ? 'bg-green-100 text-green-700 border-green-300'
        : displayStatus === 'completed'
        ? 'bg-blue-100 text-blue-700 border-blue-300'
        : 'bg-red-100 text-red-700 border-red-300';

    // Display text
    const displayText = displayStatus === 'active' 
      ? 'ACTIVE' 
      : displayStatus === 'completed' 
      ? 'COMPLETED' 
      : displayStatus?.toUpperCase() || 'ACTIVE';

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusClass}`}
      >
        {displayText}
      </span>
    );
  }, [getCalculatedStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-lg overflow-hidden"
      >
        {/* Search Bar */}
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
          <div className="relative w-full">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <input
              type="text"
              placeholder="Search by name, phone, email, booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 md:py-3.5 border-2 border-green-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-sm sm:text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-green-700 font-medium">
              Found {filteredTurfBookings.length + filteredBookings.length} result{(filteredTurfBookings.length + filteredBookings.length) !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] -mx-4 sm:mx-0">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-50 z-10">
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-xs sm:text-sm">ID</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm">Customer</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm hidden md:table-cell">Phone</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm">Sport</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm hidden lg:table-cell">Date</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm hidden xl:table-cell">Time Slot</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm">Amount</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm hidden md:table-cell">Source</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm hidden sm:table-cell">Status</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {/* Turf Bookings */}
                {filteredTurfBookings.map((booking) => (
                  <motion.tr
                    key={booking._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => handleTurfBookingClick(booking)}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-mono text-xs">
                      CWPA{parseInt(booking._id.slice(-8), 16).toString().slice(-4).padStart(4, '0')}
                    </TableCell>
                    <TableCell className="font-medium text-xs sm:text-sm">
                      {booking.name}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell">{booking.mobile}</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {booking.sport}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                      {new Date(booking.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs hidden xl:table-cell">
                      <div className="max-w-[150px] truncate" title={booking.slot}>
                        {booking.slot}
                      </div>
                      <span className="text-gray-500 text-[10px] capitalize">
                        ({booking.bookingType})
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-primary-600 text-xs sm:text-sm">
                      <div>₹{booking.totalPrice || booking.finalPrice || 'N/A'}</div>
                      {booking.discountPercentage > 0 && booking.basePrice && (
                        <div className="text-[10px] text-gray-400 line-through">₹{booking.basePrice}</div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.source === 'offline' 
                          ? 'bg-orange-50 text-orange-700' 
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {booking.source === 'offline' ? 'Offline' : 'Online'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{getStatusBadge(booking.status, booking)}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTurfBookingClick(booking);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
                {/* Legacy Bookings */}
                {filteredBookings.map((booking) => (
                  <motion.tr
                    key={booking._id || booking.bookingRef}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => handleRowClick(booking)}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-mono text-xs">
                      {booking.bookingRef}
                    </TableCell>
                    <TableCell className="font-medium text-xs sm:text-sm">
                      {booking.customerName}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell">{booking.phone}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{booking.boxName}</TableCell>
                    <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                      {new Date(booking.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs hidden xl:table-cell">
                      <div className="max-w-[150px] truncate" title={getTimeRanges(booking.timeSlotIds, booking.timeSlotId)}>
                        {getTimeRanges(booking.timeSlotIds, booking.timeSlotId)}
                      </div>
                      <span className="text-gray-500 text-[10px]">
                        ({booking.timeSlotIds?.length || 1} slot{(booking.timeSlotIds?.length || 1) > 1 ? 's' : ''})
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-primary-600 text-xs sm:text-sm">
                      ₹{booking.totalAmount}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        (booking as any).bookingType === 'offline' 
                          ? 'bg-orange-50 text-orange-700' 
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {(booking as any).bookingType === 'offline' ? 'Offline' : 'Online'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(booking);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {filteredTurfBookings.length === 0 && filteredBookings.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? `No bookings found matching "${searchTerm}"` : 'No bookings found'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-green-600 hover:text-green-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Booking Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about this booking
            </DialogDescription>
          </DialogHeader>

          {/* Turf Booking Details */}
          {selectedTurfBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Customer Info */}
              <Card className="p-4 bg-gradient-to-r from-primary-50 to-blue-50">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary-600" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-medium">Name:</span>
                    <span className="ml-2">{selectedTurfBooking.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-medium">Phone:</span>
                    <span className="ml-2">{selectedTurfBooking.mobile}</span>
                  </div>
                  <div className="flex items-center col-span-2">
                    <Mail className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{selectedTurfBooking.email}</span>
                  </div>
                </div>
              </Card>

              {/* Booking Info */}
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                  Booking Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-medium">Ref:</span>
                    <span className="ml-2 font-mono">CWPA{parseInt(selectedTurfBooking._id.slice(-8), 16).toString().slice(-4).padStart(4, '0')}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-medium">Sport:</span>
                    <span className="ml-2 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{selectedTurfBooking.sport}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-medium">Date:</span>
                    <span className="ml-2">
                      {new Date(selectedTurfBooking.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-medium">Time:</span>
                    <span className="ml-2 bg-primary-50 px-3 py-1 rounded text-primary-700 font-medium">{selectedTurfBooking.slot}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Type:</span>
                    <span className="ml-2 capitalize">{selectedTurfBooking.bookingType}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Source:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      selectedTurfBooking.source === 'offline' 
                        ? 'bg-orange-50 text-orange-700' 
                        : 'bg-green-50 text-green-700'
                    }`}>
                      {selectedTurfBooking.source === 'offline' ? 'Offline (Walk-in)' : 'Online'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Status:</span>
                    <span className="ml-2">{getStatusBadge(selectedTurfBooking.status, selectedTurfBooking)}</span>
                  </div>
                  <div className="flex items-center col-span-2 pt-3 border-t">
                    <div className="w-full">
                      {selectedTurfBooking.basePrice ? (
                        <>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600">Original Price:</span>
                            <span className="text-gray-600">₹{selectedTurfBooking.basePrice}</span>
                          </div>
                          {selectedTurfBooking.discountPercentage > 0 && (
                            <div className="flex justify-between items-center mb-1 text-green-600">
                              <span>Discount ({selectedTurfBooking.discountPercentage}%):</span>
                              <span>-₹{selectedTurfBooking.basePrice - (selectedTurfBooking.finalPrice || 0)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-lg font-semibold">Final Amount:</span>
                            <span className="text-2xl font-bold text-primary-600">₹{selectedTurfBooking.totalPrice || selectedTurfBooking.finalPrice || 'N/A'}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Amount:</span>
                          <span className="text-xl font-bold text-gray-500">Price not available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Booking Timeline */}
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary-600" />
                  Booking Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>{new Date(selectedTurfBooking.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span>{new Date(selectedTurfBooking.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Legacy Booking Details */}
          {selectedBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Customer Info */}
              <Card className="p-4 bg-gradient-to-r from-primary-50 to-blue-50">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary-600" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-medium">Name:</span>
                    <span className="ml-2">{selectedBooking.customerName}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-medium">Phone:</span>
                    <span className="ml-2">{selectedBooking.phone}</span>
                  </div>
                  <div className="flex items-center col-span-2">
                    <Mail className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{selectedBooking.email}</span>
                  </div>
                </div>
              </Card>

              {/* Booking Info */}
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                  Booking Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-medium">Ref:</span>
                    <span className="ml-2 font-mono">{selectedBooking.bookingRef}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-medium">Box:</span>
                    <span className="ml-2">{selectedBooking.boxName}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="font-medium">Date:</span>
                    <span className="ml-2">
                      {new Date(selectedBooking.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <div className="flex items-center mb-2">
                      <Clock className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="font-medium">Time Slots ({selectedBooking.timeSlotIds?.length || 1}):</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      {getDetailedTimeSlots(selectedBooking.timeSlotIds, selectedBooking.timeSlotId).map((timeRange, idx) => (
                        <div key={idx} className="bg-primary-50 px-3 py-1 rounded text-primary-700 font-medium inline-block mr-2 mb-1">
                          {timeRange}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center col-span-2">
                    <span className="font-medium">Status:</span>
                    <span className="ml-2">{getStatusBadge(selectedBooking.status)}</span>
                  </div>
                  <div className="flex items-center col-span-2 pt-3 border-t">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="ml-auto text-2xl font-bold text-primary-600">
                      ₹{selectedBooking.totalAmount}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Booking History */}
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary-600" />
                  Customer Booking History ({userHistory.length})
                </h3>
                {userHistory.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userHistory.map((hist, index) => (
                      <motion.div
                        key={hist._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 rounded-lg p-3 text-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-xs text-gray-600">
                            {hist.bookingRef}
                          </span>
                          {getStatusBadge(hist.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                          <div className="font-medium">{hist.boxName}</div>
                          <div>{new Date(hist.date).toLocaleDateString()}</div>
                          <div className="col-span-2">
                            <span className="text-gray-600">Time: </span>
                            <span className="font-medium text-primary-700">
                              {getTimeRanges(hist.timeSlotIds, hist.timeSlotId)}
                            </span>
                          </div>
                          <div>
                            {hist.timeSlotIds?.length || 1} slot{(hist.timeSlotIds?.length || 1) > 1 ? 's' : ''}
                          </div>
                          <div className="font-semibold text-primary-600 text-right">
                            ₹{hist.totalAmount}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No other bookings found for this customer
                  </p>
                )}
              </Card>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminTable;
