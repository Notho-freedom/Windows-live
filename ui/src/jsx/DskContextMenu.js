import React, { useState } from 'react';

const DskContextMenu = ({ x, y, options, onClose }) => {
  const [hoveredSubmenu, setHoveredSubmenu] = useState(null);

  const handleMouseLeave = () => {
    setHoveredSubmenu(null);
    onClose();
  };

  const handleOptionClick = (option) => {
    if (option.action) {
      option.action();
    } else if (option.onClick) {
      option.onClick();
    }
    onClose();
  };

  return (
    <div
      className="context-menu absolute z-50"
      style={{ 
        top: y, 
        left: x,
        minWidth: '200px',
        maxWidth: '300px'
      }}
      onMouseLeave={handleMouseLeave}
    >
      <div className="py-1">
        {options.map((option, index) => (
          <div key={index} className="relative">
            {option.label === 'separator' ? (
              <div className="context-menu-separator my-1"></div>
            ) : (
              <div
                className="context-menu-item group relative"
                onMouseEnter={() => option.subOptions && setHoveredSubmenu(index)}
                onClick={() => !option.subOptions && handleOptionClick(option)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 flex items-center justify-center text-white/70 group-hover:text-white">
                      {option.icon}
                    </div>
                    <span className="text-sm">{option.label}</span>
                  </div>
                  {option.subOptions && (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Sous-menu */}
                {option.subOptions && hoveredSubmenu === index && (
                  <div
                    className="context-menu absolute left-full top-0 ml-1"
                    style={{ minWidth: '180px' }}
                  >
                    <div className="py-1">
                      {option.subOptions.map((subOption, subIndex) => (
                        <div key={subIndex}>
                          {subOption.label === 'separator' ? (
                            <div className="context-menu-separator my-1"></div>
                          ) : (
                            <div
                              className="context-menu-item group"
                              onClick={() => subOption.onClick && subOption.onClick()}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 flex items-center justify-center text-white/70 group-hover:text-white">
                                  {subOption.icon}
                                </div>
                                <span className="text-sm">{subOption.label}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DskContextMenu;
