'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { FaUpload, FaEdit, FaTrash, FaEye, FaEyeSlash, FaImages, FaPlus, FaTimes, FaCheck } from 'react-icons/fa';

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
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Form state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState('');

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check-auth', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (!data.authenticated) {
            router.push('/admin/login');
            return;
          }
          setIsAuthenticated(true);
          fetchImages();
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        router.push('/admin/login');
      }
    };
    checkAuth();
  }, [router]);

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
    setSelectedFiles([]);
    setPreviewUrls([]);
    setUploadedUrl('');
    setTitle('');
    setDescription('');
    setOrder(0);
    setEditingImage(null);
    setShowForm(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      
      // Create preview URLs
      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(previews);
    }
  };

  const uploadFiles = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls.push(response.data.url);
      } catch (error) {
        console.error('Failed to upload file:', file.name);
        throw error;
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUploading(true);

      if (editingImage) {
        await axios.put('/api/gallery', {
          id: editingImage._id,
          url: uploadedUrl || editingImage.url,
          title,
          description,
          order,
          isActive: editingImage.isActive,
        });
        showNotification('Image updated successfully', 'success');
      } else {
        if (selectedFiles.length === 0) {
          showNotification('Please select at least one image', 'error');
          return;
        }

        const uploadedUrls = await uploadFiles();

        for (let i = 0; i < uploadedUrls.length; i++) {
          await axios.post('/api/gallery', {
            url: uploadedUrls[i],
            title: selectedFiles.length > 1 ? `${title} ${i + 1}` : title,
            description,
            order: order + i,
          });
        }

        showNotification(`${selectedFiles.length} image(s) uploaded successfully`, 'success');
      }

      fetchImages();
      resetForm();
    } catch (error) {
      showNotification('Failed to save image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setUploadedUrl(image.url);
    setTitle(image.title);
    setDescription(image.description || '');
    setOrder(image.order);
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-red-500 to-rose-600'
        } text-white`}>
          {notification.type === 'success' ? <FaCheck /> : <FaTimes />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-green-600 shadow-xl">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FaImages className="text-2xl" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold">Gallery Management</h1>
              </div>
              <p className="text-green-100 text-sm sm:text-base">Upload and manage your cricket facility images</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                showForm 
                  ? 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/40' 
                  : 'bg-white text-green-700 hover:bg-green-50 hover:scale-105'
              }`}
            >
              {showForm ? <FaTimes /> : <FaPlus />}
              {showForm ? 'Cancel' : 'Add Images'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Upload Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-6 py-4 border-b border-green-200">
              <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
                <FaUpload className="text-green-600" />
                {editingImage ? 'Edit Image Details' : 'Upload New Images'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {!editingImage && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Images
                  </label>
                  <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FaUpload className="text-4xl text-green-500 mx-auto mb-3" />
                      <p className="text-green-700 font-semibold mb-1">Click to upload or drag and drop</p>
                      <p className="text-green-600 text-sm">PNG, JPG, WEBP (Multiple files supported)</p>
                    </label>
                  </div>
                  
                  {/* Preview Grid */}
                  {previewUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-green-200">
                          <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute bottom-1 right-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {selectedFiles.length > 0 && (
                    <p className="text-green-700 font-medium mt-3 flex items-center gap-2">
                      <FaCheck className="text-green-600" />
                      {selectedFiles.length} file(s) selected
                    </p>
                  )}
                </div>
              )}

              {editingImage && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Current Image</label>
                  <div className="relative w-full max-w-lg aspect-video bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl overflow-hidden border-2 border-green-200">
                    <img src={uploadedUrl} alt={title} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Cricket Arena View"
                    required
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-green-50/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value))}
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-green-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this image..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-green-50/50 resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      {editingImage ? 'Save Changes' : 'Upload Images'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  <FaTimes />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md border border-green-100">
            <div className="text-3xl font-bold text-green-600">{images.length}</div>
            <div className="text-sm text-gray-600">Total Images</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-green-100">
            <div className="text-3xl font-bold text-emerald-600">{images.filter(i => i.isActive).length}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border border-green-100">
            <div className="text-3xl font-bold text-orange-500">{images.filter(i => !i.isActive).length}</div>
            <div className="text-sm text-gray-600">Hidden</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 shadow-md text-white">
            <div className="text-3xl font-bold">Live</div>
            <div className="text-sm text-green-100">Gallery Status</div>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading gallery...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-green-100">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaImages className="text-4xl text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Images Yet</h3>
            <p className="text-gray-600 mb-6">Start by uploading your first gallery image</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
            >
              <FaPlus />
              Add First Image
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image._id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all hover:shadow-xl hover:-translate-y-1 ${
                  image.isActive ? 'border-green-100' : 'border-orange-200 opacity-75'
                }`}
              >
                <div className="aspect-video relative bg-gradient-to-br from-green-50 to-emerald-50">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Error';
                    }}
                  />
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                    image.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'bg-orange-500 text-white'
                  }`}>
                    {image.isActive ? 'Active' : 'Hidden'}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs">
                    Order: {image.order}
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-b from-white to-green-50/50">
                  <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">{image.title}</h3>
                  {image.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{image.description}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(image)}
                      className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                    >
                      <FaEdit className="text-xs" />
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(image)}
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        image.isActive 
                          ? 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      }`}
                    >
                      {image.isActive ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                      {image.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleDelete(image._id)}
                      className="flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-red-600 hover:to-rose-600 transition-all"
                    >
                      <FaTrash className="text-xs" />
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
