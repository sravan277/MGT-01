import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiPlay, FiUpload, FiKey, FiEdit3, FiSliders, 
  FiDownload, FiClock, FiCheck, FiArrowRight,
  FiFileText, FiVideo, FiMic, FiImage
} from 'react-icons/fi';
import Layout from '../components/common/Layout';
import { useWorkflow } from '../contexts/WorkflowContext';
import { apiService } from '../services/api';

const StepCard = ({ step, icon: Icon, title, description, isCompleted, isCurrent, isAccessible, to, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: step * 0.1 }}
      className={`p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
        isCurrent
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : isCompleted
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 hover:border-green-600 dark:hover:border-green-400'
          : isAccessible
          ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-60 cursor-not-allowed'
      }`}
      onClick={isAccessible ? onClick : undefined}
      whileHover={isAccessible ? { scale: 1.02 } : undefined}
      whileTap={isAccessible ? { scale: 0.98 } : undefined}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          isCompleted
            ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
            : isCurrent
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
            : isAccessible
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
        }`}>
          {isCompleted ? <FiCheck className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
        </div>
        
        <div className={`text-sm font-medium px-2 py-1 rounded ${
          isCompleted
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
            : isCurrent
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
          Step {step}
        </div>
      </div>
      
      <h3 className={`text-lg font-semibold mb-2 ${
        isAccessible ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'
      }`}>
        {title}
      </h3>
      
      <p className={`text-sm mb-4 ${
        isAccessible ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'
      }`}>
        {description}
      </p>
      
      {isAccessible && (
        <div className={`inline-flex items-center text-sm font-medium transition-colors duration-200 ${
          isCurrent
            ? 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
            : isCompleted
            ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}>
          {isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Start'}
          <FiArrowRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </motion.div>
  );
};

const StatsCard = ({ icon: Icon, title, value, subtitle, color = 'primary' }) => {
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
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">{title}</div>
          {subtitle && <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>}
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { currentStep, paperId, metadata, setStep } = useWorkflow();
  const [apiStatus, setApiStatus] = useState({});
  const [loading, setLoading] = useState(true);
  // Persistent storage for tracking highest step reached
  const [highestStepReached, setHighestStepReached] = useState(() => {
    const saved = localStorage.getItem('dashboard_highest_step');
    return saved ? Math.max(parseInt(saved), currentStep) : currentStep;
  });

  // Update highest step reached when currentStep changes
  useEffect(() => {
    if (currentStep > highestStepReached) {
      setHighestStepReached(currentStep);
      localStorage.setItem('dashboard_highest_step', currentStep.toString());
    }
  }, [currentStep, highestStepReached]);

  // Sync with any external changes to localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('dashboard_highest_step');
      if (saved) {
        const savedStep = parseInt(saved);
        setHighestStepReached(Math.max(savedStep, currentStep));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentStep]);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await apiService.getApiKeysStatus();
      setApiStatus(response.data);
    } catch (error) {
      console.error('Error checking API status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (stepId) => {
    setStep(stepId);
  };

  // Calculate stats based on persistent highest step reached
  const getStepStats = () => {
    return {
      papersProcessed: paperId ? 1 : 0,
      scriptsGenerated: highestStepReached >= 3 ? 1 : 0,
      slidesCreated: highestStepReached >= 4 ? 1 : 0,
      videosGenerated: highestStepReached >= 6 ? 1 : 0,
      completedSteps: Math.max(0, highestStepReached - 1)
    };
  };

  const steps = [
    {
      id: 1,
      icon: FiKey,
      title: 'API Setup',
      description: 'Configure your API keys for Gemini, Sarvam, and OpenAI services',
      to: '/api-setup'
    },
    {
      id: 2,
      icon: FiUpload,
      title: 'Paper Upload',
      description: 'Upload your LaTeX files or import directly from arXiv',
      to: '/paper-processing'
    },
    {
      id: 3,
      icon: FiEdit3,
      title: 'Script Generation',
      description: 'Generate and customize presentation scripts for your paper',
      to: '/script-generation'
    },
    {
      id: 4,
      icon: FiSliders,
      title: 'Slide Creation',
      description: 'Create beautiful presentation slides from your content',
      to: '/slide-creation'
    },
    {
      id: 5,
      icon: FiPlay,
      title: 'Media Generation',
      description: 'Generate audio narration and combine with slides',
      to: '/media-generation'
    },
    {
      id: 6,
      icon: FiDownload,
      title: 'Results',
      description: 'Download your final presentation video and slides',
      to: '/results'
    }
  ];

  const stats = getStepStats();

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 h-48 rounded-xl"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Saral AI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Transform your academic papers into engaging presentation videos with AI-powered script generation, 
            professional slides, and natural voice narration.
          </p>
        </motion.div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={FiFileText}
            title="Papers Processed"
            value={stats.papersProcessed.toString()}
            subtitle="Ready for conversion"
            color="primary"
          />
          <StatsCard
            icon={FiEdit3}
            title="Scripts Generated"
            value={stats.scriptsGenerated.toString()}
            subtitle="AI-powered content"
            color="green"
          />
          <StatsCard
            icon={FiImage}
            title="Slides Created"
            value={stats.slidesCreated.toString()}
            subtitle="Professional presentation"
            color="blue"
          />
          <StatsCard
            icon={FiVideo}
            title="Videos Generated"
            value={stats.videosGenerated.toString()}
            subtitle="Final output ready"
            color="purple"
          />
        </div>

        {/* Current paper info */}
        {paperId && metadata && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Current Paper
            </h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Title:</span>
                <p className="text-gray-900 dark:text-white">{metadata.title}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Authors:</span>
                <p className="text-gray-900 dark:text-white">{metadata.authors}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Paper ID:</span>
                <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">{paperId}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Workflow steps */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Workflow Steps
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step) => {
              // Updated logic using persistent highest step reached
              const isCompleted = highestStepReached > step.id;
              const isCurrent = currentStep === step.id;
              // Step is accessible if it's step 1, current step, or has been reached before
              const isAccessible = step.id === 1 || step.id <= highestStepReached;

              return (
                <StepCard
                  key={step.id}
                  step={step.id}
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  isAccessible={isAccessible}
                  to={step.to}
                  onClick={() => handleStepClick(step.id)}
                />
              );
            })}
          </div>
        </div>

        {/* API Status indicator */}
        {!apiStatus.gemini_configured && !apiStatus.sarvam_configured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6"
          >
            <div className="flex items-start space-x-3">
              <FiClock className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  API Setup Required
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                  Please configure your API keys to start using Saral AI. You'll need keys for Gemini and Sarvam APIs.
                </p>
                <Link
                  to="/api-setup"
                  className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors duration-200"
                  onClick={() => handleStepClick(1)}
                >
                  <FiKey className="w-4 h-4 mr-2" />
                  Configure API Keys
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
