import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMic, FiVideo, FiPlay, FiPause, FiDownload, 
  FiSettings, FiVolume2, FiMusic, FiArrowRight, FiExternalLink
} from 'react-icons/fi';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useWorkflow } from '../contexts/WorkflowContext';
import { apiService } from '../services/api';
import { downloadFile } from '../utils/helpers';
import { TTS_VOICES } from '../utils/constants';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // Add this import

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




const VoiceSelector = ({ language, selectedVoice, onVoiceChange }) => {
  const voices = TTS_VOICES[language.toUpperCase()] || {};

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {language} Voice
      </label>
      <select
        value={selectedVoice}
        onChange={(e) => onVoiceChange(language, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
      >
        {Object.entries(voices).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

const AudioPlayer = ({ src, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = React.useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <audio ref={audioRef} src={src} />
      
      <div className="flex items-center space-x-3">
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors duration-200"
        >
          {isPlaying ? (
            <FiPause className="w-5 h-5" />
          ) : (
            <FiPlay className="w-5 h-5 ml-0.5" />
          )}
        </button>
        
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span className="font-medium">{title}</span>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-200"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaGeneration = () => {
  const navigate = useNavigate();
  const { paperId, audioFiles, setAudioFiles, videoPath, setVideoPath, setStep } = useWorkflow();
  const [audioLoading, setAudioLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [voiceSelections, setVoiceSelections] = useState({
    English: 'meera',
    Hindi: 'amol'
  });
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [backgroundMusicFile, setBackgroundMusicFile] = useState(null);
  const [hinglishIterations, setHinglishIterations] = useState(3);
  const videoRef = React.useRef(null);

  const handleVoiceChange = (language, voice) => {
    setVoiceSelections(prev => ({ ...prev, [language]: voice }));
  };

  const handleGenerateAudio = async () => {
    if (!paperId) return;

    setAudioLoading(true);
    try {
      const config = {
        voice_selection: voiceSelections,
        hinglish_iterations: hinglishIterations,
        show_hindi_debug: false,
        selected_language: selectedLanguage
      };

      const response = await apiService.generateAudio(paperId, config);
      console.log("Audio files returned:", response.data.audio_files);

      setAudioFiles(response.data.audio_files);
      toast.success('Audio generated successfully!');
    } catch (error) {
      toast.error('Failed to generate audio');
    } finally {
      setAudioLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!paperId) return;

    setVideoLoading(true);
    try {
      const config = {
        background_music_file: backgroundMusicFile,
        selected_language: selectedLanguage
      };

      const response = await apiService.generateVideo(paperId, config);
      setVideoPath(response.data.video_path);
      toast.success('Video generated successfully!');
    } catch (error) {
      toast.error('Failed to generate video');
    } finally {
      setVideoLoading(false);
    }
  };

  const handleDownloadVideo = async () => {
    if (!paperId || !videoPath) return;

    try {
      const response = await apiService.downloadVideo(paperId);
      downloadFile(response.data, `presentation_${paperId}.mp4`);
      toast.success('Video downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download video');
    }
  };

  const handleContinueToResults = () => {
    if (!videoPath) {
      toast.error('Please generate video first');
      return;
    }
    setStep(6); // Move to results
    navigate('/results');
  };
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoPath]);

  const breadcrumbs = [
    { label: 'Media Generation', href: '/media-generation' }
  ];

  if (!paperId) {
    return (
      <Layout title="" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <FiVideo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Paper Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please complete the slide creation step first.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="" breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Generate Audio & Video
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Convert your scripts to audio narration and create the final video
          </p>
        </div>

        {/* Audio Generation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <FiMic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Audio Generation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Convert scripts to speech using AI voices
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateAudio}
              disabled={audioLoading || (audioFiles && audioFiles.length>0)}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
            >
              {audioLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FiVolume2 className="w-5 h-5 mr-2" />
                  Generate Audio
                </>
              )}
            </button>
          </div>

          {/* Voice Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <VoiceSelector
              language="English"
              selectedVoice={voiceSelections.English}
              onVoiceChange={handleVoiceChange}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>

          {/* Generated Audio Files */}
          {audioFiles && audioFiles.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Generated Audio Files</h4>
              {audioFiles.map((file, index) => (
                <AudioPlayer
                  key={file}
                  src={apiService.getAudioStreamUrl(paperId, file)}
                  title={`Section ${index + 1}`}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Video Generation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <FiVideo className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Video Generation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Combine slides with audio to create final video
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={videoLoading || !audioFiles || audioFiles.length === 0}
              className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
            >
              {videoLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FiVideo className="w-5 h-5 mr-2" />
                  Generate Video
                </>
              )}
            </button>
          </div>

          {/* Background Music Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background Music (Optional)
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setBackgroundMusicFile(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Upload an audio file to add background music to your video
            </p>
          </div>

          {/* Generated Video */}
          {videoPath && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Generated Video</h4>
              <VideoPlayer
                src={apiService.getVideoStreamUrl(paperId)}
                title="Generated Presentation"
                paperId={paperId}
              />
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDownloadVideo}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <FiDownload className="w-4 h-4 mr-2" />
                  Download Video
                </button>
                
                <button
                  onClick={handleContinueToResults}
                  className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <FiArrowRight className="w-4 h-4 mr-2" />
                  Continue to Artifacts
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Requirements Notice */}
        {(!audioFiles || audioFiles.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6"
          >
            <div className="flex items-start space-x-3">
              <FiSettings className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Audio Required
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Please generate audio files first before creating the video. 
                  The audio will be synchronized with your slides to create the final presentation.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default MediaGeneration;
