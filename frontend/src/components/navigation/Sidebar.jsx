import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiKey, FiUpload, FiEdit3, FiSliders, 
  FiPlay, FiDownload, FiX, FiCheck, FiClock,
  FiChevronRight
} from 'react-icons/fi';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useResponsive } from '../../hooks/useResponsive';

const SidebarLink = ({ to, icon: Icon, label, step, currentStep, completedSteps, isActive, onClick }) => {
  // Updated logic to use completedSteps array for persistent progress
  const isCompleted = completedSteps && completedSteps.includes(step);
  const isCurrent = currentStep === step;
  // Enhanced accessibility: step is accessible if it's dashboard, current step, or has been completed before
  const isAccessible = step === 0 || step <= currentStep || isCompleted;

  return (
    <Link
      to={isAccessible ? to : '#'}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        isActive && isAccessible
          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
          : isAccessible
          ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
      }`}
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
        isCompleted
          ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
          : isCurrent
          ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
          : isAccessible
          ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
      }`}>
        {isCompleted ? (
          <FiCheck className="w-4 h-4" />
        ) : isCurrent ? (
          <FiClock className="w-4 h-4" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium truncate">{label}</span>
          {isAccessible && (
            <FiChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
          )}
        </div>
        {step > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Step {step}
          </div>
        )}
      </div>
    </Link>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  // Updated to use completedSteps and setStep from workflow context
  const { currentStep, completedSteps = [], setStep, disableAutoProgress } = useWorkflow();
  const { isMobile } = useResponsive();

  const navigationItems = [
    // { to: '/', icon: FiHome, label: 'Dashboard', step: 0 },
    { to: '/api-setup', icon: FiKey, label: 'API Setup', step: 1 },
    { to: '/paper-processing', icon: FiUpload, label: 'Paper Upload', step: 2 },
    { to: '/script-generation', icon: FiEdit3, label: 'Script Generation', step: 3 },
    { to: '/slide-creation', icon: FiSliders, label: 'Slide Creation', step: 4 },
    { to: '/media-generation', icon: FiPlay, label: 'Media Generation', step: 5 },
    { to: '/results', icon: FiDownload, label: 'Results', step: 6 },
  ];

  const handleLinkClick = (step) => {
    // Use setStep from workflow context for proper state management
    if (step === 0 || step <= currentStep || completedSteps.includes(step)) {
      setStep(step);
      disableAutoProgress();
    }
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Calculate progress based on completed steps
  const progressPercentage = completedSteps.length > 0 ? Math.round((completedSteps.length / 6) * 100) : 0;
  const completedCount = completedSteps.length;

  return (
    <aside 
      className="h-full w-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
      }}
    >
      {/* Fixed Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">SA</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              Saral AI
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              Academic Paper to Video
            </p>
          </div>
        </div>
        
        {isMobile && isOpen && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex-shrink-0 ml-2"
            aria-label="Close sidebar"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scrollable Navigation */}
      <nav 
        className="p-4 space-y-2 flex-1"
        style={{
          overflowY: 'auto',
          flexGrow: 1
        }}
      >
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Workflow
        </div>
        
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <SidebarLink
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              step={item.step}
              currentStep={currentStep}
              completedSteps={completedSteps}
              isActive={location.pathname === item.to}
              onClick={() => handleLinkClick(item.step)}
            />
          ))}
        </div>

        {/* Additional scrollable content can go here */}
        <div className="mt-8 space-y-2">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Quick Actions
          </div>
          {/* Add more navigation items if needed */}
        </div>
      </nav>

      {/* Fixed Progress Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <motion.div 
          className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {completedCount > 0 ? `${completedCount} of 6 steps completed` : 'Get started with Step 1'}
          </div>
        </motion.div>
      </div>
    </aside>
  );
};

export default Sidebar;
