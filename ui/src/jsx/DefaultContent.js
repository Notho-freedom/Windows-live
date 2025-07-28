import React, { useContext, useState } from 'react';
import Drive from './Drive';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { GetIcon } from './IconManager';
import { AppContext } from '../AppProvider';

const DefaultContent = () => {
  const { drives, handleDoubleClick, iconSize, isSidebarOpen, defaultFolders } = useContext(AppContext);
  const [isFoldersOpen, setIsFoldersOpen] = useState(true);
  const [isDrivesOpen, setIsDrivesOpen] = useState(true);

  const toggleFolders = () => setIsFoldersOpen(!isFoldersOpen);
  const toggleDrives = () => setIsDrivesOpen(!isDrivesOpen);

  return (
    <div className="bg-white content overflow-auto h-full w-full p-6">
      <div className="mb-8">
        <h3 className="text-lg font-semibold cursor-pointer flex flex-row items-center gap-2 p-2 mb-4 hover:bg-gray-100 rounded-md transition-colors" onClick={toggleFolders}>
          {isFoldersOpen ? <FaChevronDown className='text-gray-500' /> : <FaChevronRight className='text-gray-500' />} 
          Dossiers ({defaultFolders.length})
        </h3>
        {isFoldersOpen && (
          <div className={`w-full grid ${isSidebarOpen? 'grid-cols-1':'grid-cols-2'} md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 ml-4`}>
            {defaultFolders.map((folder, index) => (
              <div
                key={index}
                className='hover:bg-blue-50 p-3 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-200'
                onDoubleClick={() => handleDoubleClick(folder)}
              >
                <div className="flex flex-col items-center gap-2">
                  <GetIcon item={folder} size={iconSize + 1} />
                  <span className="text-sm text-gray-700 text-center truncate w-full" title={folder.name}>
                    {folder.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold cursor-pointer flex flex-row items-center gap-2 p-2 mb-4 hover:bg-gray-100 rounded-md transition-colors" onClick={toggleDrives}>
          {isDrivesOpen ? <FaChevronDown className='text-gray-500' /> : <FaChevronRight className='text-gray-500' />} 
          Périphériques et lecteurs ({drives.length})
        </h3>
        {isDrivesOpen && (
          <div className={`grid ${isSidebarOpen? 'grid-cols-1':'grid-cols-2'} md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 ml-4`}>
            {drives.map((drive, index) => (
              <div 
                key={index} 
                className='hover:bg-blue-50 p-3 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-200'
                onDoubleClick={() => handleDoubleClick(drive)}
              >
                <Drive
                  name={drive.name}
                  freeSpace={drive.freeSpace}
                  totalSpace={drive.totalSpace}
                  barColor={drive.barColor}
                  barWidth={drive.barWidth}
                  path={drive.path}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DefaultContent;
