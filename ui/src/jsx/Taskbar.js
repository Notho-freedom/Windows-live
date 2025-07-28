import React, { useContext, useEffect } from 'react';
import { FiVolume2, FiWifi, FiSearch, FiMessageSquare, FiBell } from 'react-icons/fi';
import { AppContext } from '../AppProvider';
import { FaChevronUp, FaWindows } from 'react-icons/fa';
import { GetIcon } from './IconManager';

const Taskbar = () => {
  const {
    isStartMenuVisible,
    setIsStartMenuVisible,
    currentTime,
    currentDate,
    pinnedApps,
    updateTime,
    openWindows,
  } = useContext(AppContext);

  useEffect(() => {
    updateTime(); // Initialise l'heure
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer); // Clean up on unmount
  }, [updateTime]);

  return (
    <div className="taskbar">
      {/* Section gauche - Menu démarrer et applications épinglées */}
      <div className="flex items-center gap-2">
        {/* Bouton Windows */}
        <button
          aria-label="Menu Démarrer"
          className={`flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 ${
            isStartMenuVisible 
              ? 'bg-white/20 text-white' 
              : 'hover:bg-white/10 text-white/90 hover:text-white'
          }`}
          onClick={() => setIsStartMenuVisible(!isStartMenuVisible)}
        >
          <FaWindows size={16} />
        </button>

        {/* Barre de recherche */}
        <div className="search-bar flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 hover:bg-white/10">
          <FiSearch size={14} className="text-white/70" />
          <input
            type="text"
            placeholder="Rechercher"
            className="bg-transparent border-none outline-none text-sm text-white placeholder-white/50 w-32"
          />
        </div>

        {/* Applications épinglées */}
        <div className="flex items-center gap-1">
          {pinnedApps.slice(0, 6).map((app) => (
            <div
              key={app.id}
              className="w-10 h-10 flex items-center justify-center cursor-pointer rounded-md transition-all duration-200 hover:bg-white/10 group"
              title={app.name}
            >
              <div className="w-6 h-6 flex items-center justify-center text-white/90 group-hover:text-white">
                {app.icon}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section centrale - Fenêtres ouvertes */}
      <div className="flex items-center gap-1">
        {openWindows.map((window) => (
          <div
            key={window.id}
            className="w-10 h-10 flex items-center justify-center cursor-pointer rounded-md transition-all duration-200 hover:bg-white/10 group"
            title={window.title}
          >
            <div className="w-6 h-6 flex items-center justify-center text-white/90 group-hover:text-white">
              <GetIcon item={window.item} size={4} />
            </div>
          </div>
        ))}
      </div>

      {/* Section droite - Notifications et barre d'état système */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="w-10 h-10 flex items-center justify-center cursor-pointer rounded-md transition-all duration-200 hover:bg-white/10 text-white/90 hover:text-white"
        >
          <FiBell size={14} />
        </button>

        {/* Réseau */}
        <button
          aria-label="Réseau"
          className="w-10 h-10 flex items-center justify-center cursor-pointer rounded-md transition-all duration-200 hover:bg-white/10 text-white/90 hover:text-white"
        >
          <FiWifi size={14} />
        </button>

        {/* Volume */}
        <button
          aria-label="Volume"
          className="w-10 h-10 flex items-center justify-center cursor-pointer rounded-md transition-all duration-200 hover:bg-white/10 text-white/90 hover:text-white"
        >
          <FiVolume2 size={14} />
        </button>

        {/* Séparateur */}
        <div className="w-px h-6 bg-white/20 mx-2"></div>

        {/* Horloge */}
        <div className="flex flex-col items-end px-2">
          <span className="text-xs text-white/90 font-medium">
            {currentTime}
          </span>
          <span className="text-xs text-white/70">
            {currentDate}
          </span>
        </div>

        {/* Bouton de notification système */}
        <button
          aria-label="Centre de notifications"
          className="w-10 h-10 flex items-center justify-center cursor-pointer rounded-md transition-all duration-200 hover:bg-white/10 text-white/90 hover:text-white"
        >
          <FaChevronUp size={12} />
        </button>
      </div>
    </div>
  );
};

export default Taskbar;
