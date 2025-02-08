import React from 'react';

const DskContextMenu = ({ x, y, options, onClose }) => {
  return (
    <div
      className="absolute bg-gray-900 border-1 z-1000 shadow-lg shadow-black text-white"
      style={{ top: y, left: x, fontSize: "70%",width:'auto',maxWidth:'40%'}}
      onMouseLeave={onClose}
    >
      <ul className="list-none p-2 m-0">
        {options.map((option, index) => (
          <li key={index} className="relative group p-2 cursor-pointer hover:bg-gray-800 flex items-center gap-2">
            {option.icon}
            <span>{option.label}</span>
            {option.subOptions && (
              <ul className="list-none p-2 m-0 bg-gray-900 absolute shadow-lg shadow-black left-full top-0 truncate hidden group-hover:block"
              style={{width:'auto',minWidth:'110%'}}
              >
                {option.subOptions.map((subOption, subIndex) => (
                  <li key={subIndex} onClick={subOption.onClick} className="p-2 cursor-pointer hover:bg-gray-800 flex items-center gap-2">
                    {subOption.icon}
                    <span>{subOption.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DskContextMenu;
