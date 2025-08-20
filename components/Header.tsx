import React from 'react';

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
);

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
);

interface HeaderProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <header className="bg-white dark:bg-dark-card shadow-md dark:border-b dark:border-dark-border py-4 sticky top-0 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex-1"></div>
        <div className="flex-1 text-center">
            <h1 className="text-5xl font-bold tracking-tight font-meme bg-gradient-to-r from-google-blue via-google-red to-google-yellow bg-clip-text text-transparent">
            MemePulse
            </h1>
            <p className="text-md text-gray-600 dark:text-dark-text-secondary mt-1">
            Reimagining Internal Comms at Google Meme-ingfully
            </p>
        </div>
        <div className="flex-1 flex justify-end">
            <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-600 dark:text-dark-text-secondary hover:bg-neutral-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
            >
                {isDarkMode ? <SunIcon className="w-6 h-6 text-google-yellow" /> : <MoonIcon className="w-6 h-6 text-google-blue" />}
            </button>
        </div>
      </div>
    </header>
  );
};