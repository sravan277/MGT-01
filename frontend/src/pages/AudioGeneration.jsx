import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/common/Layout';
import { useWorkflow } from '../contexts/WorkflowContext';
import { FiHeadphones, FiPlay, FiPause, FiDownload, FiRefreshCw, FiVolume2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const AudioGeneration = () => {
  const { paperId, metadata } = useWorkflow();
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [summary, setSummary] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const audioRef = useRef(null);

  const breadcrumbs = [
    { label: 'Output Selection', href: '/output-selection' },
    { label: 'Audio Generation', href: '/audio-generation' }
  ];

  const languages = [
    { code: 'en-IN', name: 'English (India)' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'ta-IN', name: 'Tamil' },
    { code: 'te-IN', name: 'Telugu' },
    { code: 'bn-IN', name: 'Bengali' },
    { code: 'ml-IN', name: 'Malayalam' },
    { code: 'kn-IN', name: 'Kannada' }
  ];

  useEffect(() => {
    // Check if audio already exists
    checkAudioStatus();
  }, [paperId]);

  useEffect(() => {
    // Load audio when URL changes
    if (audioRef.current && audioUrl) {
      const fullUrl = `${process.env.REACT_APP_API_BASE_URL}${audioUrl}`;
      console.log('Loading audio from:', fullUrl);
      audioRef.current.src = fullUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  const checkAudioStatus = async () => {
    try {
      const response = await api.get(`/audio/${paperId}/status`);
      if (response.data.exists) {
        setAudioUrl(response.data.audio_url);
        setSummary(response.data.summary || '');
      }
    } catch (error) {
      console.log('No existing audio found');
    }
  };

  const generateAudio = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post(`/audio/${paperId}/generate`, {
        language: language
      });

      console.log('Audio generation response:', response.data);
      
      if (response.data.audio_url) {
        const fullAudioUrl = `${process.env.REACT_APP_API_BASE_URL}${response.data.audio_url}`;
        console.log('Full audio URL:', fullAudioUrl);
        setAudioUrl(response.data.audio_url);
        setSummary(response.data.summary);
        toast.success('Audio summary generated successfully!');
        
        // Test if the audio URL is accessible
        fetch(fullAudioUrl)
          .then(res => {
            console.log('Audio fetch test:', res.status, res.headers.get('content-type'));
            if (!res.ok) {
              console.error('Audio not accessible:', res.status);
              toast.error('Audio file not accessible. Please try again.');
            }
          })
          .catch(err => console.error('Audio fetch error:', err));
      } else {
        toast.error('No audio URL returned from server');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate audio');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const downloadAudio = async () => {
    try {
      window.open(`${process.env.REACT_APP_API_BASE_URL}/api/audio/${paperId}/download`, '_blank');
      toast.success('Audio download started');
    } catch (error) {
      toast.error('Failed to download audio');
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!paperId) {
    return (
      <Layout title="Audio Generation" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <FiHeadphones className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Paper Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please upload a paper first to generate audio summary.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Audio Summary Generation" breadcrumbs={breadcrumbs}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <FiHeadphones className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Audio Summary</h2>
              <p className="text-teal-100">Generate audio narration from your paper summary</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <p className="font-semibold">{metadata?.title || 'Research Paper'}</p>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Select Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isGenerating || audioUrl}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Generate Button */}
        {!audioUrl && (
          <motion.button
            onClick={generateAudio}
            disabled={isGenerating}
            whileHover={{ scale: isGenerating ? 1 : 1.02 }}
            whileTap={{ scale: isGenerating ? 1 : 0.98 }}
            className={`
              w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3
              ${isGenerating
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl'
              }
            `}
          >
            {isGenerating ? (
              <>
                <FiRefreshCw className="w-6 h-6 animate-spin" />
                Generating Audio...
              </>
            ) : (
              <>
                <FiVolume2 className="w-6 h-6" />
                Generate Audio Summary
              </>
            )}
          </motion.button>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-xl border-2 border-teal-200 dark:border-teal-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiHeadphones className="text-teal-600" />
                Audio Player
              </h3>
              <button
                onClick={downloadAudio}
                className="flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                Download
              </button>
            </div>

            {/* Audio Element */}
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onError={(e) => {
                console.error('Audio playback error:', e.target.error);
                const error = e.target.error;
                if (error) {
                  console.error('Error code:', error.code, 'Message:', error.message);
                }
                toast.error('Audio playback failed. The file may not be ready yet.');
                setIsPlaying(false);
              }}
              onCanPlay={() => {
                console.log('Audio can play');
              }}
              className="hidden"
              crossOrigin="anonymous"
            >
              <source 
                src={`${process.env.REACT_APP_API_BASE_URL}${audioUrl}`} 
                type="audio/mpeg" 
              />
              Your browser does not support the audio element.
            </audio>

            {/* Custom Player Controls */}
            <div className="space-y-4">
              {/* Play/Pause Button */}
              <div className="flex items-center justify-center">
                <button
                  onClick={togglePlayPause}
                  className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110"
                >
                  {isPlaying ? (
                    <FiPause className="w-10 h-10 text-white" />
                  ) : (
                    <FiPlay className="w-10 h-10 text-white ml-1" />
                  )}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={duration > 0 ? (currentTime / duration) * 100 : 0}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  style={{
                    background: `linear-gradient(to right, rgb(20 184 166) 0%, rgb(20 184 166) ${(currentTime / duration) * 100}%, rgb(229 231 235) ${(currentTime / duration) * 100}%, rgb(229 231 235) 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* Regenerate Button */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setAudioUrl(null);
                  setSummary('');
                  setIsPlaying(false);
                }}
                className="w-full py-3 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors flex items-center justify-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Generate New Audio
              </button>
            </div>
          </div>
        )}

        {/* Summary Text */}
        {summary && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Summary Text
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default AudioGeneration;
