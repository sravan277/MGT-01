import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { useWorkflow } from '../contexts/WorkflowContext';
import { 
  FiFileText, 
  FiVideo, 
  FiFilm, 
  FiMic,
  FiImage,
  FiArrowRight,
  FiCheck,
  FiAlignLeft,
  FiGitBranch
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import PaperChatbot from '../components/chatbot/PaperChatbot';
import ChatbotButton from '../components/chatbot/ChatbotButton';

const OutputSelection = () => {
  const { paperId, metadata, progressToNextStep } = useWorkflow();
  const navigate = useNavigate();
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const breadcrumbs = [
    { label: 'Output Selection', href: '/output-selection' }
  ];

  const outputFormats = [
    {
      id: 'pdf',
      title: 'PDF Generation',
      description: 'Generate a presentation in PDF format with slides and content',
      icon: FiFileText,
      color: 'blue',
      available: true
    },
    {
      id: 'video',
      title: 'Video Generation',
      description: 'Create a complete video presentation with narration and visuals',
      icon: FiVideo,
      color: 'purple',
      available: true
    },
    {
      id: 'poster',
      title: 'AI Poster',
      description: 'Create an academic poster with AI-extracted images and content',
      icon: FiImage,
      color: 'orange',
      available: true
    },
    {
      id: 'reel',
      title: 'AI Reel',
      description: 'Generate short-form content optimized for social media',
      icon: FiFilm,
      color: 'pink',
      available: true
    },
    {
      id: 'podcast',
      title: 'Podcast',
      description: 'Convert your research paper into an audio podcast format',
      icon: FiMic,
      color: 'green',
      available: true
    },
    {
      id: 'summary',
      title: 'Text Summary',
      description: 'Generate an AI-powered summary of your research paper',
      icon: FiAlignLeft,
      color: 'teal',
      available: true
    },
    {
      id: 'mindmap',
      title: 'Mind Map',
      description: 'Create a visual mind map of key concepts and relationships',
      icon: FiGitBranch,
      color: 'indigo',
      available: true
    }
  ];

  const handleContinue = () => {
    if (!selectedFormat) {
      toast.error('Please select an output format');
      return;
    }

    const selected = outputFormats.find(f => f.id === selectedFormat);
    if (!selected.available) {
      toast.error('This format is coming soon!');
      return;
    }

    // Store the selected format in context or localStorage if needed
    localStorage.setItem('selectedOutputFormat', selectedFormat);
    
    toast.success(`${selected.title} selected`);
    
    // Route based on selection
    if (selectedFormat === 'reel') {
      navigate('/reel-generation');
    } else if (selectedFormat === 'podcast') {
      navigate('/podcast-generation');
    } else if (selectedFormat === 'poster') {
      navigate('/poster-generation');
    } else if (selectedFormat === 'summary') {
      navigate('/summary-generation');
    } else if (selectedFormat === 'mindmap') {
      navigate('/mindmap-generation');
    } else {
      progressToNextStep();
    }
  };

  const getColorClasses = (color, isSelected) => {
    const colors = {
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        icon: 'text-blue-600 dark:text-blue-400',
        ring: 'ring-blue-500'
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-gray-300 dark:border-gray-600',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        icon: 'text-purple-600 dark:text-purple-400',
        ring: 'ring-purple-500'
      },
      orange: {
        border: isSelected ? 'border-orange-500' : 'border-gray-300 dark:border-gray-600',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        icon: 'text-orange-600 dark:text-orange-400',
        ring: 'ring-orange-500'
      },
      pink: {
        border: isSelected ? 'border-pink-500' : 'border-gray-300 dark:border-gray-600',
        bg: 'bg-pink-50 dark:bg-pink-900/20',
        icon: 'text-pink-600 dark:text-pink-400',
        ring: 'ring-pink-500'
      },
      green: {
        border: isSelected ? 'border-green-500' : 'border-gray-300 dark:border-gray-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        icon: 'text-green-600 dark:text-green-400',
        ring: 'ring-green-500'
      },
      teal: {
        border: isSelected ? 'border-teal-500' : 'border-gray-300 dark:border-gray-600',
        bg: 'bg-teal-50 dark:bg-teal-900/20',
        icon: 'text-teal-600 dark:text-teal-400',
        ring: 'ring-teal-500'
      },
      indigo: {
        border: isSelected ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        icon: 'text-indigo-600 dark:text-indigo-400',
        ring: 'ring-indigo-500'
      }
    };
    return colors[color];
  };

  if (!paperId) {
    return (
      <Layout title="" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <FiFileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Paper Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please upload a paper first to select output format.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="" breadcrumbs={breadcrumbs}>
      {/* Chatbot Components */}
      {paperId && (
        <>
          <ChatbotButton 
            onClick={() => setIsChatbotOpen(true)} 
            isOpen={isChatbotOpen}
          />
          <PaperChatbot 
            paperId={paperId}
            isOpen={isChatbotOpen}
            onClose={() => setIsChatbotOpen(false)}
          />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="relative bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl"></div>
          <h2 className="text-3xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Select Output Format
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Choose how you want to present your research: <span className="font-semibold text-gray-900 dark:text-white">{metadata?.title || 'your paper'}</span>
          </p>
        </div>

        {/* Format Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {outputFormats.map((format) => {
            const isSelected = selectedFormat === format.id;
            const colorClasses = getColorClasses(format.color, isSelected);
            const Icon = format.icon;

            return (
              <motion.div
                key={format.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: format.available ? 1.02 : 1 }}
                whileTap={{ scale: format.available ? 0.98 : 1 }}
              >
                <button
                  onClick={() => format.available && setSelectedFormat(format.id)}
                  disabled={!format.available}
                  className={`
                    w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 group
                    ${colorClasses.border}
                    ${isSelected ? `${colorClasses.ring} ring-4 shadow-2xl` : 'shadow-lg'}
                    ${format.available 
                      ? 'bg-white dark:bg-neutral-800 hover:shadow-2xl hover:-translate-y-1 cursor-pointer' 
                      : 'bg-gray-50 dark:bg-neutral-900 opacity-60 cursor-not-allowed'
                    }
                    relative overflow-hidden
                  `}
                >
                  {/* Gradient overlay on hover */}
                  {format.available && (
                    <div className={`absolute inset-0 ${colorClasses.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  )}

                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute top-4 right-4 w-10 h-10 bg-gradient-to-br ${
                        format.color === 'blue' ? 'from-blue-500 to-blue-600' :
                        format.color === 'purple' ? 'from-purple-500 to-purple-600' :
                        format.color === 'orange' ? 'from-orange-500 to-orange-600' :
                        format.color === 'pink' ? 'from-pink-500 to-pink-600' :
                        format.color === 'green' ? 'from-green-500 to-green-600' :
                        format.color === 'teal' ? 'from-teal-500 to-teal-600' :
                        'from-indigo-500 to-indigo-600'
                      } rounded-full flex items-center justify-center shadow-lg z-10`}
                    >
                      <FiCheck className="w-6 h-6 text-white font-bold" />
                    </motion.div>
                  )}

                  {/* Coming Soon Badge */}
                  {format.comingSoon && (
                    <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg z-10">
                      Coming Soon
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`relative w-16 h-16 mb-4`}>
                    <div className={`absolute inset-0 ${colorClasses.bg} rounded-2xl blur-xl opacity-50`}></div>
                    <div className={`relative w-16 h-16 bg-gradient-to-br ${
                      format.color === 'blue' ? 'from-blue-500 to-blue-600' :
                      format.color === 'purple' ? 'from-purple-500 to-purple-600' :
                      format.color === 'orange' ? 'from-orange-500 to-orange-600' :
                      format.color === 'pink' ? 'from-pink-500 to-pink-600' :
                      format.color === 'green' ? 'from-green-500 to-green-600' :
                      format.color === 'teal' ? 'from-teal-500 to-teal-600' :
                      'from-indigo-500 to-indigo-600'
                    } rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    {format.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {format.description}
                  </p>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-end">
          <motion.button
            onClick={handleContinue}
            disabled={!selectedFormat}
            whileHover={{ scale: selectedFormat ? 1.05 : 1 }}
            whileTap={{ scale: selectedFormat ? 0.95 : 1 }}
            className={`
              group flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300
              ${selectedFormat
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Continue
            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </motion.div>
    </Layout>
  );
};

export default OutputSelection;
