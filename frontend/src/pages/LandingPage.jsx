import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiArrowRight, FiVideo, FiFileText, FiEdit3, 
  FiSliders, FiMic, FiDownload, FiCheck, 
  FiGlobe, FiCpu, FiLayers, FiClock, FiKey
} from 'react-icons/fi';
import Layout from '../components/common/Layout';
import { useWorkflow } from '../contexts/WorkflowContext';

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
    >
      <div className="bg-primary-100 dark:bg-primary-900/30 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
        <Icon className="text-primary-600 dark:text-primary-400 w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
};

const StepCard = ({ number, title, description, icon: Icon, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-start gap-4"
    >
      <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
        {number}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
};

const TestimonialCard = ({ text, author, role, avatar, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img src={avatar} alt={author} className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">{author}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 italic">{text}</p>
    </motion.div>
  );
};

const LandingPage = () => {
  const { setStep } = useWorkflow();
  
  // Reset to step 1 when user decides to start
  const handleGetStarted = () => {
    setStep(1);
  };

  return (
    <Layout title="">
      <div className="w-full bg-yellow-100 border-b border-yellow-300 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700 py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2">
        <svg className="inline w-5 h-5 mr-1 text-yellow-500 dark:text-yellow-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
        </svg>
        For the best experience, please use <span className="font-semibold">Google Chrome</span> browser.
      </div>
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Turn Academic Papers into Engaging 
                <span className="text-primary-600 dark:text-primary-400"> Video Presentations</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Saral AI automatically converts your research papers into professional video presentations with AI-generated scripts, custom slides, and natural voice narration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/api-setup" 
                  onClick={handleGetStarted}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  Get Started
                  <FiArrowRight className="ml-2" />
                </Link>
                <a 
                  href="#how-it-works" 
                  className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium py-3 px-6 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  How It Works
                </a>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:w-1/2"
            >
              <div className="w-full h-auto rounded-lg shadow-lg aspect-video overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/g6SlG7-gf04?si=1ZdpzQ4TPG7pZ5fP"
                  title="Saral AI Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our AI-powered platform automates the entire process from paper to presentation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={FiFileText} 
              title="Paper Analysis" 
              description="Import papers directly from arXiv or upload your LaTeX files for automatic processing."
              delay={0.1}
            />
            <FeatureCard 
              icon={FiEdit3} 
              title="Script Generation" 
              description="AI creates presentation scripts tailored to your research paper's content."
              delay={0.2}
            />
            <FeatureCard 
              icon={FiSliders} 
              title="Slide Creation" 
              description="Generate visually appealing slides with professional layouts and imagery."
              delay={0.3}
            />
            <FeatureCard 
              icon={FiMic} 
              title="Voice Narration" 
              description="Convert your scripts to natural-sounding voice narration automatically."
              delay={0.4}
            />
            <FeatureCard 
              icon={FiVideo} 
              title="Video Production" 
              description="Combine slides and audio into a complete video presentation with transitions."
              delay={0.5}
            />
            <FeatureCard 
              icon={FiDownload} 
              title="Easy Export" 
              description="Download your presentation as a video file or share it directly."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A simple 6-step process to transform your research into engaging presentations
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-12">
            <StepCard 
              number="1" 
              icon={FiKey} 
              title="API Setup" 
              description="Configure your API keys for Gemini, Sarvam, and OpenAI services to enable AI functionality."
              delay={0.1}
            />
            <StepCard 
              number="2" 
              icon={FiFileText} 
              title="Paper Upload" 
              description="Upload your research paper in LaTeX format or import directly from arXiv."
              delay={0.2}
            />
            <StepCard 
              number="3" 
              icon={FiEdit3} 
              title="Script Generation" 
              description="AI analyzes your paper and creates customizable presentation scripts."
              delay={0.3}
            />
            <StepCard 
              number="4" 
              icon={FiSliders} 
              title="Slide Creation" 
              description="Generate professional slides with your content and select relevant images."
              delay={0.4}
            />
            <StepCard 
              number="5" 
              icon={FiMic} 
              title="Media Generation" 
              description="Convert scripts to natural voice narration and combine with slides."
              delay={0.5}
            />
            <StepCard 
              number="6" 
              icon={FiDownload} 
              title="Download Results" 
              description="Download your completed presentation video and materials."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose Saral AI?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                    <FiCheck className="text-green-600 dark:text-green-400 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Save Time</h3>
                    <p className="text-gray-600 dark:text-gray-400">Reduce presentation creation time from days to hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                    <FiCheck className="text-green-600 dark:text-green-400 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Professional Quality</h3>
                    <p className="text-gray-600 dark:text-gray-400">Create polished presentations that effectively communicate your research</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                    <FiCheck className="text-green-600 dark:text-green-400 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Full Control</h3>
                    <p className="text-gray-600 dark:text-gray-400">Edit and customize every aspect of your presentation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                    <FiCheck className="text-green-600 dark:text-green-400 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Accessibility</h3>
                    <p className="text-gray-600 dark:text-gray-400">Make your research accessible to wider audiences</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:w-1/2 grid grid-cols-2 gap-6"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="bg-primary-100 dark:bg-primary-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <FiGlobe className="text-primary-600 dark:text-primary-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Global Reach</h3>
                <p className="text-gray-600 dark:text-gray-400">Share your research with audiences worldwide</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="bg-primary-100 dark:bg-primary-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <FiCpu className="text-primary-600 dark:text-primary-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI Powered</h3>
                <p className="text-gray-600 dark:text-gray-400">Cutting-edge AI models handle the heavy lifting</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="bg-primary-100 dark:bg-primary-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <FiLayers className="text-primary-600 dark:text-primary-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Multi-format</h3>
                <p className="text-gray-600 dark:text-gray-400">Export to various video and presentation formats</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="bg-primary-100 dark:bg-primary-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <FiClock className="text-primary-600 dark:text-primary-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Time Saving</h3>
                <p className="text-gray-600 dark:text-gray-400">Create presentations in a fraction of the time</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary-600 to-white-600 rounded-2xl p-8 md:p-12 text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Research?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Start creating professional presentations from your academic papers in minutes.
            </p>
            <Link 
              to="/api-setup" 
              onClick={handleGetStarted}
              className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg inline-flex items-center transition-colors duration-200"
            >
              Get Started Now
              <FiArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">SA</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Saral AI</span>
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} Saral AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default LandingPage;
