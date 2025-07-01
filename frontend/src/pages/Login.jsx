// src/pages/Login.jsx
import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Login = () => {
  const { loginWithGoogle, loading } = useAuth();
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await loginWithGoogle(credentialResponse.credential);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Paper2Media
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Convert research papers to presentation videos
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signin_with"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
