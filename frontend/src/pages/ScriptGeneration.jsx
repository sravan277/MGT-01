import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEdit3, FiSave, FiRefreshCw, FiImage, FiList, 
  FiCheck, FiX, FiMinus, FiArrowRight, FiArrowLeft
} from 'react-icons/fi';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ImageSelector from '../components/workflow/ImageSelector';
import { useWorkflow } from '../contexts/WorkflowContext';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const ScriptSection = ({ 
  sectionName, 
  script, 
  bulletPoints = [], 
  selectedImage, 
  onScriptChange, 
  onBulletPointsChange,
  onImageSelect,
  onSave,
  paperId,
  availableImages,
  isSaving,
  hasLocalChanges
}) => {
  const [localScript, setLocalScript] = useState(script);
  const [localBullets, setLocalBullets] = useState(bulletPoints);
  const [isEditing, setIsEditing] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setLocalScript(script);
  }, [script]);

  useEffect(() => {
    setLocalBullets(bulletPoints);
  }, [bulletPoints]);

  const handleSave = async () => {
    try {
      await onSave(sectionName, localScript, localBullets);
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      // Don't close editing mode on error
    }
  };

  const handleCancel = () => {
    setLocalScript(script);
    setLocalBullets(bulletPoints);
    setIsEditing(false);
  };

  const addBulletPoint = () => {
    setLocalBullets([...localBullets, '']);
  };

  const removeBulletPoint = (index) => {
    setLocalBullets(localBullets.filter((_, i) => i !== index));
  };

  const updateBulletPoint = (index, value) => {
    const newBullets = [...localBullets];
    newBullets[index] = value;
    setLocalBullets(newBullets);
  };

  const handleImageSelect = async (imageName) => {
    try {
      await apiService.assignImageToSection(paperId, sectionName, imageName);
      onImageSelect(sectionName, imageName);
      toast.success(`Image ${imageName ? 'assigned' : 'removed'} successfully!`);
    } catch (error) {
      console.error('Error assigning image:', error);
      toast.error('Failed to assign image');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {sectionName}
          </h3>
          
          {/* Status indicators */}
          <div className="flex items-center space-x-2">
            {selectedImage && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                <FiImage className="w-3 h-3 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-600 dark:text-green-400">Image</span>
              </div>
            )}
            
            {hasLocalChanges && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <FiEdit3 className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                <span className="text-xs text-yellow-600 dark:text-yellow-400">Modified</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              title="Edit section"
            >
              <FiEdit3 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
                title="Save changes"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4 mr-2" />
                    Save Section
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                title="Cancel changes"
                disabled={isSaving}
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Script Editor */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Presentation Script
          </label>
          {isEditing && (
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{localScript.length} characters</span>
              <span>•</span>
              <span>~{Math.ceil(localScript.length / 150)} minutes</span>
            </div>
          )}
        </div>
        <textarea
          value={localScript}
          onChange={(e) => setLocalScript(e.target.value)}
          disabled={!isEditing}
          className={`w-full h-32 px-4 py-3 border rounded-lg transition-all duration-200 resize-none ${
            isEditing
              ? 'border-primary-500 dark:border-primary-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
          } dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
          placeholder={`Enter narration script for ${sectionName}...`}
        />
      </div>

      {/* Bullet Points Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Slide Bullet Points
          </label>
          
          {isEditing && (
            <button
              onClick={addBulletPoint}
              className="flex items-center px-3 py-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              title="Add bullet point"
            >
              <FiList className="w-3 h-3 mr-1" />
              Add Bullet
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {localBullets.length > 0 ? (
            localBullets.map((bullet, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-gray-400 dark:text-gray-500 mt-2">•</span>
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => updateBulletPoint(index, e.target.value)}
                  disabled={!isEditing}
                  className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-colors duration-200 ${
                    isEditing
                      ? 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                  } dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                  placeholder="Enter bullet point..."
                />
                {isEditing && (
                  <button
                    onClick={() => removeBulletPoint(index)}
                    className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                    title="Remove bullet point"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400 italic border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              <FiList className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No bullet points yet.</p>
              {isEditing && <p className="text-xs mt-1">Click "Add Bullet" to create bullet points.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Image Assignment */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Slide Image
          </label>
          <button
            onClick={() => setShowImageSelector(true)}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center space-x-1 transition-colors duration-200"
          >
            <FiImage className="w-4 h-4" />
            <span>{selectedImage ? 'Change Image' : 'Select Image'}</span>
          </button>
        </div>

        {selectedImage ? (
          <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 border-green-200 dark:border-green-800">
            <img
              src={apiService.getImageUrl(paperId, selectedImage)}
              alt={`${sectionName} slide`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
              {selectedImage}
            </div>
          </div>
        ) : (
          <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <FiImage className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No image selected</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Text-only slide</p>
            </div>
          </div>
        )}
      </div>

      {/* Image Selector Modal */}
      <AnimatePresence>
        {showImageSelector && (
          <ImageSelector
            paperId={paperId}
            images={availableImages}
            selectedImage={selectedImage}
            onSelect={(image) => {
              handleImageSelect(image);
              setShowImageSelector(false);
            }}
            onClose={() => setShowImageSelector(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ScriptGeneration = () => {
  const { 
    paperId, 
    scripts, 
    editedScripts,
    bulletPoints,
    setScripts,
    setEditedScripts,
    setBulletPoints,
    images, 
    selectedImages, 
    setSelectedImage,
    progressToNextStep 
  } = useWorkflow();
  
  const [loading, setLoading] = useState(false);
  const [sectionSavingStates, setSectionSavingStates] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [localChanges, setLocalChanges] = useState({});
  const [hasGeneratedScripts, setHasGeneratedScripts] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Use refs to track initialization to prevent multiple loads
  const initializationRef = useRef(false);
  const loadingRef = useRef(false);

  const sections = ['Introduction', 'Methodology', 'Results', 'Discussion', 'Conclusion'];

  // Calculate if there are any unsaved changes
  const hasChanges = Object.keys(localChanges).some(key => localChanges[key]);

  // Check if any section is currently being saved
  const isAnySectionSaving = Object.values(sectionSavingStates).some(saving => saving);

  // Better logic for determining if scripts exist
  const hasScripts = (editedScripts && Object.keys(editedScripts).length > 0) || hasGeneratedScripts;

  const getAvailableSections = () => {
    return sections.filter(section => editedScripts[section] !== undefined);
  };

  // ADD: Effect to ensure active tab is valid when sections change
  useEffect(() => {
    const availableSections = getAvailableSections();
    if (availableSections.length > 0) {
      const currentSection = sections[activeTab];
      if (!availableSections.includes(currentSection)) {
        // If current tab doesn't have content, switch to first available section
        const firstAvailableIndex = sections.findIndex(section => 
          availableSections.includes(section)
        );
        if (firstAvailableIndex !== -1) {
          setActiveTab(firstAvailableIndex);
        }
      }
    }
  }, [editedScripts, activeTab]);
  const refreshDataFromServer = useCallback(async () => {
    if (!paperId) return false;
    
    try {
      console.log('Fetching latest data from server...');
      const response = await apiService.getScriptsWithBullets(paperId);
      const sectionsData = response.data.sections || {};
      
      if (Object.keys(sectionsData).length > 0) {
        const refreshedScripts = {};
        const refreshedBullets = {};
        const refreshedImages = {};
        
        Object.entries(sectionsData).forEach(([section, data]) => {
          refreshedScripts[section] = data.script || '';
          refreshedBullets[section] = data.bullet_points || [];
          if (data.assigned_image) {
            refreshedImages[section] = data.assigned_image;
          }
        });
        
        // FIXED: Only update states if we have data to prevent flickering
        if (Object.keys(refreshedScripts).length > 0) {
          setScripts(refreshedScripts);
          setEditedScripts(refreshedScripts);
        }
        
        if (Object.keys(refreshedBullets).length > 0) {
          setBulletPoints(refreshedBullets);
        }
        
        // Update selected images
        Object.entries(refreshedImages).forEach(([section, image]) => {
          setSelectedImage(section, image);
        });
        
        console.log('Successfully refreshed data from server');
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh data from server:', error);
      return false;
    } finally {
      setRefreshing(false);
      loadingRef.current = false;
    }
  }, [paperId, setScripts, setEditedScripts, setBulletPoints, setSelectedImage]);

  // Load existing scripts on component mount
  const loadExistingScripts = useCallback(async () => {
    if (!paperId || initializationRef.current || loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    console.log('Loading existing scripts for paperId:', paperId);
    
    try {
      const success = await refreshDataFromServer();
      if (success) {
        setHasGeneratedScripts(true);
        initializationRef.current = true;
        console.log('Scripts loaded and state updated successfully');
      }
    } catch (error) {
      console.log('No existing scripts found or error loading:', error);
    } finally {
      loadingRef.current = false;
    }
  }, [paperId, refreshDataFromServer]);

  // Load scripts on component mount
  useEffect(() => {
    if (paperId && !initializationRef.current) {
      loadExistingScripts();
    }
  }, [paperId, loadExistingScripts]);

  const handleGenerateScript = async () => {
    if (!paperId) return;

    setLoading(true);
    try {
      console.log('Generating scripts for paperId:', paperId);
      
      // Generate scripts
      await apiService.generateScript(paperId);
      
      // Wait a moment for the backend to save the data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh data from server
      const success = await refreshDataFromServer();
      if (success) {
        setLocalChanges({});
        setHasGeneratedScripts(true);
        initializationRef.current = true;
        toast.success('Scripts generated successfully!');
      } else {
        toast.error('Scripts generated but failed to load');
      }
    } catch (error) {
      console.error('Error generating scripts:', error);
      toast.error('Failed to generate scripts');
    } finally {
      setLoading(false);
    }
  };

  const handleScriptChange = (section, script) => {
    setEditedScripts(prev => ({ ...prev, [section]: script }));
    setLocalChanges(prev => ({ ...prev, [section]: true }));
  };

  const handleBulletPointsChange = (section, bullets) => {
    setBulletPoints(prev => ({ ...prev, [section]: bullets }));
    setLocalChanges(prev => ({ ...prev, [section]: true }));
  };

  // FIXED: Updated save function with graceful refresh
  const handleSave = async (sectionName, script, bullets) => {
    if (!paperId) return;
    
    // Set saving state for this specific section
    setSectionSavingStates(prev => ({ ...prev, [sectionName]: true }));
    
    try {
      const sectionData = {
        script: script || '',
        bullet_points: bullets || []
      };

      console.log('Saving section data:', { sectionName, sectionData });

      // Save to backend
      const response = await apiService.updateScriptsWithBullets(paperId, {
        sections: { [sectionName]: sectionData }
      });

      console.log('Save response:', response.data);

      // Immediately update local state for responsiveness
      setScripts(prev => ({ ...prev, [sectionName]: script }));
      setEditedScripts(prev => ({ ...prev, [sectionName]: script }));
      setBulletPoints(prev => ({ ...prev, [sectionName]: bullets }));
      
      // Clear local changes for this section
      setLocalChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[sectionName];
        return newChanges;
      });
      
      setHasGeneratedScripts(true);
      
      
      
      // FIXED: Graceful background refresh without affecting UI
      const toastId = toast.loading('Refreshing section...');
      setTimeout(async () => {
        try {
          await refreshDataFromServer();
          console.log('Background refresh completed successfully');
        } catch (error) {
          console.error('Background refresh failed:', error);
          // Don't show error toast for background refresh failures
        } finally {
          toast.dismiss(toastId);
        }
      }, 1000); // Longer delay to ensure backend processing is complete
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error(`Failed to save ${sectionName} section`);
      throw error;
    } finally {
      // Clear saving state for this specific section
      // toast.success(`${sectionName} section saved successfully!`);
      setSectionSavingStates(prev => ({ ...prev, [sectionName]: false }));
    }
  };

  const handleContinueToSlides = () => {
    if (hasChanges) {
      toast.error('Please save your changes before continuing');
      return;
    }
    
    if (isAnySectionSaving) {
      toast.error('Please wait for all sections to finish saving');
      return;
    }
    
    if (!editedScripts || Object.keys(editedScripts).length === 0) {
      toast.error('Please generate scripts first');
      return;
    }
    
    progressToNextStep();
  };

  const breadcrumbs = [
    { label: 'Script Generation', href: '/script-generation' }
  ];

  if (!paperId) {
    return (
      <Layout title="" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <FiEdit3 className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Paper Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please upload a paper first to generate scripts.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="" breadcrumbs={breadcrumbs}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Generate Presentation Scripts
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create and customize scripts with bullet points for your academic presentation
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            {!hasScripts ? (
              <button
                onClick={handleGenerateScript}
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
                    <FiRefreshCw className="w-5 h-5 mr-2" />
                    Generate Scripts
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleContinueToSlides}
                disabled={hasChanges || isAnySectionSaving}
                className="flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <FiArrowRight className="w-5 h-5 mr-2" />
                Continue to Slides
              </button>
            )}
          </div>
        </div>

        {/* Changes Warning */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3">
              <FiEdit3 className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  You have unsaved changes
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Please save your changes before continuing to the next step.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Saving Progress Warning */}
        {isAnySectionSaving && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Saving sections in progress...
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Please wait for all sections to finish saving before continuing.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Generation Progress */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
          >
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="md" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  Generating Scripts...
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  AI is analyzing your paper and creating presentation scripts with bullet points.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Script Sections with Pagination (Chrome Tabs Style) */}
        {hasScripts && editedScripts && Object.keys(editedScripts).length > 0 && (
          <div>
            {/* FIXED: Tabs with proper state management */}
            <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {sections.map((section, idx) => {
                const hasContent = editedScripts[section] !== undefined;
                if (!hasContent) return null;
                
                const isActive = idx === activeTab;
                
                return (
                  <button
                    key={section}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors duration-200 focus:outline-none whitespace-nowrap
                      ${isActive
                        ? 'bg-white dark:bg-gray-800 border-x border-t border-gray-200 dark:border-gray-700 text-primary-600 dark:text-primary-400 -mb-px'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    style={{
                      minWidth: 120,
                      borderBottom: isActive ? '1px solid white' : undefined,
                    }}
                    onClick={() => setActiveTab(idx)}
                  >
                    {section}
                    {/* Visual indicator for sections with local changes */}
                    {localChanges[section] && (
                      <span className="ml-2 w-2 h-2 bg-yellow-500 rounded-full inline-block"></span>
                    )}
                    {/* Visual indicator for sections currently saving */}
                    {sectionSavingStates[section] && (
                      <span className="ml-2">
                        <LoadingSpinner size="xs" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* FIXED: Tab Content with improved rendering */}
            <div className="min-h-[600px]">
              <AnimatePresence mode="wait">
                {sections.map((section, idx) => {
                  const hasContent = editedScripts[section] !== undefined;
                  if (!hasContent || idx !== activeTab) return null;
                  
                  return (
                    <motion.div
                      key={`tab-content-${section}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ScriptSection
                        sectionName={section}
                        script={editedScripts[section] || ''}
                        bulletPoints={bulletPoints[section] || []}
                        selectedImage={selectedImages[section]}
                        onScriptChange={handleScriptChange}
                        onBulletPointsChange={handleBulletPointsChange}
                        onImageSelect={setSelectedImage}
                        onSave={handleSave}
                        paperId={paperId}
                        availableImages={images}
                        isSaving={sectionSavingStates[section] || false}
                        hasLocalChanges={localChanges[section]}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* ADD: Tab navigation controls for better UX */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  const availableSections = getAvailableSections();
                  const currentIndex = availableSections.findIndex(section => 
                    sections.indexOf(section) === activeTab
                  );
                  if (currentIndex > 0) {
                    const prevSection = availableSections[currentIndex - 1];
                    setActiveTab(sections.indexOf(prevSection));
                  }
                }}
                disabled={activeTab === 0 || getAvailableSections().indexOf(sections[activeTab]) === 0}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Previous Section
              </button>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                {getAvailableSections().indexOf(sections[activeTab]) + 1} of {getAvailableSections().length} sections
              </span>

              <button
                onClick={() => {
                  const availableSections = getAvailableSections();
                  const currentIndex = availableSections.findIndex(section => 
                    sections.indexOf(section) === activeTab
                  );
                  if (currentIndex < availableSections.length - 1) {
                    const nextSection = availableSections[currentIndex + 1];
                    setActiveTab(sections.indexOf(nextSection));
                  }
                }}
                disabled={getAvailableSections().indexOf(sections[activeTab]) === getAvailableSections().length - 1}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next Section
                <FiArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}
        {!loading && !hasScripts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600"
          >
            <FiEdit3 className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Scripts Generated Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Click "Generate Scripts" to create presentation scripts from your academic paper.
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default ScriptGeneration;
