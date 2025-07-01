import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFile, FiX, FiGlobe, FiCheck, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';
import { useWorkflow } from '../../contexts/WorkflowContext';
import LoadingSpinner from '../common/LoadingSpinner';

const PaperUpload = () => {
  const { setLoading, setPaperId, setMetadata, setImages, setStep } = useWorkflow();
  const [uploadType, setUploadType] = useState('file'); // 'file', 'arxiv', or 'pdf'
  const [arxivUrl, setArxivUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (uploadType === 'file' && file && file.type === 'application/zip') {
      setUploadedFile(file);
    } else if (uploadType === 'pdf' && file && file.type === 'application/pdf') {
      setUploadedFile(file);
    } else {
      if (uploadType === 'file') {
        toast.error('Please upload a ZIP file containing LaTeX source');
      } else if (uploadType === 'pdf') {
        toast.error('Please upload a PDF file');
      }
    }
  }, [uploadType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: uploadType === 'file' 
      ? { 'application/zip': ['.zip'] } 
      : { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  const handleArxivSubmit = async () => {
    if (!arxivUrl.trim()) {
      toast.error('Please enter an arXiv URL');
      return;
    }

    if (!arxivUrl.includes('arxiv.org')) {
      toast.error('Please enter a valid arXiv URL');
      return;
    }

    setProcessing(true);
    setLoading(true);

    try {
      const response = await apiService.scrapeArxiv(arxivUrl);
      const { paper_id, metadata, image_files } = response.data;
      
      setPaperId(paper_id);
      setMetadata(metadata);
      setImages(image_files);
      
      toast.success('Paper processed successfully!');
      setStep(3); // Move to script generation
    } catch (error) {
      toast.error('Failed to process arXiv paper');
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      toast.error(`Please select a ${uploadType === 'file' ? 'ZIP' : 'PDF'} file`);
      return;
    }

    setProcessing(true);
    setLoading(true);

    try {
      let response;
      
      if (uploadType === 'file') {
        toast.loading('Processing LaTeX files...');
        response = await apiService.uploadZip(uploadedFile);
      } else if (uploadType === 'pdf') {
        toast.loading('Extracting text and images from PDF...');
        response = await apiService.uploadPdf(uploadedFile);
      }
      
      const { paper_id, metadata, image_files } = response.data;
      
      setPaperId(paper_id);
      setMetadata(metadata);
      setImages(image_files);
      
      toast.dismiss();
      toast.success(`${uploadType === 'file' ? 'LaTeX' : 'PDF'} processed successfully!`);
      setStep(3); // Move to script generation
    } catch (error) {
      console.error(`Error uploading ${uploadType === 'file' ? 'ZIP' : 'PDF'}:`, error);
      toast.error(`Failed to process ${uploadType === 'file' ? 'ZIP' : 'PDF'} file: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload type selector */}
      <div className="flex space-x-4">
        <button
          onClick={() => {
            setUploadType('file');
            setUploadedFile(null);
          }}
          className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
            uploadType === 'file'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <FiUpload className="w-6 h-6 mx-auto mb-2 text-primary-600 dark:text-primary-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Upload ZIP File</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload LaTeX source files</p>
        </button>
        
        <button
          onClick={() => {
            setUploadType('pdf');
            setUploadedFile(null);
          }}
          className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
            uploadType === 'pdf'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <FiFileText className="w-6 h-6 mx-auto mb-2 text-primary-600 dark:text-primary-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">Upload PDF File</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload research paper PDF</p>
        </button>
        
        <button
          onClick={() => {
            setUploadType('arxiv');
            setUploadedFile(null);
          }}
          className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
            uploadType === 'arxiv'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <FiGlobe className="w-6 h-6 mx-auto mb-2 text-primary-600 dark:text-primary-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">arXiv URL</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Import from arXiv</p>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {(uploadType === 'file' || uploadType === 'pdf') ? (
          <motion.div
            key={`${uploadType}-upload`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* File dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <input {...getInputProps()} />
              <FiUpload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isDragActive ? 
                  `Drop your ${uploadType === 'file' ? 'ZIP' : 'PDF'} file here` : 
                  `Upload ${uploadType === 'file' ? 'LaTeX Source' : 'PDF File'}`
                }
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Drag and drop your {uploadType === 'file' ? 'ZIP' : 'PDF'} file here, or click to select
              </p>
              <p className="text-sm text-gray-400">Only {uploadType === 'file' ? 'ZIP' : 'PDF'} files are accepted</p>
            </div>

            {/* Uploaded file display */}
            <AnimatePresence>
              {uploadedFile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                        <FiFile className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload button */}
            <button
              onClick={handleFileUpload}
              disabled={!uploadedFile || processing}
              className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {processing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5 mr-2" />
                  Process Paper
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="arxiv-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* ArXiv URL input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                arXiv Paper URL
              </label>
              <input
                type="url"
                value={arxivUrl}
                onChange={(e) => setArxivUrl(e.target.value)}
                placeholder="https://arxiv.org/abs/2301.00000"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors duration-200"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Enter the URL of an arXiv paper (e.g., https://arxiv.org/abs/2301.00000)
              </p>
            </div>

            {/* Submit button */}
            <button
              onClick={handleArxivSubmit}
              disabled={!arxivUrl.trim() || processing}
              className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {processing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Fetching from arXiv...
                </>
              ) : (
                <>
                  <FiGlobe className="w-5 h-5 mr-2" />
                  Import from arXiv
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaperUpload;
