import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminPermissions extends Document {
  // Coupon Management
  canCreateCoupon: boolean;
  canEditCoupon: boolean;
  canDeleteCoupon: boolean;
  canViewCoupons: boolean;
  
  // Booking Management
  canCreateBooking: boolean;
  canEditBooking: boolean;
  canDeleteBooking: boolean;
  canViewBookings: boolean;
  
  // Slot Management
  canFreezeSlots: boolean;
  canUnfreezeSlots: boolean;
  canViewSlots: boolean;
  
  // Newsletter Management
  canSendNewsletter: boolean;
  canManageSubscribers: boolean;
  canViewNewsletter: boolean;
  
  // Gallery Management
  canUploadGallery: boolean;
  canDeleteGallery: boolean;
  canViewGallery: boolean;
  
  // Dashboard Access
  canViewDashboard: boolean;
  canViewStats: boolean;
  
  updatedAt: Date;
  updatedBy: string;
}

const AdminPermissionsSchema = new Schema(
  {
    // Coupon Management
    canCreateCoupon: {
      type: Boolean,
      default: true,
    },
    canEditCoupon: {
      type: Boolean,
      default: true,
    },
    canDeleteCoupon: {
      type: Boolean,
      default: true,
    },
    canViewCoupons: {
      type: Boolean,
      default: true,
    },
    
    // Booking Management
    canCreateBooking: {
      type: Boolean,
      default: true,
    },
    canEditBooking: {
      type: Boolean,
      default: true,
    },
    canDeleteBooking: {
      type: Boolean,
      default: true,
    },
    canViewBookings: {
      type: Boolean,
      default: true,
    },
    
    // Slot Management
    canFreezeSlots: {
      type: Boolean,
      default: true,
    },
    canUnfreezeSlots: {
      type: Boolean,
      default: true,
    },
    canViewSlots: {
      type: Boolean,
      default: true,
    },
    
    // Newsletter Management
    canSendNewsletter: {
      type: Boolean,
      default: true,
    },
    canManageSubscribers: {
      type: Boolean,
      default: true,
    },
    canViewNewsletter: {
      type: Boolean,
      default: true,
    },
    
    // Gallery Management
    canUploadGallery: {
      type: Boolean,
      default: true,
    },
    canDeleteGallery: {
      type: Boolean,
      default: true,
    },
    canViewGallery: {
      type: Boolean,
      default: true,
    },
    
    // Dashboard Access
    canViewDashboard: {
      type: Boolean,
      default: true,
    },
    canViewStats: {
      type: Boolean,
      default: true,
    },
    
    updatedBy: {
      type: String,
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const AdminPermissions = mongoose.models.AdminPermissions || mongoose.model<IAdminPermissions>('AdminPermissions', AdminPermissionsSchema);

export default AdminPermissions;
