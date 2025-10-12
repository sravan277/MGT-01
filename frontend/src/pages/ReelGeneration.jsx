import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiFilm, 
  FiPlay,
  FiDownload,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useWorkflow } from '../contexts/WorkflowContext';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const ReelGeneration = () => {
  const { paperId, metadata } = useWorkflow();
  const [generating, setGenerating] = useState(false);
  const [reelGenerated, setReelGenerated] = useState(false);
  const [reelUrl, setReelUrl] = useState(null);
  const [duration, setDuration] = useState(40);

  const breadcrumbs = [
    { label: 'AI Reel Generation', href: '/reel-generation' }
  ];

  const handleGenerateReel = async () => {
    if (!paperId) {
      toast.error('No paper selected');
      return;
    }

    setGenerating(true);

    try {
      // Call API with just duration and language (video is hardcoded on backend)
      const response = await apiService.generateReel(paperId, {
        duration,
        language: 'en-IN'
      });
      
      toast.success('Reel generated successfully!');
      setReelGenerated(true);
      setReelUrl(response.data.reel_path);
      
    } catch (error) {
      console.error('Error generating reel:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate reel');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (reelUrl) {
      const link = document.createElement('a');
      link.href = `${apiService.API_BASE_URL}${reelUrl}`;
      link.download = `reel_${paperId}.mp4`;
      link.click();
    }
  };

  if (!paperId) {
    return (
      <Layout title="" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <FiFilm className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Paper Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please upload a paper first to generate an AI reel.
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
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center">
              <FiFilm className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                AI Reel Generator
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {metadata?.title || 'Generate a 40-second social media reel'}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mt-4">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Car racing video loops on top half</li>
                  <li>AI generates 3-slide summary of your paper</li>
                  <li>Creates narrated reel in 1920x1080 vertical format</li>
                  <li>Perfect for social media sharing!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Duration Settings */}
        <div className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 rounded-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            1. Set Duration
          </h3>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="30"
              max="60"
              step="5"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex items-center gap-2 min-w-[100px]">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {duration}
              </span>
              <span className="text-gray-600 dark:text-gray-400">seconds</span>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 rounded-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            2. Generate Reel
          </h3>

          <button
            onClick={handleGenerateReel}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg
                       bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400
                       text-white font-semibold text-lg transition-all duration-200
                       disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {generating ? (
              <>
                <LoadingSpinner size="sm" />
                Generating Your Reel...
              </>
            ) : reelGenerated ? (
              <>
                <FiCheck className="w-5 h-5" />
                Reel Generated!
              </>
            ) : (
              <>
                <FiPlay className="w-5 h-5" />
                Generate AI Reel
              </>
            )}
          </button>

          {generating && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This may take 2-3 minutes. AI is creating your reel...
              </p>
            </div>
          )}
        </div>

        {/* View & Download Section */}
        {reelGenerated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Success Banner */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <FiCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                      Your AI Reel is Ready!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Preview below or download to share on social media
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700
                             text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <FiDownload className="w-5 h-5" />
                  Download
                </button>
              </div>
            </div>

            {/* Video Player */}
            <div className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 rounded-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Preview Your Reel
              </h3>
              <div className="flex justify-center">
                <div className="relative rounded-lg overflow-hidden bg-black" style={{ width: '432px', height: '850px', maxHeight: '80vh' }}>
                  <video
                    src={`${apiService.API_BASE_URL}${reelUrl}`}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                    style={{ objectFit: 'contain' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
                1920x1080 vertical format • {duration} seconds • Perfect for social media reels
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default ReelGeneration;
