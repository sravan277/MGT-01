import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiFileText, FiMic, FiVideo, FiZap, FiCheck } from 'react-icons/fi';
import ThemeToggle from '../components/common/ThemeToggle';

const FeatureCard = ({ icon: Icon, title, description, delay = 0, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative card p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-opacity-50"
    style={{ borderColor: color }}
  >
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg`}
         style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
      {description}
    </p>
  </motion.div>
  );

const LandingPage = () => {
  const features = [
    {
      icon: FiFileText,
      title: 'Paper Upload',
      description: 'Upload research papers via arXiv links or direct LaTeX files. Our system automatically extracts content and figures.',
      color: '#3b82f6' // Blue
    },
    {
      icon: FiZap,
      title: 'AI Script Generation',
      description: 'Generate engaging presentation scripts using advanced AI models like Gemini and GPT for educational content.',
      color: '#f59e0b' // Amber
    },
    {
      icon: FiMic,
      title: 'Voice Synthesis',
      description: 'Convert scripts to natural-sounding audio narration with support for multiple languages including Hindi.',
      color: '#10b981' // Green
    },
    {
      icon: FiVideo,
      title: 'Video Production',
      description: 'Automatically create professional presentation videos combining slides, narration, and visual elements.',
      color: '#8b5cf6' // Purple
    }
  ];

  const benefits = [
    'Upload papers from arXiv or LaTeX sources',
    'AI-powered script generation',
    'Multi-language voice synthesis',
    'Professional video output',
    'Customizable slides and content',
    'Export in multiple formats'
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgxNDcsMTk3LDI1MywwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-40"></div>
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">SA</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Saral AI
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/about" className="btn-secondary hover:scale-105 transition-transform">
              About
            </Link>
        </div>
      </div>
    </div>
  </header>

      {/* Hero Section */}
  <div className="w-full bg-gray-100 border-b border-gray-300 text-white-900 dark:bg-gray-900 dark:text-white dark:border-gray-700 py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2">

   
  </div>

      {/* Hero Section */}
  <section className="relative py-20 md:py-32 overflow-hidden">
    {/* Gradient Orbs */}
    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob"></div>
    <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 dark:bg-yellow-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-full">
          <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ✨ AI-Powered Research Communication
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Turn Academic Papers
          </span>
          <br />
          <span className="text-gray-900 dark:text-white">
            into Engaging Videos
          </span>
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          Saral AI seamlessly transforms your research papers into professional video presentations with AI-powered scripts, beautiful slides, and natural voice narration.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/api-setup"
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            Get Started Free
            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/about"
            className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-purple-600 dark:hover:border-purple-400 hover:scale-105 transition-all duration-300"
          >
            Learn More
          </Link>
        </div>
      </motion.div>
    </div>
  </section>



      {/* Features Section */}
  <section className="py-24 relative">
    <div className="max-w-7xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            How It Works
          </span>
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Our streamlined workflow transforms your research papers into professional presentation videos in just a few steps.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            color={feature.color}
            delay={index * 0.1}
            />
            ))}
      </div>
    </div>
  </section>

      {/* Benefits Section */}
  <section className="py-24 relative">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              Democratize
            </span>{" "}
            <span className="text-gray-900 dark:text-white">
              Research Access
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Make complex research accessible to wider audiences through engaging video presentations. Our AI-powered platform handles the technical complexity while you focus on your content.
          </p>
          
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                  <FiCheck className="w-5 h-5 text-white font-bold" />
                </div>
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  {benefit}
                </span>
              </motion.div>
              ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl blur-2xl opacity-20"></div>
          <div className="relative card p-10 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-purple-900/30 border-2 border-blue-200 dark:border-purple-700">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <FiVideo className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                Join researchers worldwide who are making their work more accessible through video presentations.
              </p>
              <Link to="/api-setup" className="group inline-flex items-center justify-center w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Create Your First Video
                <FiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
    </div>
  </div>
</section>

      {/* Footer */}
<footer className="relative border-t border-gray-200 dark:border-gray-700 py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-purple-900/20">
  <div className="max-w-7xl mx-auto px-6 text-center">
    <div className="flex items-center justify-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-lg">SA</span>
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Saral AI
      </span>
    </div>
    <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
      Making research accessible through AI-powered video generation
    </p>
    <div className="flex justify-center gap-8">
      <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-semibold transition-colors duration-200">
      About
    </Link>
    <a href="mailto:democratise.research@gmail.com" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-semibold transition-colors duration-200">
      Contact
    </a>
  </div>
  <div className="mt-8 pt-8 border-t border-gray-300 dark:border-gray-700">
    <p className="text-sm text-gray-500 dark:text-gray-400">
      © 2025 Saral AI. All rights reserved.
    </p>
  </div>
</div>
</footer>
</div>
);
};

export default LandingPage;
