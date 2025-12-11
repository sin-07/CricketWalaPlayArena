'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Calendar, Clock, User, Mail, Phone, MapPin, Hash } from 'lucide-react';
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
  loading?: boolean;
}

const AdminTable: React.FC<AdminTableProps> = ({ 
  bookings = [],
  loading = false 
}) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [userHistory, setUserHistory] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const getStatusBadge = useCallback((status?: string) => {
    const statusClass =
      status === 'active'
        ? 'bg-green-100 text-green-700 border-green-300'
        : status === 'completed'
        ? 'bg-blue-100 text-blue-700 border-blue-300'
        : 'bg-red-100 text-red-700 border-red-300';

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusClass}`}
      >
        {status?.toUpperCase() || 'ACTIVE'}
      </span>
    );
  }, []);

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
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-xs sm:text-sm">Booking ID</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm">Customer</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm hidden md:table-cell">Phone</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm">Box</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm hidden lg:table-cell">Date</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm hidden xl:table-cell">Time Slots</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm">Amount</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm hidden sm:table-cell">Status</TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {bookings.map((booking) => (
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

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No bookings found</p>
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
