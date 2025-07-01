import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import Header from '../navigation/Header';
import Sidebar from '../navigation/Sidebar';
import Breadcrumbs from '../navigation/Breadcrumbs';
import { useResponsive } from '../../hooks/useResponsive';

const Layout = ({ children, title, breadcrumbs = [] }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useResponsive();

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed positioning within layout */}
      <div 
        className={`fixed top-0 left-0 z-50 w-64 h-screen transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '256px',
          zIndex: 50
        }}
      >
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
      </div>

      {/* Main content area with proper margin */}
      <div 
        className={`transition-all duration-300 min-h-screen ${
          sidebarOpen 
            ? isMobile ? 'ml-0' : 'ml-64'
            : 'ml-0'
        }`}
        style={{
          marginLeft: sidebarOpen && !isMobile ? '256px' : '0'
        }}
      >
        <Header 
          onMenuClick={toggleSidebar} 
          sidebarOpen={sidebarOpen}
        />

        <main className="p-4 lg:p-6">
          {breadcrumbs.length > 0 && (
            <div className="mb-6">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          )}
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};


export default Layout;
