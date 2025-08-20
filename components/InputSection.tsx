
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface InputSectionProps {
  onGenerate: () => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading }) => {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-bold text-indigo-400">1. Generate Your Meme</h2>
      <div className="p-4 bg-gray-800 border-2 border-gray-700 rounded-lg">
          <p className="text-gray-400 mb-2">
            Instead of manual input, we're now fetching the latest updates directly from our internal news source to generate the most relevant memes.
          </p>
          <p className="text-sm text-gray-500 truncate">
            Source: <a href="https://gn.corp.google.com/article/4996332896661603378" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-400">
                https://gn.corp.google.com/article/4996332896661603378
            </a>
          </p>
          <p className="text-xs text-yellow-500 mt-3">
            (Note: Direct web scraping is simulated on the client-side. Content is pre-loaded for this demo.)
          </p>
      </div>

      <p className="text-gray-400">
        Ready for some AI-powered fun? Click the button below to create a meme that perfectly captures the current company vibe!
      </p>

      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="flex items-center justify-center w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          'Brewing up some fun...'
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            Generate Meme from Latest News
          </>
        )}
      </button>
    </div>
  );
};
