import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiImage, FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Pagination from '../common/Pagination';
import { apiService } from '../../services/api';

const ImageSelector = ({ paperId, images, selectedImage, onSelect, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [imageUrls, setImageUrls] = useState({});
  const [loadingImages, setLoadingImages] = useState(true);
  const imagesPerPage = 12;
  
  const totalPages = Math.ceil(images.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const currentImages = images.slice(startIndex, startIndex + imagesPerPage);

  // Load image URLs
  useEffect(() => {
    const loadImageUrls = async () => {
      if (!paperId || !images.length) return;
      
      setLoadingImages(true);
      const urls = {};
      
      for (const imageName of images) {
        try {
          // Check if image exists by making a HEAD request
          const imageUrl = apiService.getImageUrl(paperId, imageName);
          urls[imageName] = imageUrl;
        } catch (error) {
          console.error(`Failed to load image ${imageName}:`, error);
        }
      }
      
      setImageUrls(urls);
      setLoadingImages(false);
    };

    loadImageUrls();
  }, [paperId, images]);

  const handleImageSelect = (image) => {
    onSelect(image);
  };

  const ImageThumbnail = ({ imageName, isSelected }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => handleImageSelect(imageName)}
        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
          isSelected
            ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        {!imageLoaded && !imageError && (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        )}
        
        {imageError && (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <FiImage className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        <img
          src={imageUrls[imageName]}
          alt={imageName}
          className={`w-full h-full object-cover ${imageLoaded ? 'block' : 'hidden'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        
        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"
          >
            <FiCheck className="w-4 h-4 text-white" />
          </motion.div>
        )}
        
        {/* Image name overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate">
          {imageName}
        </div>
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 m-4 w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Select an Image for Slide
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* No Image Option */}
        <div className="mb-6">
          <button
            onClick={() => handleImageSelect(null)}
            className={`w-full p-4 border-2 border-dashed rounded-lg transition-all duration-200 ${
              selectedImage === null
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FiImage className="w-6 h-6 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300">No Image (Text Only Slide)</span>
              {selectedImage === null && (
                <FiCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              )}
            </div>
          </button>
        </div>

        {/* Images Grid */}
        <div className="overflow-y-auto max-h-96 mb-6">
          {loadingImages ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No images available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {currentImages.map((imageName) => (
                <ImageThumbnail
                  key={imageName}
                  imageName={imageName}
                  isSelected={selectedImage === imageName}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={images.length}
            itemsPerPage={imagesPerPage}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default ImageSelector;
