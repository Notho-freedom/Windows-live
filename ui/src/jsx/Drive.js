import React, { useContext } from 'react';
import { GetIcon } from './IconManager';
import { AppContext } from '../AppProvider';

const Drive = ({ name, freeSpace, totalSpace, barColor, barWidth }) => {
  const { iconSize } = useContext(AppContext);
  
  let item;
  if (freeSpace.includes('Inaccessible')) {
    item = { type: 'driveCD' };
  } else if (name.toLowerCase().includes('c:\\')) {
    item = { type: 'winDrive' };
  } else {
    item = { type: 'drive' };
  }

  return (
    <div className="drive flex flex-col items-center gap-3 p-4">
      <div className="icon-column flex-shrink-0">
        <GetIcon item={item} size={iconSize + 1} />
      </div>
      <div className="info-column flex-grow text-center">
        <span className="text-sm font-medium text-gray-700 truncate block" title={name}>
          {name}
        </span>
        {!freeSpace.includes('Inaccessible') && (
          <>
            <div className="drive-bar bg-gray-200 border border-gray-300 rounded-full h-2 mt-2 w-full overflow-hidden">
              <div 
                className={`drive-bar-inner h-full rounded-full transition-all duration-300 ${barColor}`} 
                style={{ width: barWidth }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">
              {freeSpace} libres sur {totalSpace}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default Drive;
