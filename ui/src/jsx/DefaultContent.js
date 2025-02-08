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
    <div className="bg-transparent content overflow-auto h-full w-full justify-between gap-4 p-2">
      <div className="mb-4">
        <h3 className="text-md font-semibold cursor-pointer flex flex-row items-center gap-2 p-1 mb-1 hover:bg-neutral-600" onClick={toggleFolders}>
          {isFoldersOpen ? <FaChevronDown className='text-neutral-400' /> : <FaChevronRight className='text-neutral-400' />} Dossiers ({defaultFolders.length}) <span className="border-b border-neutral-800 flex-grow"></span>
        </h3>
        {isFoldersOpen && (
          <div className={`w-full grid ${isSidebarOpen? 'grid-cols-1':'grid-cols-2'} md:grid-cols-3 lg:grid-cols-4 gap-2 ml-3.5`}>
            {defaultFolders.map((folder, index) => (
              <div
                key={index}
                className='hover:bg-neutral-600 p-1 pl-3.5 py-1.5'
                onDoubleClick={() => handleDoubleClick(folder)}
              >

              <div className="folder flex items-center gap-2 cursor-pointer">
                  <GetIcon item={folder} size={iconSize+0.5} />
                  <span className="truncate">
                      {folder.name}
                  </span>
                </div>


              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-md font-semibold cursor-pointer flex flex-row items-center gap-2 p-1 mb-1 hover:bg-neutral-600" onClick={toggleDrives}>
          {isDrivesOpen ? <FaChevronDown className='text-neutral-400' /> : <FaChevronRight className='text-neutral-400' />} Périphériques et lecteurs ({drives.length})<span className="border-b border-neutral-800 flex-grow"></span>
        </h3>
        {isDrivesOpen && (
          <div className={`grid ${isSidebarOpen? 'grid-cols-1':'grid-cols-2'} md:grid-cols-3 lg:grid-cols-4 gap-2 ml-3.5`}>
            {drives.map((drive, index) => (
              <div 
                key={index} 
                className='hover:bg-neutral-600 p-1 pl-3.5 py-1.5'
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
