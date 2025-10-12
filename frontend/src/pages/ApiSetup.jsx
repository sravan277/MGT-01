import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiKey, FiSkipForward, FiInfo, FiX, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import { useWorkflow } from '../contexts/WorkflowContext';
import ApiSetupForm from './ApiSetupForm';
import Layout from '../components/common/Layout';

const ApiSetup = () => {
  const [showForm, setShowForm] = useState(false);
  const { progressToNextStep } = useWorkflow();

  const crumbs = [{ label: 'API Setup', href: '/api-setup' }];

  return (
    <Layout breadcrumbs={crumbs}>
      <div className="max-w-7xl mx-auto">
        {showForm ? (
          <ApiSetupForm />
        ) : (
          <div className="space-y-12">
            {/* Top Section: Animation + Comparison Cards */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Animation Placeholder */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-center min-h-[600px]">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                  >
                    <div className="relative w-32 h-32 mx-auto mb-8">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                      <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                        <FiKey className="w-16 h-16 text-white" />
                      </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-4">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Ready to Get Started?
                      </span>
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
                      You can configure your API keys now for the best experience, or continue and set them up later.
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Right Column - Comparison Cards */}
              <div className="space-y-6 pb-4">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-6"
              >
                <h3 className="text-2xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Why Choose Saral AI?
                  </span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  See the difference AI makes
                </p>
              </motion.div>

              {/* Without Saral AI - Card 1 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 shadow-lg min-h-[200px]"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
                      <FiX className="w-8 h-8 text-white font-bold" />
                    </div>
                    <h4 className="text-2xl font-bold text-red-900 dark:text-red-200">
                      Without Saral AI
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <p className="text-base text-red-700 dark:text-red-300 leading-relaxed font-medium">
                      ⏰ <strong>Hours of manual work:</strong> Create slides, record audio, edit videos
                    </p>
                    <p className="text-base text-red-700 dark:text-red-300 leading-relaxed font-medium">
                      🎨 <strong>Design skills required:</strong> Professional presentation design needed
                    </p>
                    <p className="text-base text-red-700 dark:text-red-300 leading-relaxed font-medium">
                      💰 <strong>Time-consuming:</strong> Days or weeks to complete one video
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Traditional Method - Card 2 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-8 shadow-lg min-h-[200px]"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
                      <FiX className="w-8 h-8 text-white font-bold" />
                    </div>
                    <h4 className="text-2xl font-bold text-orange-900 dark:text-orange-200">
                      Traditional Tools
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <p className="text-base text-orange-700 dark:text-orange-300 leading-relaxed font-medium">
                      🔧 <strong>Complex software:</strong> Steep learning curve for video editing tools
                    </p>
                    <p className="text-base text-orange-700 dark:text-orange-300 leading-relaxed font-medium">
                      💸 <strong>Expensive licenses:</strong> Premium software subscriptions required
                    </p>
                    <p className="text-base text-orange-700 dark:text-orange-300 leading-relaxed font-medium">
                      👨‍💻 <strong>Technical expertise:</strong> Need multiple skills to produce quality content
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* With Saral AI - Winning Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-3 border-green-400 dark:border-green-600 rounded-2xl p-8 shadow-2xl min-h-[280px]"
              >
                {/* Animated glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 animate-pulse"></div>
                
                <div className="relative flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl">
                      <FiCheckCircle className="w-9 h-9 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 dark:from-green-300 dark:to-emerald-300 bg-clip-text text-transparent">
                          With Saral AI
                        </h4>
                        <FiTrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                        🚀 The Smart Choice
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                    <p className="text-lg text-green-900 dark:text-green-100 font-bold leading-relaxed mb-4">
                      Generate professional videos in minutes with AI-powered automation!
                    </p>
                    
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-base text-green-800 dark:text-green-200 font-medium">
                        <FiCheckCircle className="w-5 h-5 mt-1 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <span><strong>Automated workflow:</strong> From paper to video in one click</span>
                      </li>
                      <li className="flex items-start gap-3 text-base text-green-800 dark:text-green-200 font-medium">
                        <FiCheckCircle className="w-5 h-5 mt-1 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <span><strong>AI-generated scripts:</strong> Natural, engaging narration</span>
                      </li>
                      <li className="flex items-start gap-3 text-base text-green-800 dark:text-green-200 font-medium">
                        <FiCheckCircle className="w-5 h-5 mt-1 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <span><strong>Multiple languages:</strong> Reach global audiences</span>
                      </li>
                      <li className="flex items-start gap-3 text-base text-green-800 dark:text-green-200 font-medium">
                        <FiCheckCircle className="w-5 h-5 mt-1 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <span><strong>Save 90% time:</strong> What took days, now takes minutes</span>
                      </li>
                      <li className="flex items-start gap-3 text-base text-green-800 dark:text-green-200 font-medium">
                        <FiCheckCircle className="w-5 h-5 mt-1 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <span><strong>No technical skills:</strong> Easy-to-use interface</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
              </div>
            </div>

            {/* Bottom Section: Action Buttons (Centered) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl w-full">
                <button
                  onClick={() => setShowForm(true)}
                  className="group flex-1 flex items-center justify-center gap-2 px-8 py-4
                             rounded-xl bg-gradient-to-r from-blue-600 to-purple-600
                             text-white font-bold shadow-lg hover:shadow-2xl
                             hover:scale-105 transition-all duration-300">
                  <FiKey className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Configure API Keys
                </button>
                
                <button
                  onClick={progressToNextStep}
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-4
                             rounded-xl border-2 border-gray-300 dark:border-gray-600
                             bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
                             text-gray-900 dark:text-gray-100 font-bold 
                             hover:scale-105 hover:border-purple-500 dark:hover:border-purple-400
                             transition-all duration-300">
                    <FiSkipForward className="w-5 h-5" />
                    Continue
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ApiSetup;
