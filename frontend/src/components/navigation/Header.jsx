import React from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiBell, FiUser, FiSettings } from 'react-icons/fi';
import ThemeToggle from '../common/ThemeToggle';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useResponsive } from '../../hooks/useResponsive';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick, sidebarOpen }) => {
  const { currentStep, paperId } = useWorkflow();
  const { isMobile } = useResponsive();

  const steps = [
    { id: 1, name: 'API Setup', description: 'Configure API keys' },
    { id: 2, name: 'Paper Upload', description: 'Upload or import paper' },
    { id: 3, name: 'Script Generation', description: 'Generate presentation scripts' },
    { id: 4, name: 'Slide Creation', description: 'Create presentation slides' },
    { id: 5, name: 'Media Generation', description: 'Generate audio and video' },
    { id: 6, name: 'Results', description: 'Download final outputs' }
  ];

  const currentStepInfo = steps.find(step => step.id === currentStep);
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30"
    >
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Menu toggle button - visible on both mobile and desktop */}
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
            
            {/* App branding - show when sidebar is closed or on mobile */}
            <div className={`flex items-center space-x-3 transition-opacity duration-200 ${
              !isMobile && sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}>
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  <a href='/' >
                    Saral AI
                  </a>
                </h1>
                {currentStepInfo && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Step {currentStep}: {currentStepInfo.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Progress indicator - center section */}
          {currentStep > 1 && (
            <div className="hidden lg:flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-1">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                      step.id < currentStep
                        ? 'bg-green-500'
                        : step.id === currentStep
                        ? 'bg-primary-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    title={`${step.name}: ${step.description}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                {currentStep - 1} of {steps.length} completed
              </span>
            </div>
          )}

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Mobile progress indicator */}
            {currentStep > 1 && (
              <div className="lg:hidden flex items-center space-x-1">
                <div className="flex space-x-1">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        step.id < currentStep
                          ? 'bg-green-500'
                          : step.id === currentStep
                          ? 'bg-primary-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <ThemeToggle />

            <button
              onClick={() => navigate('/about')}
              className="px-3 py-2 rounded-lg text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
            >
              About
            </button>
            
            {/* {paperId && (
              <div className="hidden sm:block">
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  ID: {paperId.slice(0, 8)}...
                </span>
              </div>
            )} */}
            
            {/* <button 
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
              aria-label="Notifications"
            >
              <FiBell className="w-5 h-5" />
            </button>
            
            <button 
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
              aria-label="User profile"
            >
              <FiUser className="w-5 h-5" />
            </button> */}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
