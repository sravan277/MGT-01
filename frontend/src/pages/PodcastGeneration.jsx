import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMic, 
  FiPlay,
  FiPause,
  FiDownload,
  FiCheck,
  FiAlertCircle,
  FiClock,
  FiList
} from 'react-icons/fi';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useWorkflow } from '../contexts/WorkflowContext';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const PodcastGeneration = () => {
  const { paperId, metadata } = useWorkflow();
  const [generating, setGenerating] = useState(false);
  const [podcastGenerated, setPodcastGenerated] = useState(false);
  const [podcastData, setPodcastData] = useState(null);
  const [duration, setDuration] = useState(5);
  const [language, setLanguage] = useState('en-IN');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);

  const languages = [
    { code: 'en-IN', name: 'English (India)' },
    { code: 'hi-IN', name: 'Hindi (हिन्दी)' },
    { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
    { code: 'te-IN', name: 'Telugu (తెలుగు)' },
    { code: 'bn-IN', name: 'Bengali (বাংলা)' },
    { code: 'ml-IN', name: 'Malayalam (മലയാളം)' },
    { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'mr-IN', name: 'Marathi (मराठी)' },
    { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)' }
  ];

  const breadcrumbs = [
    { label: 'Podcast Generation', href: '/podcast-generation' }
  ];

  useEffect(() => {
    // Check if podcast already exists
    if (paperId) {
      checkPodcastStatus();
    }
  }, [paperId]);

  const checkPodcastStatus = async () => {
    try {
      const response = await apiService.getPodcastStatus(paperId);
      if (response.data.exists) {
        setPodcastGenerated(true);
        setPodcastData(response.data.metadata);
      }
    } catch (error) {
      // Podcast doesn't exist yet, that's fine
    }
  };

  const handleGeneratePodcast = async () => {
    if (!paperId) {
      toast.error('No paper selected');
      return;
    }

    setGenerating(true);

    try {
      const response = await apiService.generatePodcast(paperId, {
        duration_minutes: duration,
        language: language
      });
      
      const selectedLangName = languages.find(l => l.code === language)?.name || language;
      toast.success(`2-speaker podcast generated successfully in ${selectedLangName}!`);
      setPodcastGenerated(true);
      setPodcastData({
        title: response.data.title,
        description: response.data.description,
        duration_minutes: response.data.duration_minutes,
        dialogue_turns: response.data.dialogue_turns,
        speakers: response.data.speakers,
        audio_url: response.data.audio_url,
        download_url: response.data.download_url
      });
      
    } catch (error) {
      console.error('Error generating podcast:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate podcast');
    } finally {
      setGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef) {
      if (isPlaying) {
        audioRef.pause();
      } else {
        audioRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (podcastData?.download_url) {
      const link = document.createElement('a');
      link.href = `${apiService.API_BASE_URL}${podcastData.download_url}`;
      link.download = `podcast_${paperId}.wav`;
      link.click();
    }
  };

  if (!paperId) {
    return (
      <Layout title="" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <FiMic className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Paper Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please upload a paper first to generate a podcast.
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
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <FiMic className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                2-Speaker Podcast Generator
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {metadata?.title || 'Generate a conversational podcast with host & expert discussing your research'}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mt-4">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">2-Speaker Podcast Format:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Speaker 1 (Host - Female Voice):</strong> Guides the conversation, asks questions</li>
                  <li><strong>Speaker 2 (Expert - Male Voice):</strong> Explains the research, provides insights</li>
                  <li>Natural dialogue format makes complex research accessible</li>
                  <li>Perfect for listening on the go!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 rounded-md p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              1. Select Language
            </h3>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={generating || podcastGenerated}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              The podcast dialogue will be generated in the selected language
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              2. Set Duration
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Choose podcast length (both speakers will alternate automatically)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  disabled={generating || podcastGenerated}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:opacity-50"
                />
                <div className="flex items-center gap-2 min-w-[120px]">
                  <FiClock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {duration}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 rounded-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            3. Generate Podcast
          </h3>

          <button
            onClick={handleGeneratePodcast}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg
                       bg-green-600 hover:bg-green-700 disabled:bg-gray-400
                       text-white font-semibold text-lg transition-all duration-200
                       disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {generating ? (
              <>
                <LoadingSpinner size="sm" />
                Generating Your Podcast...
              </>
            ) : podcastGenerated ? (
              <>
                <FiCheck className="w-5 h-5" />
                Podcast Generated!
              </>
            ) : (
              <>
                <FiMic className="w-5 h-5" />
                Generate Podcast
              </>
            )}
          </button>

          {generating && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This may take 3-5 minutes. AI is creating a natural conversation between 2 speakers...
              </p>
            </div>
          )}
        </div>

        {/* Audio Player & Download Section */}
        {podcastGenerated && podcastData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Success Banner */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <FiCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                      {podcastData.title || 'Your Podcast is Ready!'}
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {podcastData.description || 'Listen below or download'}
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

            {/* Audio Player */}
            <div className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 rounded-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiPlay className="w-5 h-5" />
                  Listen to Your Podcast
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                    🎙️ 2 Speakers
                  </span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-8">
                <div className="max-w-2xl mx-auto">
                  {/* Custom Audio Player */}
                  <div className="bg-white dark:bg-neutral-700 rounded-lg shadow-lg p-6">
                    <audio
                      ref={setAudioRef}
                      src={`${apiService.API_BASE_URL}${podcastData.audio_url}`}
                      onEnded={() => setIsPlaying(false)}
                      className="w-full"
                      controls
                    />
                    
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <FiClock className="inline w-4 h-4 mr-1" />
                        Duration: {podcastData.duration_minutes || duration} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
                Audio format: WAV • Perfect for sharing and listening
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default PodcastGeneration;
