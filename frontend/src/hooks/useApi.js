import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      showLoading = true, 
      showError = true, 
      showSuccess = false,
      successMessage = 'Operation completed successfully',
      onSuccess,
      onError 
    } = options;

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const result = await apiCall();

      if (showSuccess) {
        toast.success(successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'An error occurred';
      setError(errorMessage);

      if (showError) {
        toast.error(errorMessage);
      }

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  return { loading, error, execute, setError };
};

// Specific API hooks
export const usePaperApi = () => {
  const { loading, error, execute } = useApi();

  const uploadPaper = useCallback((file) => {
    return execute(() => apiService.uploadZip(file), {
      successMessage: 'Paper uploaded successfully!',
      showSuccess: true
    });
  }, [execute]);

  const scrapeArxiv = useCallback((url) => {
    return execute(() => apiService.scrapeArxiv(url), {
      successMessage: 'Paper imported from arXiv successfully!',
      showSuccess: true
    });
  }, [execute]);

  const updateMetadata = useCallback((paperId, metadata) => {
    return execute(() => apiService.updatePaperMetadata(paperId, metadata), {
      showSuccess: true,
      successMessage: 'Metadata updated successfully!'
    });
  }, [execute]);

  return {
    loading,
    error,
    uploadPaper,
    scrapeArxiv,
    updateMetadata
  };
};

export const useScriptApi = () => {
  const { loading, error, execute } = useApi();

  const generateScript = useCallback((paperId) => {
    return execute(() => apiService.generateScript(paperId), {
      successMessage: 'Script generated successfully!',
      showSuccess: true
    });
  }, [execute]);

  const updateScripts = useCallback((paperId, scripts) => {
    return execute(() => apiService.updateScripts(paperId, scripts), {
      showLoading: false,
      showError: false
    });
  }, [execute]);

  const generateBulletPoints = useCallback((paperId, section, text) => {
    return execute(() => apiService.generateBulletPoints(paperId, section, text), {
      showLoading: false
    });
  }, [execute]);

  return {
    loading,
    error,
    generateScript,
    updateScripts,
    generateBulletPoints
  };
};
