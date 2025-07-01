import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative flex items-center w-14 h-8 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-gray-700 dark:to-gray-600 rounded-full p-1 shadow-inner border border-gray-200 dark:border-gray-600 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 hover:shadow-lg ${className}`}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background Sun Icon */}
      <motion.div
        className="absolute left-2 flex items-center justify-center"
        animate={{
          opacity: isDark ? 0.3 : 0.7,
          scale: isDark ? 0.8 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <FiSun className="w-4 h-4 text-yellow-500" />
      </motion.div>

      {/* Background Moon Icon */}
      <motion.div
        className="absolute right-2 flex items-center justify-center"
        animate={{
          opacity: isDark ? 0.7 : 0.3,
          scale: isDark ? 1 : 0.8,
        }}
        transition={{ duration: 0.3 }}
      >
        <FiMoon className="w-4 h-4 text-indigo-400" />
      </motion.div>

      {/* Sliding Toggle */}
      <motion.div
        className="relative flex items-center justify-center w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700"
        animate={{
          x: isDark ? 24 : 2,
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderColor: isDark ? '#374151' : '#F3F4F6',
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 500, 
          damping: 30,
          duration: 0.3
        }}
      >
        {/* Active Icon */}
        <motion.div
          animate={{
            scale: isDark ? 1 : 0,
            opacity: isDark ? 1 : 0,
            rotate: isDark ? 0 : -180,
          }}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <FiMoon className="w-4 h-4 text-indigo-400" />
        </motion.div>
        
        <motion.div
          animate={{
            scale: isDark ? 0 : 1,
            opacity: isDark ? 0 : 1,
            rotate: isDark ? 180 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <FiSun className="w-4 h-4 text-yellow-500" />
        </motion.div>
      </motion.div>

      {/* Subtle glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isDark 
            ? '0 0 20px rgba(99, 102, 241, 0.3)' 
            : '0 0 20px rgba(251, 191, 36, 0.3)',
        }}
        transition={{ duration: 0.5 }}
      />
    </motion.button>
  );
};

export default ThemeToggle;
