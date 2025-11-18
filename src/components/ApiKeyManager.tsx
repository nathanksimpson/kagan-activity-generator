import { useState, useEffect } from 'react';
import { getApiKey, saveApiKey } from '../services/geminiClient';

interface ApiKeyManagerProps {
  onApiKeySet: () => void;
}

export function ApiKeyManager({ onApiKeySet }: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSet, setIsSet] = useState(false);

  useEffect(() => {
    const stored = getApiKey();
    if (stored) {
      setIsSet(true);
      onApiKeySet();
    }
  }, [onApiKeySet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim());
      setIsSet(true);
      setApiKey('');
      onApiKeySet();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  if (isSet) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-800 text-sm">
          ✓ API key is set and saved
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">
        Gemini API Key Required
      </h3>
      <p className="text-sm text-blue-700 mb-4">
        Enter your Gemini API key to generate Kagan activities. Get your key from{' '}
        <a
          href="https://makersuite.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Google AI Studio
        </a>
        . Your key will be stored locally in your browser.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="password"
          value={apiKey}
          onChange={handleChange}
          placeholder="Enter your Gemini API key"
          className="flex-1 px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save
        </button>
      </form>
    </div>
  );
}

