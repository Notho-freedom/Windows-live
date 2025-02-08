import React, { useContext } from 'react';
import { FaUser, FaCog, FaPowerOff, FaLock, FaCalendarAlt, FaStickyNote, FaTasks, FaEnvelope } from 'react-icons/fa';
import { MdFolder, MdApps, MdSettings } from 'react-icons/md';
import { AppContext } from '../AppProvider';
const StartMenu = () => {
  const { isStartMenuVisible, pinnedApps, onLock } = useContext(AppContext); // Accès au contexte

  return (
    <div
      className={`absolute bottom-0 left-0 w-2/3 lg:w-1/3 h-3/5 bg-opacity-70 shadow-lg backdrop-blur-md transition-transform transform ${
        isStartMenuVisible ? 'translate-y-0 flex' : 'hidden translate-y-full'
      }`}
    >
      <div className="flex h-full">
        <div className="flex flex-col items-center w-1/9 bg-gray-900 bg-opacity-70 backdrop-blur-md">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1 p-1 py-2 px-2 hover:bg-gray-700 cursor-pointer" title="Explorateur">
              <MdFolder size={15} />
            </div>
            <div className="flex items-center gap-1 p-1 px-2 hover:bg-gray-700 cursor-pointer" title="Applications">
              <MdApps size={15} />
            </div>
            <div className="flex items-center gap-1 p-1 px-2 hover:bg-gray-700 cursor-pointer" title="Paramètres">
              <MdSettings size={15} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 mt-auto mb-2">
            <div className="flex items-center gap-1 p-1 px-2 hover:bg-gray-700 cursor-pointer" title="Profil">
              <FaUser size={12} />
            </div>
            <div
              className="flex items-center gap-1 p-1 px-2 hover:bg-gray-700 cursor-pointer"
              title="Vérouiller"
              onClick={onLock}
            >
              <FaLock size={12} />
            </div>
            <div className="flex items-center gap-1 p-1 px-2 hover:bg-gray-700 cursor-pointer" title="Paramètres">
              <FaCog size={12} />
            </div>
            <div className="flex items-center gap-1 p-1 px-2 hover:bg-gray-700 cursor-pointer" title="Déconnexion">
              <FaPowerOff size={12} />
            </div>
          </div>
        </div>

        <div className="flex-1 p-2 overflow-y-auto w-1/3 backdrop-blur-md">
          <h2 className="font-bold mb-4">Applications</h2>
          <div className="grid grid-cols-1 gap-2">
            {pinnedApps.map((app) => (
              <div key={app.id} className="flex items-center gap-2 p-2 cursor-pointer">
                {app.icon} <span>{app.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-2 backdrop-blur-md w-1/2">
          <h2 className="font-bold mb-4">Productivité</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-2 highlight backdrop-blur-md rounded-lg shadow-sm hover:shadow-white shadow-black flex justify-center items-center">
              <FaCalendarAlt size={15} />
            </div>
            <div className="p-2 highlight backdrop-blur-md rounded-lg shadow-sm hover:shadow-white shadow-black flex justify-center items-center">
              <FaStickyNote size={15} />
            </div>
            <div className="p-2 highlight backdrop-blur-md rounded-lg shadow-sm hover:shadow-white shadow-black flex justify-center items-center">
              <FaTasks size={15} />
            </div>
            <div className="p-2 highlight backdrop-blur-md rounded-lg shadow-sm hover:shadow-white shadow-black flex justify-center items-center">
              <FaEnvelope size={15} />
            </div>
            {/* Autres éléments de productivité */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;
