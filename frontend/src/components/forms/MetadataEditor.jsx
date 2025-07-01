import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiEdit3, FiDownload } from 'react-icons/fi';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useApi } from '../../hooks/useApi';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const MetadataEditor = () => {
  const { paperId, metadata, setMetadata, setStep } = useWorkflow();
  const { loading, execute } = useApi();
  const [editedMetadata, setEditedMetadata] = useState(metadata);
  const [hasChanges, setHasChanges] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    setEditedMetadata(metadata);
  }, [metadata]);

  useEffect(() => {
    const changed = JSON.stringify(editedMetadata) !== JSON.stringify(metadata);
    setHasChanges(changed);
  }, [editedMetadata, metadata]);

  const handleInputChange = (field, value) => {
    setEditedMetadata(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!paperId) return;

    try {
      await execute(() => apiService.updatePaperMetadata(paperId, editedMetadata), {
        successMessage: 'Metadata updated successfully!',
        showSuccess: true
      });
      
      setMetadata(editedMetadata);
      setHasChanges(false);
    } catch (error) {
      // Error handling is done by the execute function
    }
  };

  const handleDownloadPaper = async () => {
    if (!paperId) return;

    setDownloadLoading(true);
    try {
      // Try to download the original research paper PDF
      const response = await apiService.downloadPaperPdf(paperId);
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create download URL
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${editedMetadata.title || 'research_paper'}.pdf`);
      
      // Append to body and click
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Paper downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      
      // Fallback: try downloading source files
      try {
        const sourceResponse = await apiService.downloadPaperSource(paperId);
        const blob = new Blob([sourceResponse.data], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${editedMetadata.title || 'research_paper'}_source.zip`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Paper source files downloaded successfully!');
      } catch (sourceError) {
        toast.error('Failed to download paper. The file may not be available.');
      }
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleContinue = () => {
    if (hasChanges) {
      toast.error('Please save your changes before continuing');
      return;
    }
    setStep(3); // Move to script generation
  };

  if (!paperId || !metadata) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No paper data available. Please upload a paper first.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with Download Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Paper Metadata
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review and edit the paper information before proceeding
          </p>
        </div>
        
        {/* Download Paper Button */}
        <motion.button
          onClick={handleDownloadPaper}
          disabled={downloadLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
        >
          <FiDownload className={`w-4 h-4 mr-2 ${downloadLoading ? 'animate-bounce' : ''}`} />
          {downloadLoading ? 'Downloading...' : 'Download Paper'}
        </motion.button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Paper Title
        </label>
        <input
          type="text"
          value={editedMetadata.title || ''}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors duration-200"
          placeholder="Enter paper title"
        />
      </div>

      {/* Authors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Authors
        </label>
        <input
          type="text"
          value={editedMetadata.authors || ''}
          onChange={(e) => handleInputChange('authors', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors duration-200"
          placeholder="Enter author names"
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Publication Date
        </label>
        <input
          type="text"
          value={editedMetadata.date || ''}
          onChange={(e) => handleInputChange('date', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors duration-200"
          placeholder="Enter publication date"
        />
      </div>

      {/* arXiv ID (if available) */}
      {editedMetadata.arxiv_id && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            arXiv ID
          </label>
          <input
            type="text"
            value={editedMetadata.arxiv_id}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={!hasChanges || loading}
          className="flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <FiSave className="w-5 h-5 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        
        {/*<button
          onClick={handleContinue}
          disabled={hasChanges}
          className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <FiEdit3 className="w-5 h-5 mr-2" />
          Continue to Script Generation
        </button>*/}
      </div>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
        >
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            You have unsaved changes. Please save before continuing to the next step.
          </p>
        </motion.div>
      )}

      {/* Download Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      >
        <div className="flex items-start space-x-3">
          <FiDownload className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Download Original Paper
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Click the download button above to get the original research paper PDF or source files.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MetadataEditor;
