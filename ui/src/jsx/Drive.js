import React, { useContext } from 'react';
import { GetIcon } from './IconManager';
import { AppContext } from '../AppProvider';

const Drive = ({ name, freeSpace, totalSpace, barColor, barWidth }) => {

const {iconSize} = useContext(AppContext);
  let item;
  if (freeSpace.includes('Inaccessible')) {
    item={type: 'driveCD'};
  } else if (name.toLowerCase().includes('c:\\')) {
    item = {type: 'winDrive'};
  } else {
    item = {type: 'drive'};
  }

  return (
    <div className="drive flex items-center gap-2">
      <div className="icon-column flex-shrink-0">
        <GetIcon item={item} size={iconSize+0.5} />
      </div>
      <div className="info-column flex-grow">
        <span>{name}</span>
        {!freeSpace.includes('Inaccessible') && (
          <>
            <div className="drive-bar bg-white border h-3.5 mt-1 w-6/7">
              <div className={`drive-bar-inner ${barColor} h-full`} style={{ width: barWidth }}></div>
            </div>
            <span className='text-[90%]'>{freeSpace} libres sur {totalSpace}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default Drive;
