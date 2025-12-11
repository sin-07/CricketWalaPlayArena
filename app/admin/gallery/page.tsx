'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface GalleryImage {
  _id: string;
  url: string;
  title: string;
  description?: string;
  order: number;
  isActive: boolean;
}

export default function AdminGallery() {
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Form state
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setIsAuthenticated(true);
    fetchImages();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/gallery');
      setImages(response.data.images);
    } catch (error) {
      showNotification('Failed to fetch images', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetForm = () => {
    setUrl('');
    setTitle('');
    setDescription('');
    setOrder(0);
    setIsActive(true);
    setEditingImage(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingImage) {
        // Update existing image
        await axios.put('/api/gallery', {
          id: editingImage._id,
          url,
          title,
          description,
          order,
          isActive,
        });
        showNotification('Image updated successfully', 'success');
      } else {
        // Create new image
        await axios.post('/api/gallery', {
          url,
          title,
          description,
          order,
        });
        showNotification('Image added successfully', 'success');
      }

      fetchImages();
      resetForm();
    } catch (error) {
      showNotification('Failed to save image', 'error');
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setUrl(image.url);
    setTitle(image.title);
    setDescription(image.description || '');
    setOrder(image.order);
    setIsActive(image.isActive);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await axios.delete(`/api/gallery?id=${id}`);
      showNotification('Image deleted successfully', 'success');
      fetchImages();
    } catch (error) {
      showNotification('Failed to delete image', 'error');
    }
  };

  const toggleActive = async (image: GalleryImage) => {
    try {
      await axios.put('/api/gallery', {
        id: image._id,
        ...image,
        isActive: !image.isActive,
      });
      showNotification('Image status updated', 'success');
      fetchImages();
    } catch (error) {
      showNotification('Failed to update status', 'error');
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gallery Management</h1>
              <p className="text-gray-600 mt-1">Manage Cricket Wala Play Arena gallery images</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md"
              >
                {showForm ? '✕ Cancel' : '+ Add New Image'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-0 sm:px-4 py-4 sm:py-8">
        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingImage ? 'Edit Image' : 'Add New Image'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Arena A"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Professional cricket practice facility..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value))}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {editingImage && (
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Active (Visible to users)
                      </span>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  {editingImage ? 'Update Image' : 'Add Image'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading gallery...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Images Yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first gallery image</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Add First Image
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image._id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                  !image.isActive ? 'opacity-50' : ''
                }`}
              >
                <div className="aspect-video relative bg-gray-200">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                  {!image.isActive && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Hidden
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{image.title}</h3>
                  {image.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{image.description}</p>
                  )}
                  <div className="text-xs text-gray-500 mb-3">Order: {image.order}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(image)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => toggleActive(image)}
                      className={`flex-1 ${
                        image.isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
                      } text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors`}
                    >
                      {image.isActive ? '👁️ Hide' : '👁️ Show'}
                    </button>
                    <button
                      onClick={() => handleDelete(image._id)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
