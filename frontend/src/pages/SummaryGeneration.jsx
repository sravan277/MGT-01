import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/common/Layout';
import { useWorkflow } from '../contexts/WorkflowContext';
import { FiAlignLeft, FiRefreshCw, FiCopy, FiCheck, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const SummaryGeneration = () => {
  const { paperId, metadata } = useWorkflow();
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  const [copied, setCopied] = useState(false);
  const [summaryType, setSummaryType] = useState('comprehensive');

  const breadcrumbs = [
    { label: 'Output Selection', href: '/output-selection' },
    { label: 'Text Summary', href: '/summary-generation' }
  ];

  const summaryTypes = [
    { value: 'comprehensive', label: 'Comprehensive', description: 'Detailed summary covering all key points' },
    { value: 'concise', label: 'Concise', description: 'Brief overview of main findings' },
    { value: 'abstract', label: 'Abstract Style', description: 'Academic abstract format' },
    { value: 'layman', label: 'Layman Terms', description: 'Simple language for general audience' }
  ];

  useEffect(() => {
    // Check if summary already exists
    checkSummaryStatus();
  }, [paperId]);

  const checkSummaryStatus = async () => {
    try {
      const response = await api.get(`/summaries/${paperId}/status`);
      if (response.data.exists) {
        setSummary(response.data.summary || '');
      }
    } catch (error) {
      console.log('No existing summary found');
    }
  };

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post(`/summaries/${paperId}/generate`, {
        summary_type: summaryType
      });

      setSummary(response.data.summary);
      toast.success('Summary generated successfully!');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success('Summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${metadata?.title || 'paper'}_summary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded!');
  };

  if (!paperId) {
    return (
      <Layout title="Text Summary" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <FiAlignLeft className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Paper Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please upload a paper first to generate summary.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Text Summary Generation" breadcrumbs={breadcrumbs}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <FiAlignLeft className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Text Summary</h2>
              <p className="text-teal-100">AI-powered summary using Gemini</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <p className="font-semibold">{metadata?.title || 'Research Paper'}</p>
          </div>
        </div>

        {/* Summary Type Selection */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Select Summary Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {summaryTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSummaryType(type.value)}
                disabled={isGenerating || summary}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${summaryType === type.value
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-teal-300'
                  }
                  ${(isGenerating || summary) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="font-semibold text-gray-900 dark:text-white mb-1">{type.label}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        {!summary && (
          <motion.button
            onClick={generateSummary}
            disabled={isGenerating}
            whileHover={{ scale: isGenerating ? 1 : 1.02 }}
            whileTap={{ scale: isGenerating ? 1 : 0.98 }}
            className={`
              w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3
              ${isGenerating
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl'
              }
            `}
          >
            {isGenerating ? (
              <>
                <FiRefreshCw className="w-6 h-6 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <FiAlignLeft className="w-6 h-6" />
                Generate Summary
              </>
            )}
          </motion.button>
        )}

        {/* Summary Display */}
        {summary && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-xl border-2 border-teal-200 dark:border-teal-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiAlignLeft className="text-teal-600" />
                Generated Summary
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
                >
                  {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={downloadSummary}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
                >
                  <FiDownload className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {summary}
              </p>
            </div>

            {/* Regenerate Button */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setSummary('');
                }}
                className="w-full py-3 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors flex items-center justify-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Generate New Summary
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default SummaryGeneration;
