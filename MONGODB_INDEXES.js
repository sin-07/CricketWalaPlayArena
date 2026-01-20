// Optimize MongoDB indexes for better query performance
// Run these commands in MongoDB shell or through a migration script

db.bookings.createIndex({ date: 1, boxId: 1, status: 1 });
db.bookings.createIndex({ email: 1 });
db.bookings.createIndex({ phone: 1 });
db.bookings.createIndex({ bookingRef: 1 }, { unique: true });
db.bookings.createIndex({ status: 1 });
db.bookings.createIndex({ createdAt: -1 });

// Compound index for slot queries
db.bookings.createIndex({ boxId: 1, date: 1, timeSlotId: 1 });
db.bookings.createIndex({ boxId: 1, date: 1, status: 1 });

// Index for frozen slots
db.frozenslots.createIndex({ date: 1, slotId: 1 });
db.frozenslots.createIndex({ isActive: 1 });

// Index for coupons
db.coupons.createIndex({ code: 1 }, { unique: true });
db.coupons.createIndex({ isActive: 1 });
db.coupons.createIndex({ validFrom: 1, validUntil: 1 });

// Index for admins
db.admins.createIndex({ email: 1 }, { unique: true });
