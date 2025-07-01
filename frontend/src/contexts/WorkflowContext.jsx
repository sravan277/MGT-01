import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const WorkflowContext = createContext();

const initialState = {
  currentStep: 1,
  completedSteps: [],
  paperId: null,
  sessionId: null,
  metadata: {
    title: '',
    authors: '',
    date: ''
  },
  scripts: {},
  editedScripts: {},
  bulletPoints: {},
  images: [],
  selectedImages: {},
  slides: [],
  audioFiles: [],
  videoPath: null,
  isLoading: false,
  error: null,
  autoProgress: true,
  manualNavigation: false
};

const workflowReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
        manualNavigation: true,
        autoProgress: false
      };
    case 'PROGRESS_TO_NEXT_STEP':
      const nextStep = Math.min(state.currentStep + 1, 6);
      const newCompletedSteps = [...new Set([...state.completedSteps, state.currentStep])];
      return {
        ...state,
        currentStep: nextStep,
        completedSteps: newCompletedSteps,
        autoProgress: true,
        manualNavigation: false
      };
    case 'MARK_STEP_COMPLETED':
      return {
        ...state,
        completedSteps: [...new Set([...state.completedSteps, action.payload])]
      };
    case 'SET_PAPER_ID':
      return { ...state, paperId: action.payload };
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    case 'SET_METADATA':
      return { ...state, metadata: { ...state.metadata, ...action.payload } };
    case 'SET_SCRIPTS':
      return { ...state, scripts: action.payload, editedScripts: action.payload };
    case 'SET_EDITED_SCRIPTS':
      return { ...state, editedScripts: action.payload };
    case 'SET_BULLET_POINTS':
      return { ...state, bulletPoints: action.payload };
    case 'UPDATE_SCRIPT':
      return {
        ...state,
        editedScripts: {
          ...state.editedScripts,
          [action.payload.section]: action.payload.script
        }
      };
    case 'UPDATE_BULLET_POINTS':
      return {
        ...state,
        bulletPoints: {
          ...state.bulletPoints,
          [action.payload.section]: action.payload.bullets
        }
      };
    case 'SET_IMAGES':
      return { ...state, images: action.payload };
    case 'SET_SELECTED_IMAGE':
      return {
        ...state,
        selectedImages: {
          ...state.selectedImages,
          [action.payload.section]: action.payload.image
        }
      };
    case 'SET_SLIDES':
      return { ...state, slides: action.payload };
    case 'SET_AUDIO_FILES':
      return { ...state, audioFiles: action.payload };
    case 'SET_VIDEO_PATH':
      return { ...state, videoPath: action.payload };
    case 'ENABLE_AUTO_PROGRESS':
      return { ...state, autoProgress: true, manualNavigation: false };
    case 'DISABLE_AUTO_PROGRESS':
      return { ...state, autoProgress: false, manualNavigation: true };
    case 'RESET_WORKFLOW':
      return { ...initialState };
    default:
      return state;
  }
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) throw new Error('useWorkflow must be used within a WorkflowProvider');
  return context;
};

export const WorkflowProvider = ({ children }) => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyPaperExists = async () => {
      if (state.paperId) {
        try {
          const exists = await apiService.checkPaperExists(state.paperId);
          if (!exists) {
            dispatch({ type: 'SET_PAPER_ID', payload: null });
            dispatch({ type: 'SET_METADATA', payload: initialState.metadata });
            dispatch({ type: 'SET_SCRIPTS', payload: {} });
            dispatch({ type: 'SET_EDITED_SCRIPTS', payload: {} });
            dispatch({ type: 'SET_BULLET_POINTS', payload: {} });
            dispatch({ type: 'SET_IMAGES', payload: [] });
            dispatch({ type: 'SET_SELECTED_IMAGE', payload: {} });

            if (location.pathname !== '/api-setup') {
              toast.error('Your previous session data could not be loaded. Please upload your paper again.');
              navigate('/paper-processing');
            }
          }
        } catch (error) {
          console.error('Error verifying paper existence:', error);
        }
      }
    };
    verifyPaperExists();
  }, [state.paperId]);

  useEffect(() => {
    if (location.pathname === '/') return;
    if (!state.autoProgress || state.manualNavigation) return;

    const stepRoutes = {
      1: '/api-setup',
      2: '/paper-processing',
      3: '/script-generation',
      4: '/slide-creation',
      5: '/media-generation',
      6: '/results'
    };

    const targetRoute = stepRoutes[state.currentStep];
    if (targetRoute && location.pathname !== targetRoute) {
      navigate(targetRoute, { replace: true });
      setTimeout(() => dispatch({ type: 'DISABLE_AUTO_PROGRESS' }), 500);
    }
  }, [state.currentStep, state.autoProgress, state.manualNavigation, navigate, location.pathname]);

  useEffect(() => {
    const routeToStep = {
      '/': 0,
      '/api-setup': 1,
      '/paper-processing': 2,
      '/script-generation': 3,
      '/slide-creation': 4,
      '/media-generation': 5,
      '/results': 6
    };

    const expectedStep = routeToStep[location.pathname];
    if (location.pathname === '/') {
      if (state.currentStep !== 0) dispatch({ type: 'SET_STEP', payload: 0 });
      return;
    }

    if (expectedStep && expectedStep !== state.currentStep && !state.autoProgress) {
      dispatch({ type: 'SET_STEP', payload: expectedStep });
    }
  }, [location.pathname, state.currentStep, state.autoProgress]);

  const value = {
    ...state,
    setLoading: (v) => dispatch({ type: 'SET_LOADING', payload: v }),
    setError: (v) => dispatch({ type: 'SET_ERROR', payload: v }),
    setStep: (v) => dispatch({ type: 'SET_STEP', payload: v }),
    setPaperId: (v) => dispatch({ type: 'SET_PAPER_ID', payload: v }),
    setSessionId: (v) => dispatch({ type: 'SET_SESSION_ID', payload: v }),
    setMetadata: (v) => dispatch({ type: 'SET_METADATA', payload: v }),
    setScripts: (v) => dispatch({ type: 'SET_SCRIPTS', payload: v }),
    setEditedScripts: (v) => dispatch({ type: 'SET_EDITED_SCRIPTS', payload: v }),
    setBulletPoints: (v) => dispatch({ type: 'SET_BULLET_POINTS', payload: v }),
    updateScript: (section, script) => dispatch({ type: 'UPDATE_SCRIPT', payload: { section, script } }),
    updateBulletPoints: (section, bullets) => dispatch({ type: 'UPDATE_BULLET_POINTS', payload: { section, bullets } }),
    setImages: (v) => dispatch({ type: 'SET_IMAGES', payload: v }),
    setSelectedImage: (section, image) => dispatch({ type: 'SET_SELECTED_IMAGE', payload: { section, image } }),
    setSlides: (v) => dispatch({ type: 'SET_SLIDES', payload: v }),
    setAudioFiles: (v) => dispatch({ type: 'SET_AUDIO_FILES', payload: v }),
    setVideoPath: (v) => dispatch({ type: 'SET_VIDEO_PATH', payload: v }),
    progressToNextStep: () => dispatch({ type: 'PROGRESS_TO_NEXT_STEP' }),
    enableAutoProgress: () => dispatch({ type: 'ENABLE_AUTO_PROGRESS' }),
    disableAutoProgress: () => dispatch({ type: 'DISABLE_AUTO_PROGRESS' }),
    resetWorkflow: () => dispatch({ type: 'RESET_WORKFLOW' }),
    markStepCompleted: (step) => dispatch({ type: 'MARK_STEP_COMPLETED', payload: step })
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};
