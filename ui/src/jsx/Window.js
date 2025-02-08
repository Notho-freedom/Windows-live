import React, { useState, useEffect, useRef, useContext } from 'react';
import { FaWindowRestore, FaWindowMaximize, FaWindowMinimize, FaWindowClose } from 'react-icons/fa';
import { AppContext } from '../AppProvider';

const Window = ({ children, title, onClose, item }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x: 10, y: 10 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 50, height: 50 });

  const windowRef = useRef(null);
  const contentRef = useRef(null);

  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const {togglePinItem} = useContext(AppContext);

  const handleMouseDown = (e) => {
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    
    setIsDragging(true);
    setMousePosition({ x: clientX, y: clientY });
  };

  const handleMouseMove = (e) => {
    const isTouchEvent = e.type.startsWith('touch');
    const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;
  
    if (isDragging) {
      const deltaX = clientX - mousePosition.x;
      const deltaY = clientY - mousePosition.y;
  
      setWindowPosition((prevPosition) => ({
        x: prevPosition.x + deltaX,
        y: prevPosition.y + deltaY,
      }));
      setMousePosition({ x: clientX, y: clientY });
    } else if (isResizing) {
      const deltaX = clientX - mousePosition.x;
      const deltaY = clientY - mousePosition.y;
  
      if (resizeDirection === 'right') {
        setWindowSize((prevSize) => ({
          ...prevSize,
          width: Math.max(prevSize.width + (deltaX / window.innerWidth) * 100, 20),
        }));
      } else if (resizeDirection === 'bottom') {
        setWindowSize((prevSize) => ({
          ...prevSize,
          height: Math.max(prevSize.height + (deltaY / window.innerHeight) * 100, 20),
        }));
      } else if (resizeDirection === 'bottom-right') {
        setWindowSize((prevSize) => ({
          width: Math.max(prevSize.width + (deltaX / window.innerWidth) * 100, 20),
          height: Math.max(prevSize.height + (deltaY / window.innerHeight) * 100, 20),
        }));
      }
  
      setMousePosition({ x: clientX, y: clientY });
    }
  };
  

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeMouseDown = (e, direction) => {
    e.preventDefault();
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
  
    setIsResizing(true);
    setResizeDirection(direction);
    setMousePosition({ x: clientX, y: clientY });
  };
  

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleMinimize = () => {
    setIsMaximized(false);
    togglePinItem(item);
  };

  useEffect(() => {
    const handleTouchMove = (e) => handleMouseMove(e);
    const handleTouchEnd = () => handleMouseUp();
  
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
  
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, isResizing, mousePosition]);
  

  return (
    <div
      ref={windowRef}
      className="fixed z-50"
      style={{
        left: isMaximized ? 0 : `${windowPosition.x}px`,
        top: isMaximized ? 0 : `${windowPosition.y}px`,
        width: isMaximized ? '100vw' : `${windowSize.width}%`,
        height: isMaximized ? '100vh' : `${windowSize.height}%`,
        backgroundColor: 'white',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
        touchAction: 'none',
        userSelect: 'none',
        cursor: isResizing ? 'se-resize' : 'auto',
        overflow: 'hidden',
      }}
      //onWheel={(e) => e.preventDefault()} // Empêche les défilements à la molette
      //onTouchMove={(e) => e.preventDefault()} // Empêche les défilements tactiles
    >
      <div
        className="flex justify-between items-center bg-gray-900 cursor-pointer"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <span className="truncate text-ellipsis px-1">{title}</span>
        <div className="flex gap-1">
          <button
            onClick={handleMinimize}
            className="bg-transparent border-none cursor-pointer py-3 px-3 hover:bg-gray-800"
            title="Minimiser"
          >
            <FaWindowMinimize size={10} />
          </button>
          <button
            onClick={handleMaximize}
            className="bg-transparent border-none cursor-pointer py-3 px-3 hover:bg-gray-800"
            title={isMaximized ? 'Restaurer' : 'Maximiser'}
          >
            {isMaximized ? <FaWindowRestore size={10} /> : <FaWindowMaximize size={10} />}
          </button>
          <button
            onClick={onClose}
            className="bg-transparent border-none cursor-pointer py-3 px-3 hover:bg-red-500 transition"
            title="Fermer"
          >
            <FaWindowClose size={10} />
          </button>
        </div>
      </div>
      <div
        ref={contentRef}
        style={{
          maxHeight: 'calc(100% - 40px)',
          overflow: 'hidden', // Empêche tout défilement sur le contenu
        }}
        //onWheel={(e) => e.preventDefault()} // Bloque les événements de défilement dans le contenu
        //onTouchMove={(e) => e.preventDefault()} // Bloque les événements tactiles dans le contenu
        className=' bg-gray-900'
      >
        {children}
      </div>
      <div
    className="absolute bottom-0 right-0 w-full h-4 bg-gray-900 cursor-se-resize"
    onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
    onTouchStart={(e) => handleResizeMouseDown(e, 'bottom-right')}>

  </div>
    </div>
  );
  
};

export default Window;
