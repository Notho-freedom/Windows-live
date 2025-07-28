import React, { useContext } from 'react';
import { FaUser, FaCog, FaPowerOff, FaLock, FaCalendarAlt, FaStickyNote, FaTasks, FaEnvelope, FaFolder, FaDesktop } from 'react-icons/fa';
import { MdFolder, MdApps, MdSettings, MdSearch } from 'react-icons/md';
import { AppContext } from '../AppProvider';

const StartMenu = () => {
  const { isStartMenuVisible, pinnedApps, onLock, user } = useContext(AppContext);

  if (!isStartMenuVisible) return null;

  return (
    <div className="absolute bottom-12 left-4 w-80 h-96 bg-start-menu-bg backdrop-blur-md border border-white/10 rounded-lg shadow-2xl z-50">
      <div className="flex h-full">
        {/* Section gauche - Icônes de navigation */}
        <div className="w-16 bg-black/20 flex flex-col items-center py-4 gap-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200" title="Explorateur">
            <MdFolder size={20} className="text-white/90" />
          </div>
          <div className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200" title="Applications">
            <MdApps size={20} className="text-white/90" />
          </div>
          <div className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200" title="Paramètres">
            <MdSettings size={20} className="text-white/90" />
          </div>
          
          {/* Séparateur */}
          <div className="flex-1"></div>
          
          <div className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200" title="Profil">
            <FaUser size={16} className="text-white/90" />
          </div>
          <div
            className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200"
            title="Vérouiller"
            onClick={onLock}
          >
            <FaLock size={16} className="text-white/90" />
          </div>
          <div className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200" title="Paramètres">
            <FaCog size={16} className="text-white/90" />
          </div>
          <div className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200" title="Déconnexion">
            <FaPowerOff size={16} className="text-white/90" />
          </div>
        </div>

        {/* Section principale */}
        <div className="flex-1 p-4">
          {/* En-tête avec recherche */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FaUser size={16} className="text-white" />
              </div>
              <span className="text-white font-medium">{user}</span>
            </div>
            <div className="relative">
              <MdSearch size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Rechercher"
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              />
            </div>
          </div>

          {/* Applications épinglées */}
          <div className="mb-6">
            <h3 className="text-white/70 text-sm font-medium mb-3">Applications épinglées</h3>
            <div className="grid grid-cols-3 gap-2">
              {pinnedApps.slice(0, 6).map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col items-center p-3 rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200 group"
                >
                  <div className="w-8 h-8 flex items-center justify-center mb-2 text-white/90 group-hover:text-white">
                    {app.icon}
                  </div>
                  <span className="text-xs text-white/70 group-hover:text-white text-center truncate w-full">
                    {app.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Applications recommandées */}
          <div className="mb-6">
            <h3 className="text-white/70 text-sm font-medium mb-3">Recommandé</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200">
                <FaDesktop size={16} className="text-white/90" />
                <span className="text-white/90 text-sm">Bureau</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200">
                <FaFolder size={16} className="text-white/90" />
                <span className="text-white/90 text-sm">Documents</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200">
                <FaCalendarAlt size={16} className="text-white/90" />
                <span className="text-white/90 text-sm">Calendrier</span>
              </div>
            </div>
          </div>

          {/* Applications de productivité */}
          <div>
            <h3 className="text-white/70 text-sm font-medium mb-3">Productivité</h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center p-2 rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200 group">
                <FaCalendarAlt size={16} className="text-white/90 group-hover:text-white mb-1" />
                <span className="text-xs text-white/70 group-hover:text-white">Calendrier</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200 group">
                <FaStickyNote size={16} className="text-white/90 group-hover:text-white mb-1" />
                <span className="text-xs text-white/70 group-hover:text-white">Notes</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200 group">
                <FaTasks size={16} className="text-white/90 group-hover:text-white mb-1" />
                <span className="text-xs text-white/70 group-hover:text-white">Tâches</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-md hover:bg-white/10 cursor-pointer transition-all duration-200 group">
                <FaEnvelope size={16} className="text-white/90 group-hover:text-white mb-1" />
                <span className="text-xs text-white/70 group-hover:text-white">Mail</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;
