import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiEdit3, FiCheck } from 'react-icons/fi';

const Tab = ({ 
  id,
  title, 
  isActive, 
  onClick, 
  onClose,
  hasChanges = false,
  isCompleted = false,
  className = '' 
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className={`
      relative flex items-center min-w-0 max-w-xs group cursor-pointer
      ${isActive 
        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-10' 
        : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
      }
      border-t border-l border-r rounded-t-lg transition-all duration-200
      ${className}
    `}
    style={{
      clipPath: isActive 
        ? 'polygon(0% 0%, calc(100% - 12px) 0%, 100% 100%, 12px 100%)' 
        : 'polygon(0% 0%, calc(100% - 8px) 0%, 100% 100%, 8px 100%)',
      marginRight: '-8px',
      paddingLeft: '16px',
      paddingRight: '20px'
    }}
  >
    <button
      onClick={onClick}
      className="flex items-center space-x-2 py-3 px-2 min-w-0 flex-1 focus:outline-none"
    >
      {/* Status indicator */}
      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
        isCompleted 
          ? 'bg-green-500' 
          : hasChanges 
          ? 'bg-yellow-500' 
          : 'bg-gray-400'
      }`}>
        {isCompleted && (
          <FiCheck className="w-2.5 h-2.5 text-white ml-0.5 mt-0.5" />
        )}
      </div>
      
      {/* Tab title */}
      <span className={`
        text-sm font-medium truncate transition-colors duration-200
        ${isActive 
          ? 'text-gray-900 dark:text-white' 
          : 'text-gray-600 dark:text-gray-300'
        }
      `}>
        {title}
      </span>
    </button>

    {/* Close button - only show on hover for non-active tabs */}
    {onClose && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(id);
        }}
        className={`
          p-1 rounded-full transition-all duration-200 flex-shrink-0
          ${isActive 
            ? 'opacity-70 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600' 
            : 'opacity-0 group-hover:opacity-70 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-500'
          }
        `}
      >
        <FiX className="w-3 h-3 text-gray-500 dark:text-gray-400" />
      </button>
    )}
  </motion.div>
);

const ChromeTabs = ({ 
  tabs = [], 
  activeTab, 
  onTabClick, 
  onTabClose,
  className = '',
  showAddButton = false,
  onAddTab
}) => {
  return (
    <div className={`flex items-end space-x-0 ${className}`}>
      {/* Tab bar background */}
      <div className="flex items-end border-b border-gray-200 dark:border-gray-700 min-h-0 relative">
        <AnimatePresence mode="popLayout">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              id={tab.id}
              title={tab.title}
              isActive={tab.id === activeTab}
              onClick={() => onTabClick(tab.id)}
              onClose={onTabClose}
              hasChanges={tab.hasChanges}
              isCompleted={tab.isCompleted}
            />
          ))}
        </AnimatePresence>
        
        {/* Add button */}
        {showAddButton && onAddTab && (
          <button
            onClick={onAddTab}
            className="flex items-center justify-center w-8 h-8 ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
          >
            <FiEdit3 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Extend the border to fill remaining space */}
      <div className="flex-1 border-b border-gray-200 dark:border-gray-700 h-px"></div>
    </div>
  );
};

export default ChromeTabs;
