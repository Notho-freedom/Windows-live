import React, { useState, useContext } from 'react';
import { FaChevronDown, FaChevronRight, FaStarHalfAlt } from 'react-icons/fa';
import { AppContext } from '../AppProvider';
import { GetIcon } from './IconManager';

const Sidebar = () => {
  const { drives, handleDoubleClick, isSidebarOpen, defaultFolders, networkItems, iconSize } = useContext(AppContext);
  const [openSections, setOpenSections] = useState({
    quickAccess: true,
    thisPC: true,
    network: true,
  });

  const toggleSection = (section) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  if (!isSidebarOpen) return null;

  const renderSection = (title, items, isOpen, toggleFn, icon) => (
    <div className="mb-4">
      <button
        className="flex items-center w-full text-left cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors"
        onClick={toggleFn}
        aria-expanded={isOpen}
      >
        {isOpen ? <FaChevronDown className="text-gray-500" /> : <FaChevronRight className="text-gray-500" />}
        <span className="flex items-center gap-2 truncate text-gray-700 font-medium">
          <GetIcon item={{ type: icon }} size={iconSize - 0.75} /> 
          {title}
        </span>
      </button>
      {isOpen && (
        <ul className="ml-4 mt-2 space-y-1">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-2 p-2 cursor-pointer hover:bg-blue-50 rounded-md transition-colors text-gray-600 hover:text-gray-800"
              onClick={() => handleDoubleClick(item)}
            >
              <GetIcon item={item} size={iconSize - 1} /> 
              <span className="truncate text-sm">{item.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  

  return (
    <div className="sidebar bg-gray-50 h-full w-full overflow-y-auto p-4 border-r border-gray-200">
      {renderSection(
        'Accès rapide',
        defaultFolders,
        openSections.quickAccess,
        () => toggleSection('quickAccess'),
        'favourites'
      )}
      {renderSection(
        'Ce PC',
        drives.map((drive) => ({
          name: drive.name,
          path: drive.path,
          type: 
            drive.totalSpace === ''
              ? 'driveCD'
              : drive.name.toLowerCase().includes('c:\\')
              ? 'winDrive'
              : 'drive'
          ,
        })),
        openSections.thisPC,
        () => toggleSection('thisPC'),
        'cepc'
      )}
      {renderSection(
        'Réseaux',
        networkItems,
        openSections.network,
        () => toggleSection('network'),
        'router2',
        
      )}
    </div>
  );
};

export default Sidebar;
