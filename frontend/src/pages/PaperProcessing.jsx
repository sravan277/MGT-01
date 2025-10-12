import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/common/Layout';
import PaperUpload from '../components/forms/PaperUpload';
import MetadataEditor from '../components/forms/MetadataEditor';
import { useWorkflow } from '../contexts/WorkflowContext';
import { FiUpload, FiEdit3 } from 'react-icons/fi';

const PaperProcessing = () => {
  const { paperId, metadata } = useWorkflow();
  
  const breadcrumbs = [
    { label: 'Paper Processing', href: '/paper-processing' }
  ];

  return (
    <Layout title="" breadcrumbs={breadcrumbs}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {!paperId ? (
          <div className="relative bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl">
            {/* Gradient top bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl"></div>
            
            <div className="flex items-center gap-4 mb-8">
              {/* 3D Icon with glow */}
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                  <FiUpload className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Upload Research Paper
                  </span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Choose your upload method to get started
                </p>
              </div>
            </div>
            <PaperUpload />
          </div>
        ) : (
          <div className="relative bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl">
            {/* Gradient top bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-t-2xl"></div>
            
            <div className="flex items-center gap-4 mb-8">
              {/* 3D Icon with glow */}
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <FiEdit3 className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Edit Metadata
                  </span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Review and edit your paper details
                </p>
              </div>
            </div>
            <MetadataEditor />
          </div>
        )}

        {/* Processing Status */}
        {paperId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 
                       dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 
                       border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-lg opacity-50 animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl">
                  <span className="text-white text-2xl font-bold">✓</span>
                </div>
              </div>
              <div>
                <p className="text-lg font-bold text-green-800 dark:text-green-200 mb-1">
                  Paper Successfully Uploaded!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {metadata?.title ? `"${metadata.title}"` : 'Your paper'} is ready for script generation.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default PaperProcessing;