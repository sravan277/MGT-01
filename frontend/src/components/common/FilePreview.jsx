import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiDownload, FiMaximize2 } from 'react-icons/fi';

const FilePreview = ({ file, onClose, onDownload }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
    if (ext === 'pdf') return 'pdf';
    return 'unknown';
  };

  const renderPreview = () => {
    const type = getFileType(file.name);
    
    switch (type) {
      case 'image':
        return (
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
          />
        );
      
      case 'video':
        return (
          <video
            src={file.url}
            controls
            className="max-w-full max-h-full"
          />
        );
      
      case 'audio':
        return (
          <div className="flex items-center justify-center h-full">
            <audio src={file.url} controls className="w-full max-w-md" />
          </div>
        );
      
      case 'pdf':
        return (
          <iframe
            src={file.url}
            className="w-full h-full border-0"
            title={file.name}
          />
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="mb-4">Preview not available for this file type</p>
              <button
                onClick={onDownload}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg"
              >
                Download File
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full max-w-6xl max-h-screen p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between text-white">
          <h3 className="text-lg font-semibold truncate">{file.name}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiMaximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={onDownload}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiDownload className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="w-full h-full flex items-center justify-center pt-16">
          {renderPreview()}
        </div>
      </div>
    </motion.div>
  );
};

export default FilePreview;
