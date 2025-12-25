'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaCamera, FaTimes } from 'react-icons/fa';

interface GalleryImage {
  _id: string;
  url: string;
  title: string;
  description?: string;
  order: number;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/gallery?activeOnly=true');
      setImages(response.data.images);
    } catch (error) {
      console.error('Failed to fetch gallery images');
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading gallery...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <FaCamera className="text-6xl text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No images available yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Carousel */}
      <div 
        className="relative max-w-6xl mx-auto px-4"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-green-700 p-3 rounded-full shadow-lg transition-all hover:scale-110 -ml-2 sm:ml-0"
          aria-label="Previous"
        >
          <FaChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-green-700 p-3 rounded-full shadow-lg transition-all hover:scale-110 -mr-2 sm:mr-0"
          aria-label="Next"
        >
          <FaChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel Container */}
        <div className="overflow-hidden px-8 sm:px-12">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((image) => (
              <div
                key={image._id}
                onClick={() => setSelectedImage(image)}
                className="flex-shrink-0 w-full cursor-pointer group px-2"
              >
                <div className="relative aspect-[16/9] bg-gradient-to-br from-green-50 to-green-100 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-100">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Cricket+Arena';
                    }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white font-bold text-2xl mb-2">{image.title}</h3>
                      {image.description && (
                        <p className="text-white/90 text-base">{image.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-2 mt-6">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-3 bg-green-600'
                  : 'w-3 h-3 bg-gray-300 hover:bg-green-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex justify-center gap-3 mt-6 px-4 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image._id}
                onClick={() => goToSlide(index)}
                className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all duration-300 ${
                  index === currentIndex
                    ? 'ring-2 ring-green-600 ring-offset-2 scale-110 shadow-lg'
                    : 'opacity-60 hover:opacity-100 hover:scale-105'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors"
            >
              <FaTimes />
            </button>
            <div className="aspect-video bg-gray-100">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-6 bg-gradient-to-r from-green-50 to-white">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedImage.title}</h2>
              {selectedImage.description && (
                <p className="text-gray-600">{selectedImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
