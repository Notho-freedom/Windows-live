import React from 'react';
import { FaWindows } from 'react-icons/fa';

const WelcomeScreen = ({ User }) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-white bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="flex flex-col items-center space-y-8">
        {/* Logo Windows */}
        <div className="flex items-center space-x-4">
          <FaWindows size={48} className="animate-pulse" />
          <div className="text-4xl font-light">Windows</div>
        </div>

        {/* Message de chargement */}
        <div className="flex flex-col items-center space-y-4">
          <div className="loader"></div>
          {User ? (
            <div className="text-center">
              <h1 className="text-2xl font-light mb-2">Bienvenue</h1>
              <p className="text-lg opacity-90">{User}</p>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-light mb-2">Chargement</h1>
              <p className="text-lg opacity-90">Préparation de votre session...</p>
            </div>
          )}
        </div>

        {/* Indicateur de progression */}
        <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white/60 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
