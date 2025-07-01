import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import PaperUpload from '../components/forms/PaperUpload';
import MetadataEditor from '../components/forms/MetadataEditor';
import { useWorkflow } from '../contexts/WorkflowContext';

const PaperProcessing = () => {
  const { paperId, metadata, progressToNextStep } = useWorkflow();

  const breadcrumbs = [
    { label: 'Paper Processing', href: '/paper-processing' }
  ];

  const handleContinueToScripts = () => {
    // Use progressToNextStep for auto-navigation
    progressToNextStep();
  };

  return (
    <Layout title="" breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Upload Your Academic Paper
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your LaTeX source files, PDF, or import directly from arXiv to get started.
          </p>
        </motion.div>

        {!paperId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 lg:p-8 border border-gray-200 dark:border-gray-700"
          >
            <PaperUpload />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Paper Processed Successfully
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    Your paper has been uploaded and processed. Review and edit the metadata below if needed.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 lg:p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Paper Metadata
              </h3>
              <MetadataEditor />
            </div>

            {/* Continue Button */}
            <div className="flex justify-end">
              <motion.button
                onClick={handleContinueToScripts}
                className="flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Continue to Script Generation</span>
                <FiArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default PaperProcessing;
