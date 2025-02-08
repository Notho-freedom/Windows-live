import React, { useContext, useEffect } from 'react';
import { FiVolume2, FiWifi, FiSearch, FiMessageSquare } from 'react-icons/fi';
import { AppContext } from '../AppProvider';
import { FaChevronUp, FaWindows } from 'react-icons/fa';

const Taskbar = () => {
  const {
    isStartMenuVisible,
    setIsStartMenuVisible,
    currentTime,
    currentDate,
    pinnedApps,
    updateTime,
  } = useContext(AppContext);

  useEffect(() => {
    updateTime(); // Initialise l'heure
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer); // Clean up on unmount
  }, [updateTime]);

  return (
    <div className="relative bottom-0 left-0 w-full h-8 bg-gray-900 text-white flex items-center justify-between shadow-lg border-gray-700">
      {/* Menu démarrer et applications épinglées */}
      <div className="flex items-center justify-between lg:w-1/4 xl:w-1/4">
        {/* Bouton Windows */}
        <button
          aria-label="Menu Démarrer"
          className="flex items-center py-2 px-2 hover:bg-gray-800 hover:text-blue-500 transition"
          onClick={() => setIsStartMenuVisible(!isStartMenuVisible)}
        >
          <FaWindows size={18} />
        </button>

        {/* Barre de recherche */}
        <div className="items-center bg-gray-800 gap-1 py-1 px-2 hover:bg-gray-700 transition w-full h-8 flex">
          <FiSearch size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher"
            className="bg-transparent border-none outline-none text-sm text-gray-300 placeholder-gray-500 h-full w-full"
          />
        </div>

        {/* Applications épinglées */}
        <div className="flex">
          {pinnedApps.map((app) => (
            <div
              key={app.id}
              className="w-8 h-8 flex items-center ml-1 justify-center cursor-pointer hover:bg-gray-700 transition border-b"
              title={app.name}
            >
              {app.icon}
            </div>
          ))}
        </div>
      </div>

      {/* Notifications et barre d'état système */}
      <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="flex items-center justify-center w-6 h-6 cursor-pointer hover:text-gray-400"
        >
          <FaChevronUp size={14} />
        </button>

        {/* Réseau */}
        <button
          aria-label="Réseau"
          className="flex items-center justify-center w-6 h-6 cursor-pointer hover:text-gray-400"
        >
          <FiWifi size={14} />
        </button>

        {/* Volume */}
        <button
          aria-label="Volume"
          className="flex items-center justify-center w-6 h-6 cursor-pointer hover:text-gray-400"
        >
          <FiVolume2 size={14} />
        </button>

        {/* Horloge */}
        <div className="flex flex-col text-right">
          <span className="text-xs">FRA</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs" title={currentDate}>
            {currentTime}
          </span>
        </div>

        {/* Messages */}
        <button
          aria-label="Messages"
          className="flex items-center justify-center w-6 h-6 cursor-pointer hover:text-gray-400 mr-4"
        >
          <FiMessageSquare size={14} />
        </button>
      </div>
    </div>
  );
};

export default Taskbar;
