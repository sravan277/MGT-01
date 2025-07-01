import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiKey, FiCheck, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import { useWorkflow } from '../contexts/WorkflowContext';

const ApiKeyInput = ({ label, name, value, onChange, required, description, showPassword, onTogglePassword }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-colors duration-200"
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
      </button>
    </div>
    {description && (
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    )}
  </div>
);

const ApiSetupForm = () => {
  const { progressToNextStep } = useWorkflow(); // Changed from setStep to progressToNextStep
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({});
  const [showPasswords, setShowPasswords] = useState({});
  const [apiKeys, setApiKeys] = useState({
    gemini_key: '',
    sarvam_key: '',
    openai_key: ''
  });

  useEffect(() => {
    checkApiKeysStatus();
  }, []);

  const checkApiKeysStatus = async () => {
    try {
      const response = await apiService.getApiKeysStatus();
      setStatus(response.data);
    } catch (error) {
      console.error('Error checking API keys status:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApiKeys(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiService.setupApiKeys(apiKeys);
      toast.success('API keys configured successfully!');
      await checkApiKeysStatus();
      
      // Use progressToNextStep for auto-navigation
      progressToNextStep();
      
    } catch (error) {
      console.error('API setup error:', error);
      toast.error('Failed to configure API keys');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'API Setup', href: '/api-setup' }
  ];

  const apiKeyConfigs = [
    {
      name: 'gemini_key',
      label: 'Gemini API Key',
      required: false, // Make optional
      description: 'Optional: Used for script generation and content analysis.',
      documentation: "https://docs.google.com/document/d/1wmCBGNVFUOYMatEkvX9G9qudI4viekC2zphED9N1yE0/edit?usp=sharing",
      status: status.gemini_configured
    },
    {
      name: 'sarvam_key',
      label: 'Sarvam API Key',
      required: false,
      description: 'Optional: Used for text-to-speech functionality',
      documentation: "https://docs.google.com/document/d/1XCiS44Hh2sxNQoWNAJdBuZU5DDxg6EF9szRMw1XTELA/edit?usp=sharing",
      status: status.sarvam_configured
    },
    {
      name: 'openai_key',
      label: 'OpenAI API Key',
      required: false,
      description: 'Optional: Used for enhanced content processing',
      documentation: "",
      status: status.openai_configured
    }
  ];

  return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 lg:p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
              <FiKey className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Configure API Keys
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Set up your API keys to get best out of Saral AI
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {apiKeyConfigs.map((config) => (
              <motion.div
                key={config.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                {/* Documentation link */}
                {config.documentation && (
                  <a
                    href={config.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mb-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    {config.label} Documentation
                  </a>
                )}
                <ApiKeyInput
                  label={config.label}
                  name={config.name}
                  value={apiKeys[config.name]}
                  onChange={handleInputChange}
                  required={config.required}
                  description={config.description}
                  showPassword={showPasswords[config.name]}
                  onTogglePassword={() => togglePasswordVisibility(config.name)}
                />
                {/* Status indicator */}
                {config.status && (
                  <div className="absolute top-8 right-12 flex items-center">
                    <FiCheck className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </motion.div>
            ))}


            {/* Info card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <FiAlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">API Key Security</p>
                  <p>Your API keys are stored securely and are only used for processing your requests. They are not shared with third parties.</p>
                </div>
              </div>
            </motion.div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Configuring...
                </>
              ) : (
                'Configure API Keys'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
  );
};

export default ApiSetupForm;
