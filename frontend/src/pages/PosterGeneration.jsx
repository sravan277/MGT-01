import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiImage, 
  FiDownload,
  FiCheck,
  FiAlertCircle,
  FiLayers
} from 'react-icons/fi';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useWorkflow } from '../contexts/WorkflowContext';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const PosterGeneration = () => {
  const { paperId, metadata } = useWorkflow();
  const [generating, setGenerating] = useState(false);
  const [posterGenerated, setPosterGenerated] = useState(false);
  const [posterData, setPosterData] = useState(null);

  const breadcrumbs = [
    { label: 'AI Poster Generation', href: '/poster-generation' }
  ];

  useEffect(() => {
    // Check if poster already exists
    if (paperId) {
      checkPosterStatus();
    }
  }, [paperId]);

  const checkPosterStatus = async () => {
    try {
      const response = await apiService.getPosterStatus(paperId);
      if (response.data.exists) {
        setPosterGenerated(true);
        setPosterData(response.data.metadata);
      }
    } catch (error) {
      // Poster doesn't exist yet, that's fine
    }
  };

  const handleGeneratePoster = async () => {
    if (!paperId) {
      toast.error('No paper selected');
      return;
    }

    setGenerating(true);

    try {
      const response = await apiService.generatePoster(paperId);
      
      toast.success('AI Poster generated successfully!');
      setPosterGenerated(true);
      setPosterData({
        title: response.data.title,
        num_images: response.data.num_images,
        poster_url: response.data.poster_url,
        download_url: response.data.download_url
      });
      
    } catch (error) {
      console.error('Error generating poster:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate poster');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (posterData?.download_url) {
      const link = document.createElement('a');
      link.href = `${apiService.API_BASE_URL}${posterData.download_url}`;
      link.download = `research_poster_${paperId}.png`;
      link.click();
    }
  };

  if (!paperId) {
    return (
      <Layout title="" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <FiImage className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Paper Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please upload a paper first to generate a poster.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="" breadcrumbs={breadcrumbs}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 rounded-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <FiImage className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                AI Poster Generator
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {metadata?.title || 'Create a beautiful research poster automatically'}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mt-4">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>AI extracts key findings and insights from your paper</li>
                  <li>Randomly selects relevant images from your research</li>
                  <li>Creates a professionally designed poster layout</li>
                  <li>Perfect for conferences and presentations!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 rounded-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Generate Your Poster
          </h3>

          <button
            onClick={handleGeneratePoster}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg
                       bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400
                       text-white font-semibold text-lg transition-all duration-200
                       disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {generating ? (
              <>
                <LoadingSpinner size="sm" />
                Generating Your Poster...
              </>
            ) : posterGenerated ? (
              <>
                <FiCheck className="w-5 h-5" />
                Poster Generated!
              </>
            ) : (
              <>
                <FiLayers className="w-5 h-5" />
                Generate AI Poster
              </>
            )}
          </button>

          {generating && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This may take 1-2 minutes. AI is designing your poster...
              </p>
            </div>
          )}
        </div>

        {/* Poster Preview & Download Section */}
        {posterGenerated && posterData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Success Banner */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <FiCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                      {posterData.title || 'Your Poster is Ready!'}
                    </h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {posterData.num_images || 0} images included • 1200x1600 pixels
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700
                             text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <FiDownload className="w-5 h-5" />
                  Download
                </button>
              </div>
            </div>

            {/* Poster Preview */}
            <div className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 rounded-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Preview Your Poster
              </h3>
              
              <div className="flex justify-center bg-gray-100 dark:bg-gray-900 rounded-lg p-6">
                <div className="max-w-2xl w-full">
                  <img
                    src={`${apiService.API_BASE_URL}${posterData.poster_url}`}
                    alt="Research Poster"
                    className="w-full h-auto rounded-lg shadow-2xl border-4 border-white dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  High-quality PNG • 1200x1600 pixels • Ready for printing or digital display
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default PosterGeneration;
