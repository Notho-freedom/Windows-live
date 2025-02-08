import React from 'react';

const WelcomeScreen = ({ User }) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-white windows-blue">
      <div className="flex items-center">
        <div className="text-xl md:text-2xl lg:text-3xl loader"></div>
        {User ? (
          <div className="flex flex-col items-center">
            <h1 className="text-xl md:text-2xl lg:text-3xl ml-4">Bienvenue {User}</h1>
          </div>
        ) : (
          <div className="text-xl md:text-2xl lg:text-3xl ml-4"></div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
