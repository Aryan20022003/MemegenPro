import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-light-blue shadow-md text-gray-800 py-4">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-indigo-700 font-meme">
          MemePulse
        </h1>
        <p className="text-md text-gray-600">
          Reimagining Internal Comms at Google Meme-ingfully
        </p>
      </div>
    </header>
  );
};
