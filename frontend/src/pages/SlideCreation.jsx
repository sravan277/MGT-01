import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSliders, FiDownload, FiEye, FiRefreshCw, FiImage,
  FiArrowRight, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useWorkflow } from '../contexts/WorkflowContext';
import { apiService } from '../services/api';
import { downloadFile } from '../utils/helpers';
import toast from 'react-hot-toast';

const SlidePreview = ({ slides, currentSlide, onSlideChange }) => {
  if (!slides || slides.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No slides generated yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main slide view */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <img
          src={slides[currentSlide]}
          alt={`Slide ${currentSlide + 1}`}
          className="w-full h-full object-contain"
          onError={(e) => {
            console.error('Failed to load slide image:', slides[currentSlide]);
            e.target.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Successfully loaded slide:', slides[currentSlide]);
          }}
        />
        
        {/* Navigation controls */}
        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onSlideChange(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => onSlideChange(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded-full">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Slide thumbnails */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="flex space-x-2 min-w-max">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => onSlideChange(index)}
              className={`flex-shrink-0 w-20 h-14 rounded border-2 overflow-hidden transition-all duration-200 ${
                index === currentSlide
                  ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <img
                src={slide}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Failed to load thumbnail:', slide);
                  e.target.style.display = 'none';
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const SlideCreation = () => {
  const { paperId, slides, setSlides, progressToNextStep } = useWorkflow();
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingLatex, setDownloadingLatex] = useState(false);

  // Add this function
  const handleDownloadLatex = async () => {
    if (!paperId) return;

    setDownloadingLatex(true);
    try {
      const response = await apiService.downloadLatexSource(paperId);
      downloadFile(response.data, `slides_${paperId}.tex`);
      toast.success('LaTeX source downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download LaTeX source');
    } finally {
      setDownloadingLatex(false);
    }
  };

  useEffect(() => {
    if (slides && slides.length > 0) {
      setCurrentSlide(0);
    }
  }, [slides]);

  const handleGenerateSlides = async () => {
    if (!paperId) return;

    setLoading(true);
    try {
      // 1. Call backend to generate slides
      console.log('Generating slides for paper:', paperId);
      await apiService.generateSlides(paperId);

      // 2. Get preview image names
      console.log('Fetching slide preview...');
      const previewResponse = await apiService.getSlidePreview(paperId);
      const imageNames = previewResponse.data.images || [];
      
      console.log('Received slide images:', imageNames);

      // 3. Create full URLs for the slide images
      const imageUrls = imageNames.map(imageName => 
        apiService.getSlideImageUrl(paperId, imageName)
      );
      
      console.log('Generated slide URLs:', imageUrls);
      setSlides(imageUrls);

      toast.success(`${imageNames.length} slides generated successfully!`);
    } catch (error) {
      console.error("Slide generation error:", error);
      toast.error("Failed to generate slides");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!paperId) return;

    setDownloadingPdf(true);
    try {
      const response = await apiService.downloadSlides(paperId);
      downloadFile(response.data, `slides_${paperId}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleContinueToMedia = () => {
    if (!slides || slides.length === 0) {
      toast.error('Please generate slides first');
      return;
    }
    progressToNextStep();
  };

  const breadcrumbs = [
    { label: 'Slide Creation', href: '/slide-creation' }
  ];

  if (!paperId) {
    return (
      <Layout title="Slide Creation" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <FiSliders className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Paper Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please complete the script generation step first.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="" breadcrumbs={breadcrumbs}>
      <div className="space-y-6 min-h-0">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Create Presentation Slides
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Generate beautiful LaTeX slides from your scripts
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            {!slides || slides.length === 0 ? (
              <button
                onClick={handleGenerateSlides}
                disabled={loading}
                className="flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FiSliders className="w-5 h-5 mr-2" />
                    Generate Slides
                  </>
                )}
              </button>
            ) : (
              <>
    <button
      onClick={handleDownloadPdf}
      disabled={downloadingPdf}
      className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
    >
      {downloadingPdf ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Downloading...
        </>
      ) : (
        <>
          <FiDownload className="w-5 h-5 mr-2" />
          Download PDF
        </>
      )}
    </button>
    
    {/* Add this new button */}
    <button
      onClick={handleDownloadLatex}
      disabled={downloadingLatex}
      className="flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
    >
      {downloadingLatex ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Downloading...
        </>
      ) : (
        <>
          <FiDownload className="w-5 h-5 mr-2" />
          Download LaTeX
        </>
      )}
    </button>
    
    <button
      onClick={handleContinueToMedia}
      className="flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
    >
      <FiArrowRight className="w-5 h-5 mr-2" />
      Continue to Media
    </button>
  </>
            )}
          </div>
        </div>

        {/* Slide Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Slide Preview
            </h3>
            
            {slides && slides.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <FiEye className="w-4 h-4" />
                <span>{slides.length} slides generated</span>
              </div>
            )}
          </div>

          <SlidePreview
            slides={slides}
            currentSlide={currentSlide}
            onSlideChange={setCurrentSlide}
          />
        </motion.div>

        {/* Regeneration Option */}
        {/* {slides && slides.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-3">
              <FiRefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Want to Regenerate?
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  If you're not satisfied with the current slides, you can regenerate them. 
                  Make sure to update your scripts first if needed.
                </p>
                <button
                  onClick={handleGenerateSlides}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="w-4 h-4 mr-2" />
                      Regenerate Slides
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )} */}
      </div>
    </Layout>
  );
};

export default SlideCreation;
