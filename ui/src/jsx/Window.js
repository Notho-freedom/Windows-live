import React, { useState, useRef, useEffect } from 'react';
import { FaWindowMinimize, FaWindowMaximize, FaWindowRestore, FaTimes } from 'react-icons/fa';

const Window = ({ children, title, onClose, item }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x: 50, y: 50 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);

  const windowRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - mousePosition.x;
        const deltaY = e.clientY - mousePosition.y;

        setWindowPosition((prevPosition) => ({
          x: Math.max(0, Math.min(window.innerWidth - windowSize.width, prevPosition.x + deltaX)),
          y: Math.max(0, Math.min(window.innerHeight - windowSize.height, prevPosition.y + deltaY)),
        }));
        setMousePosition({ x: e.clientX, y: e.clientY });
      }

      if (isResizing) {
        const deltaX = e.clientX - mousePosition.x;
        const deltaY = e.clientY - mousePosition.y;

        if (resizeDirection === 'right') {
          setWindowSize((prevSize) => ({
            ...prevSize,
            width: Math.max(400, Math.min(window.innerWidth - windowPosition.x, prevSize.width + deltaX)),
          }));
        } else if (resizeDirection === 'bottom') {
          setWindowSize((prevSize) => ({
            ...prevSize,
            height: Math.max(300, Math.min(window.innerHeight - windowPosition.y, prevSize.height + deltaY)),
          }));
        } else if (resizeDirection === 'bottom-right') {
          setWindowSize((prevSize) => ({
            width: Math.max(400, Math.min(window.innerWidth - windowPosition.x, prevSize.width + deltaX)),
            height: Math.max(300, Math.min(window.innerHeight - windowPosition.y, prevSize.height + deltaY)),
          }));
        }
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, mousePosition, windowSize, windowPosition, resizeDirection]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.window-controls')) return;
    setIsDragging(true);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleResizeMouseDown = (e, direction) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMinimize = () => {
    // Logique pour minimiser la fenêtre
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      setWindowSize({ width: 800, height: 600 });
      setWindowPosition({ x: 50, y: 50 });
    } else {
      setIsMaximized(true);
      setWindowPosition({ x: 0, y: 0 });
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
  };

  return (
    <div
      ref={windowRef}
      className="window fixed z-50"
      style={{
        left: isMaximized ? 0 : `${windowPosition.x}px`,
        top: isMaximized ? 0 : `${windowPosition.y}px`,
        width: isMaximized ? '100vw' : `${windowSize.width}px`,
        height: isMaximized ? '100vh' : `${windowSize.height}px`,
        touchAction: 'none',
        userSelect: 'none',
        cursor: isResizing ? 'se-resize' : 'auto',
        overflow: 'hidden',
      }}
    >
      {/* Barre de titre */}
      <div
        className="window-header flex justify-between items-center cursor-move"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 truncate">{title}</span>
        </div>
        
        <div className="window-controls flex items-center">
          <button
            onClick={handleMinimize}
            className="window-control minimize flex items-center justify-center w-12 h-8 hover:bg-gray-200 transition-colors duration-200"
            title="Minimiser"
          >
            <FaWindowMinimize size={10} className="text-gray-600" />
          </button>
          <button
            onClick={handleMaximize}
            className="window-control maximize flex items-center justify-center w-12 h-8 hover:bg-gray-200 transition-colors duration-200"
            title={isMaximized ? 'Restaurer' : 'Maximiser'}
          >
            {isMaximized ? (
              <FaWindowRestore size={10} className="text-gray-600" />
            ) : (
              <FaWindowMaximize size={10} className="text-gray-600" />
            )}
          </button>
          <button
            onClick={onClose}
            className="window-control close flex items-center justify-center w-12 h-8 hover:bg-red-500 hover:text-white transition-colors duration-200"
            title="Fermer"
          >
            <FaTimes size={10} />
          </button>
        </div>
      </div>

      {/* Contenu de la fenêtre */}
      <div
        ref={contentRef}
        className="flex-1 overflow-hidden bg-white"
        style={{
          height: 'calc(100% - 32px)',
        }}
      >
        {children}
      </div>

      {/* Poignée de redimensionnement */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-end justify-end"
          onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
          onTouchStart={(e) => handleResizeMouseDown(e, 'bottom-right')}
        >
          <div className="w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-gray-400 mb-1 mr-1"></div>
        </div>
      )}
    </div>
  );
};

export default Window;
