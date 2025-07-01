import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiDownload, FiVideo, FiFileText, FiImage, FiMic,
  FiShare2, FiRefreshCw, FiCheckCircle, FiHome,
  FiPlay, FiPause, FiVolume2, FiExternalLink,
  FiCopy, FiEye, FiFolder, FiClock
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useWorkflow } from '../contexts/WorkflowContext';
import { apiService } from '../services/api';
import { downloadFile, formatFileSize, copyToClipboard } from '../utils/helpers';
import toast from 'react-hot-toast';

const VideoPlayer = ({ src, title, paperId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = React.useRef(null);
  const containerRef = React.useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="bg-black rounded-lg overflow-hidden">
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          onClick={togglePlay}
        />
        
        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
          {/* Play/Pause Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200"
            >
              {isPlaying ? (
                <FiPause className="w-8 h-8 text-white" />
              ) : (
                <FiPlay className="w-8 h-8 text-white ml-1" />
              )}
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Progress Bar */}
            <div className="mb-3">
              <div 
                className="w-full h-2 bg-white/20 rounded-full cursor-pointer"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-200"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <button onClick={togglePlay} className="hover:text-red-400 transition-colors">
                  {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
                </button>
                <div className="flex items-center space-x-2">
                  <FiVolume2 className="w-4 h-4" />
                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={toggleFullscreen}
                  className="hover:text-red-400 transition-colors"
                >
                  <FiExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DownloadCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onDownload, 
  onPreview,
  disabled, 
  color = 'primary',
  fileSize,
  isLoading = false
}) => {
  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            {/* {fileSize && (
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                {fileSize}
              </span>
            )} */}
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onDownload}
              disabled={disabled || isLoading}
              className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <FiDownload className="w-4 h-4 mr-2" />
              )}
              Download
            </button>
            
            {onPreview && (
              <button
                onClick={onPreview}
                disabled={disabled}
                className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors duration-200"
              >
                <FiEye className="w-4 h-4 mr-2" />
                Preview
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StatsCard = ({ icon: Icon, label, value, subValue, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
          {subValue && (
            <div className="text-xs text-gray-400 dark:text-gray-500">{subValue}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ShareModal = ({ isOpen, onClose, paperId, metadata }) => {
  const [shareUrl] = useState(`${window.location.origin}/results?paper=${paperId}`);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyBibTeX = async () => {
    const bibtex = `@article{${paperId},
  title={${metadata.title}},
  author={${metadata.authors}},
  year={${new Date(metadata.date).getFullYear()}},
  note={Generated with Saral AI}
}`;
    
    const success = await copyToClipboard(bibtex);
    if (success) {
      toast.success('BibTeX copied to clipboard!');
    }
  };

  if (!isOpen) return null;

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
        className="bg-white dark:bg-gray-800 rounded-xl p-6 m-4 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Share Presentation
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Share Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  copied
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <button
              onClick={handleCopyBibTeX}
              className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors duration-200"
            >
              <FiCopy className="w-4 h-4 mr-2" />
              Copy BibTeX Citation
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Results = () => {
  const { 
    paperId, 
    metadata, 
    videoPath, 
    audioFiles, 
    slides, 
    resetWorkflow 
  } = useWorkflow();

  const [downloadLoading, setDownloadLoading] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [videoStats, setVideoStats] = useState(null);
  const [projectStats, setProjectStats] = useState({
    startTime: localStorage.getItem(`project_${paperId}_start`),
    endTime: new Date().toISOString()
  });

  useEffect(() => {
    if (paperId && !projectStats.startTime) {
      const startTime = new Date().toISOString();
      localStorage.setItem(`project_${paperId}_start`, startTime);
      setProjectStats(prev => ({ ...prev, startTime }));
    }
  }, [paperId]);

  const handleDownloadWithLoading = async (downloadKey, downloadFn) => {
    setDownloadLoading(prev => ({ ...prev, [downloadKey]: true }));
    try {
      await downloadFn();
    } finally {
      setDownloadLoading(prev => ({ ...prev, [downloadKey]: false }));
    }
  };

  const handleDownloadVideo = async () => {
    await handleDownloadWithLoading('video', async () => {
      const response = await apiService.downloadVideo(paperId);
      downloadFile(response.data, `presentation_${paperId}.mp4`);
      toast.success('Video downloaded successfully!');
    });
  };

  const handleDownloadSlides = async () => {
    await handleDownloadWithLoading('slides', async () => {
      const response = await apiService.downloadSlides(paperId);
      downloadFile(response.data, `slides_${paperId}.pdf`);
      toast.success('Slides downloaded successfully!');
    });
  };

  const handleDownloadAudio = async (filename) => {
    await handleDownloadWithLoading(`audio_${filename}`, async () => {
      const response = await apiService.downloadAudio(paperId, filename);
      downloadFile(response.data, filename);
      toast.success('Audio downloaded successfully!');
    });
  };

  const handleDownloadAll = async () => {
    await handleDownloadWithLoading('all', async () => {
      // Create a zip file with all assets
      toast.info('Preparing download package...');
      
      // Download video
      const videoResponse = await apiService.downloadVideo(paperId);
      downloadFile(videoResponse.data, `presentation_${paperId}.mp4`);
      
      // Download slides
      const slidesResponse = await apiService.downloadSlides(paperId);
      downloadFile(slidesResponse.data, `slides_${paperId}.pdf`);
      
      // Download audio files
      for (const file of audioFiles) {
        const audioResponse = await apiService.downloadAudio(paperId, file);
        downloadFile(audioResponse.data, file);
      }
      
      toast.success('All files downloaded successfully!');
    });
  };

  const handleStartNew = () => {
    if (paperId) {
      localStorage.removeItem(`project_${paperId}_start`);
    }
    resetWorkflow();
    toast.success('Ready for a new project!');
  };

  const calculateProcessingTime = () => {
    if (!projectStats.startTime) return null;
    const start = new Date(projectStats.startTime);
    const end = new Date(projectStats.endTime);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins > 0 ? `${diffMins} minutes` : 'Less than a minute';
  };

  const breadcrumbs = [
    { label: 'Results', href: '/results' }
  ];

  if (!paperId) {
    return (
      <Layout title="Results" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <FiCheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Results Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Complete the workflow to see your results here.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <FiHome className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="" breadcrumbs={breadcrumbs}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
            <FiCheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Presentation Complete!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            Your academic paper has been successfully converted into a professional presentation video. 
            Download your files below.
          </p>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <FiShare2 className="w-4 h-4 mr-2" />
              Share
            </button> */}
            
            {/* <button
              onClick={handleDownloadAll}
              disabled={downloadLoading.all}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
            >
              {downloadLoading.all ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <FiFolder className="w-4 h-4 mr-2" />
              )}
              Download All
            </button> */}
          </div>
        </motion.div>

        {/* Paper Information */}
        {metadata && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Paper Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</label>
                <p className="text-gray-900 dark:text-white">{metadata.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Authors</label>
                <p className="text-gray-900 dark:text-white">{metadata.authors}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</label>
                <p className="text-gray-900 dark:text-white">{metadata.date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Paper ID</label>
                <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">{paperId}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Statistics */}
        {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={FiVideo}
            label="Video Generated"
            value={videoPath ? "1" : "0"}
            subValue={videoPath ? "Ready for download" : "Not generated"}
            color="green"
          />
          <StatsCard
            icon={FiImage}
            label="Slides Created"
            value={slides ? slides.length : 0}
            subValue={slides ? `${slides.length} pages` : "Not created"}
            color="blue"
          />
          <StatsCard
            icon={FiMic}
            label="Audio Files"
            value={audioFiles ? audioFiles.length : 0}
            subValue={audioFiles ? "TTS generated" : "Not generated"}
            color="purple"
          />
          <StatsCard
            icon={FiClock}
            label="Processing Time"
            value={calculateProcessingTime() || "N/A"}
            subValue="Total duration"
            color="primary"
          />
        </div> */}

        {/* Video Preview */}
        {videoPath && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Video Preview
            </h3>
            <VideoPlayer
              src={apiService.getVideoStreamUrl(paperId)}
              title="Generated Presentation"
              paperId={paperId}
            />
          </motion.div>
        )}

        {/* Download Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Download Your Files
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video Download */}
            <DownloadCard
              icon={FiVideo}
              title="Final Video"
              description="Complete presentation video with narration and slides"
              onDownload={handleDownloadVideo}
              onPreview={() => document.querySelector('video')?.scrollIntoView()}
              disabled={!videoPath}
              color="green"
              fileSize="~50MB"
              isLoading={downloadLoading.video}
            />

            {/* Slides Download */}
            <DownloadCard
              icon={FiFileText}
              title="PDF Slides"
              description="Presentation slides in PDF format"
              onDownload={handleDownloadSlides}
              disabled={!slides || slides.length === 0}
              color="blue"
              fileSize="~5MB"
              isLoading={downloadLoading.slides}
            />
          </div>
        </motion.div>

        {/* Audio Files */}
        {audioFiles && audioFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Individual Audio Files
            </h3>
            <div className="space-y-3">
              {audioFiles.map((file, index) => (
                <div
                  key={file}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <FiMic className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{file}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Section {index + 1}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadAudio(file)}
                    disabled={downloadLoading[`audio_${file}`]}
                    className="flex items-center px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded transition-colors duration-200"
                  >
                    {downloadLoading[`audio_${file}`] ? (
                      <LoadingSpinner size="sm" className="mr-1" />
                    ) : (
                      <FiDownload className="w-4 h-4 mr-1" />
                    )}
                    Download
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <button
            onClick={handleStartNew}
            className="flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <FiRefreshCw className="w-5 h-5 mr-2" />
            Start New Project
          </button>
          
          <Link
            to="/"
            className="flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors duration-200"
          >
            <FiHome className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </motion.div>

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <ShareModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              paperId={paperId}
              metadata={metadata}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Results;
