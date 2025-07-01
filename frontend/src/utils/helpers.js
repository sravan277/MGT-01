export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const validateArxivUrl = (url) => {
  const arxivRegex = /^https?:\/\/arxiv\.org\/(abs|pdf)\/([0-9]{4}\.[0-9]{4,5})(v[0-9]+)?$/;
  return arxivRegex.test(url);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

// Add these functions to the existing helpers.js file

export const createDownloadUrl = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => window.URL.revokeObjectURL(url), 100);
};

export const downloadFileFromUrl = async (url, filename) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    createDownloadUrl(blob, filename);
    return true;
  } catch (error) {
    console.error('Download error:', error);
    return false;
  }
};

export const getVideoMetadata = (videoElement) => {
  return new Promise((resolve) => {
    const handleLoadedMetadata = () => {
      resolve({
        duration: videoElement.duration,
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight,
        size: null // This would need to be passed separately
      });
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
    
    if (videoElement.readyState >= 1) {
      handleLoadedMetadata();
    } else {
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    }
  });
};
