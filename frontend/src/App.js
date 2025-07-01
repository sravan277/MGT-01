import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import { ApiProvider } from './contexts/ApiContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
// Pages
import LandingPage from './pages/LandingPage'; // Import the new landing page
import ApiSetup from './pages/ApiSetup';
import PaperProcessing from './pages/PaperProcessing';
import ScriptGeneration from './pages/ScriptGeneration';
import SlideCreation from './pages/SlideCreation';
import MediaGeneration from './pages/MediaGeneration';
import Results from './pages/Results';
import About from './pages/About';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AuthProvider>
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <ApiProvider>
            <WorkflowProvider>
              <div className="App">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/api-setup" element={
                    <ProtectedRoute>
                      <ApiSetup />
                    </ProtectedRoute>
                  } />
                  <Route path="/paper-processing" element={
                    <ProtectedRoute>
                      <PaperProcessing />
                    </ProtectedRoute>
                  } />
                  <Route path="/script-generation" element={
                    <ProtectedRoute>
                      <ScriptGeneration />
                    </ProtectedRoute>
                  } />
                   <Route path="/slide-creation" element={
                    <ProtectedRoute>
                      <SlideCreation />
                    </ProtectedRoute>
                  } />
                   <Route path="/media-generation" element={
                    <ProtectedRoute>
                      <MediaGeneration />
                    </ProtectedRoute>
                  } />
                   <Route path="/results" element={
                    <ProtectedRoute>
                      <Results />
                    </ProtectedRoute>
                  } />
                  <Route path="/about" element={<About />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 2000,
                    style: {
                      background: 'var(--toast-bg)',
                      color: 'var(--toast-color)',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#ffffff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#ffffff',
                      },
                    },
                  }}
                />
              </div>
            </WorkflowProvider>
          </ApiProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
