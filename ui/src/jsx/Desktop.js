import React, { useContext, useRef, useCallback } from "react";
import { AppContext } from "../AppProvider";
import { GetIcon } from "./IconManager";
import DskContextMenu from "./DskContextMenu";
import StartMenu from "./StartMenu";
import Window from "./Window";
import Explorer from "./Explorer";
import FileViewer from "./FileViewer";

const Desktop = () => {
  const {
    closeWindow,backgroundImage,
    contextMenu,gridConfig,
    sortedItems,editingItem,
    newName,inputRef,
    style,setNewName,openWindows,
    setSortedItems,handleEditName,
    handleDoubleClick,selectedItems,
    focusedItem,handleRightClick,
    handleCloseContextMenu,selectionBox,
    setSelectionBox,handleSelectionBox,
    allItems,setEditingItem,
    iconSize,
  } = useContext(AppContext);

  const desktopRef = useRef(null);

  const handleMouseDown = useCallback((event) => {
    if (event.target !== desktopRef.current) return;
    desktopRef.current.classList.add("selection-active");
    setSelectionBox({
      x1: event.clientX,
      y1: event.clientY,
      x2: event.clientX,
      y2: event.clientY,
    });
  }, [setSelectionBox]);

  const handleMouseMove = useCallback((event) => {
    if (!selectionBox) return;
    setSelectionBox((prevBox) => ({
      ...prevBox,
      x2: event.clientX,
      y2: event.clientY,
    }));
  }, [selectionBox, setSelectionBox]);

  const handleMouseUp = useCallback(() => {
    if (selectionBox) {
      handleSelectionBox(selectionBox);
      setSelectionBox(null);
      desktopRef.current.classList.remove("selection-active");
    }
  }, [selectionBox, setSelectionBox, handleSelectionBox]);

  const getSelectionBoxStyle = () => {
    if (!selectionBox) return { display: "none" };

    const { x1, y1, x2, y2 } = selectionBox;
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    return {
      left,
      top,
      width,
      height,
    };
  };

  const columns = Array.from({ length: gridConfig.columns }, (_, colIndex) =>
    sortedItems.slice(
      colIndex * gridConfig.itemsPerColumn,
      (colIndex + 1) * gridConfig.itemsPerColumn
    )
  );

  return (
    <div
      ref={desktopRef}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className={`w-full h-full bg-cover bg-center relative overflow-hidden no-select transition-opacity}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(event) => handleRightClick(event, null)}
    >
      {/* Selection Box */}
      {selectionBox && (
        <div className="selection-box" style={getSelectionBoxStyle()} />
      )}
  
      {/* Desktop Icons */}
      <div className="absolute inset-0 p-6">
        <div className="grid grid-cols-1 gap-4 h-full">
          {columns.map((columnItems, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-2">
              {columnItems.map((item, index) => (
                <div
                  key={index}
                  id={item.last_modified}
                  className={`
                    flex flex-col items-center justify-center text-center cursor-pointer p-3 rounded-lg
                    transition-all duration-200 hover:bg-white/10 hover:backdrop-blur-sm
                    ${selectedItems.includes(item) ? "bg-blue-500/30 border border-blue-400/50 backdrop-blur-sm" : ""} 
                    ${focusedItem === item ? "ring-2 ring-blue-400/50" : ""}
                    ${item.is_hidden ? "opacity-50" : "opacity-100"}
                  `}
                  style={{
                    minHeight: `${gridConfig.itemHeight}px`,
                    minWidth: `${gridConfig.itemWidth}px`,
                  }}
                  title={item.name}
                  onDoubleClick={() => handleDoubleClick(item)}
                  onContextMenu={(event) => handleRightClick(event, item)}
                >
                  <div className="mb-2">
                    <GetIcon item={item} size={iconSize} />
                  </div>
                  
                  {editingItem === item ? (
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onBlur={() => {
                        if (newName !== editingItem.name) {
                          const updatedItems = allItems.map((item) =>
                            item === editingItem ? { ...item, name: newName } : item
                          );
                          setSortedItems(updatedItems);
                        }
                        setEditingItem(null);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          if (newName !== editingItem.name) {
                            const updatedItems = allItems.map((item) =>
                              item === editingItem ? { ...item, name: newName } : item
                            );
                            setSortedItems(updatedItems);
                          }
                          setEditingItem(null);
                        }
                      }}
                      autoFocus
                      className="w-full text-xs text-center bg-white/90 text-gray-800 border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ) : (
                    <span
                      className="text-white text-xs font-medium truncate max-w-full text-shadow-sm"
                      style={{ 
                        maxWidth: gridConfig.itemWidth - 16,
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
                      }}
                      onClick={() => handleEditName(item)}
                    >
                      {item.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
  
      {/* Open Windows */}
      {openWindows.map((win) => (
        <Window key={win.id} title={win.title} onClose={() => closeWindow(win.id)} item={win.item}>
          {win.type === "file" ? (
            <FileViewer filePath={win.path} onClose={() => closeWindow(win.id)} />
          ) : (
            <Explorer />
          )}
        </Window>
      ))}
  
      {/* Context Menu */}
      {contextMenu && (
        <DskContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={contextMenu.options}
          onClose={() => handleCloseContextMenu()}
        />
      )}
  
      {/* Start Menu */}
      <StartMenu />
    </div>
  );
  
};

export default Desktop;
