import React, { useState, useEffect } from 'react';
import { Key, Lock, AlertCircle } from 'lucide-react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
  initialError?: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, initialError }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState(initialError || '');

  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim().length < 10) {
      setError('Please enter a valid API key.');
      return;
    }
    onSave(inputKey.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all scale-100">
        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
          <Key className="w-8 h-8 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome to Jugal AI</h2>
        <p className="text-center text-gray-500 mb-6">
          To ensure security, your Google Gemini API key is stored locally in your browser. We do not save it on any server.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              Gemini API Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="apiKey"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setError('');
                }}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="AIzaSy..."
              />
            </div>
            {error && (
              <div className="flex items-start mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02]"
          >
            Get Started
          </button>
        </form>

        <div className="mt-6 text-center">
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-700 underline"
          >
            Don't have a key? Get one here
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;