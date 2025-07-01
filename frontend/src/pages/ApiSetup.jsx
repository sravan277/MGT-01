import React, { useState } from 'react';
import { useWorkflow } from '../contexts/WorkflowContext';
import ApiSetupForm from './ApiSetupForm';
import Layout from '../components/common/Layout'; // Adjust the import path if needed

const ApiSetup = () => {
  const [showForm, setShowForm] = useState(false);
  const { progressToNextStep } = useWorkflow();

  // Breadcrumbs for consistency with other pages
  const breadcrumbs = [
    { label: 'API Setup', href: '/api-setup' }
  ];

  return (
    <Layout title="" breadcrumbs={breadcrumbs}>
      {showForm ? (
        <ApiSetupForm />
      ) : (
        <div className="max-w-xl mx-auto mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">API Setup</h2>
          <p className="mb-8 text-gray-600 dark:text-gray-300">
            Would you like to configure your API keys now? You can skip this step and do it later if you prefer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              onClick={() => setShowForm(true)}
            >
              Configure API Keys
            </button>
            <button
              className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-colors"
              onClick={progressToNextStep}
            >
              Skip API Setup
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ApiSetup;