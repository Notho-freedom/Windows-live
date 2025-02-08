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
        className="flex items-center w-full text-left cursor-pointer hover:text-blue-400"
        onClick={toggleFn}
        aria-expanded={isOpen}
      >
        {isOpen ? <FaChevronDown /> : <FaChevronRight />}
        <span className="flex items-center p-1 gap-2 truncate">
          <GetIcon item={{ type: icon }} size={iconSize -0.75} /> {title}
        </span>
      </button>
      {isOpen && (
        <ul className="ml-4">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center p-1 gap-2 py-1.5 md:py-2.5 lg:py-3.5 cursor-pointer hover:bg-neutral-700 rounded truncate"
              onClick={() => handleDoubleClick(item)}
            >
              <GetIcon item={item} size={iconSize - 1} /> {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  

  return (
    <div className="sidebar bg-neutral-900 h-full w-full overflow-y-auto p-2 pt-1 gap-4 truncate">
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
