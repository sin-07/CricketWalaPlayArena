'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit2, Check, X } from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'flat' | 'percent';
  discountValue: number;
  applicableSlots: Array<{ date: string; slot: string }>;
  sport: string[];
  bookingType: string;
  assignedUsers: string[];
  adminPhones: string[];
  minAmount: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  createdAt: string;
}

const SPORTS = ['Cricket', 'Football', 'Badminton'];
const BOOKING_TYPES = [
  { label: 'Match', value: 'match' },
  { label: 'Practice', value: 'practice' },
  { label: 'Both', value: 'both' },
];

export default function AdminCouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'flat' as 'flat' | 'percent',
    discountValue: 0,
    sport: [] as string[],
    bookingType: 'both',
    assignedUsers: '',
    adminPhones: '8340296635',
    minAmount: 0,
    expiryDate: '',
    usageLimit: 0,
    perUserLimit: 1,
  });

  // Fetch coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/coupons/list');
      const data = await response.json();
      if (response.ok) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId
        ? '/api/admin/coupons/update'
        : '/api/admin/coupons/create';

      const payload = {
        ...formData,
        assignedUsers: formData.assignedUsers
          .split(',')
          .map((u) => u.trim())
          .filter((u) => u),
        adminPhones: formData.adminPhones
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p),
        ...(editingId && { id: editingId }),
      };

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          editingId
            ? 'Coupon updated successfully'
            : 'Coupon created successfully'
        );
        resetForm();
        fetchCoupons();
      } else {
        setMessage(data.error || 'Failed to save coupon');
      }
    } catch (error) {
      setMessage('Error saving coupon');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await fetch('/api/admin/coupons/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setMessage('Coupon deleted successfully');
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      setMessage('Failed to delete coupon');
    }
  };

  // Handle toggle active
  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/coupons/toggle', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      });

      if (response.ok) {
        setMessage('Coupon status updated');
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  };

  // Handle edit
  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      sport: coupon.sport,
      bookingType: coupon.bookingType,
      assignedUsers: coupon.assignedUsers.join(', '),
      adminPhones: coupon.adminPhones.join(', '),
      minAmount: coupon.minAmount,
      expiryDate: coupon.expiryDate.split('T')[0],
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
    });
    setEditingId(coupon._id);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'flat',
      discountValue: 0,
      sport: [],
      bookingType: 'both',
      assignedUsers: '',
      adminPhones: '8340296635',
      minAmount: 0,
      expiryDate: '',
      usageLimit: 0,
      perUserLimit: 1,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coupon Management</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Coupon'}
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-blue-100 text-blue-800 rounded-lg">
          {message}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Coupon Code */}
              <div>
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="SUMMER20"
                  disabled={!!editingId}
                />
              </div>

              {/* Discount Type */}
              <div>
                <Label htmlFor="discountType">Discount Type *</Label>
                <select
                  id="discountType"
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountType: e.target.value as 'flat' | 'percent',
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="flat">Flat (₹)</option>
                  <option value="percent">Percentage (%)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <Label htmlFor="discountValue">
                  Discount Value {formData.discountType === 'percent' && '%'} *
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountValue: parseFloat(e.target.value),
                    })
                  }
                  placeholder="100"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expiryDate: e.target.value,
                    })
                  }
                />
              </div>

              {/* Min Amount */}
              <div>
                <Label htmlFor="minAmount">Minimum Amount (₹)</Label>
                <Input
                  id="minAmount"
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minAmount: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0"
                />
              </div>

              {/* Usage Limit */}
              <div>
                <Label htmlFor="usageLimit">Usage Limit (0 = Unlimited)</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usageLimit: parseInt(e.target.value),
                    })
                  }
                  placeholder="0"
                />
              </div>

              {/* Per User Limit */}
              <div>
                <Label htmlFor="perUserLimit">Per User Limit</Label>
                <Input
                  id="perUserLimit"
                  type="number"
                  value={formData.perUserLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      perUserLimit: parseInt(e.target.value),
                    })
                  }
                  placeholder="1"
                />
              </div>

              {/* Booking Type */}
              <div>
                <Label htmlFor="bookingType">Booking Type</Label>
                <select
                  id="bookingType"
                  value={formData.bookingType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bookingType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {BOOKING_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sports */}
            <div>
              <Label>Sports (Leave empty for all)</Label>
              <div className="flex gap-4 mt-2">
                {SPORTS.map((sport) => (
                  <label key={sport} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.sport.includes(sport)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            sport: [...formData.sport, sport],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            sport: formData.sport.filter((s) => s !== sport),
                          });
                        }
                      }}
                    />
                    {sport}
                  </label>
                ))}
              </div>
            </div>

            {/* Assigned Users */}
            <div>
              <Label htmlFor="assignedUsers">
                Assigned Users (Leave empty for all users)
              </Label>
              <Input
                id="assignedUsers"
                value={formData.assignedUsers}
                onChange={(e) =>
                  setFormData({ ...formData, assignedUsers: e.target.value })
                }
                placeholder="user1@email.com, user2@email.com"
              />
            </div>

            {/* Admin Phones */}
            <div>
              <Label htmlFor="adminPhones">
                Admin Phone Numbers (Who can manage this coupon)
              </Label>
              <Input
                id="adminPhones"
                value={formData.adminPhones}
                onChange={(e) =>
                  setFormData({ ...formData, adminPhones: e.target.value })
                }
                placeholder="8340296635, 9876543210"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="submit" disabled={loading}>
                {editingId ? 'Update Coupon' : 'Create Coupon'}
              </Button>
              <Button type="button" onClick={resetForm} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Coupons List */}
      <div className="grid gap-4">
        {coupons.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No coupons found
          </Card>
        ) : (
          coupons.map((coupon) => (
            <Card key={coupon._id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{coupon.code}</h3>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        coupon.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                      {coupon.discountType === 'flat'
                        ? `₹${coupon.discountValue}`
                        : `${coupon.discountValue}%`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Used: {coupon.usedCount}
                    {coupon.usageLimit > 0 ? ` / ${coupon.usageLimit}` : ''}
                  </p>
                  <p className="text-sm text-gray-600">
                    Sports: {coupon.sport.length === 0 ? 'All' : coupon.sport.join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Users: {coupon.assignedUsers.length === 0 ? 'All users' : `${coupon.assignedUsers.length} users`}
                  </p>
                  <p className="text-sm text-gray-600">
                    Admin Access: {coupon.adminPhones.join(', ')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(coupon)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggle(coupon._id, coupon.isActive)}
                  >
                    {coupon.isActive ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(coupon._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
