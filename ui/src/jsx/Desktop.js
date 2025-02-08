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
      <div className="absolute flex overflow-hidden left-1 top-1" style={{ justifyContent: "start" }}>
        {columns.map((columnItems, colIndex) => (
          <div key={colIndex} className="flex flex-col">
            {columnItems.map((item, index) => (
              <div
                key={index}
                id={item.last_modified}
                className={`
                  flex flex-col items-center justify-center text-center cursor-pointer m-1 
                  ${style} hover:bg-blue-300 hover:bg-opacity-40 hover:border hover:border-zinc-400 
                  ${selectedItems.includes(item) ? "bg-blue-300 bg-opacity-40 border border-zinc-400" : ""} 
                  ${focusedItem === item ? "border border-blue-500" : ""}
                `}
                style={{
                  width: `${gridConfig.itemWidth}px`,
                  height: `${gridConfig.itemHeight}px`,
                  opacity: `${item.is_hidden ? "0.5" : "1"}`,
                }}
                title={item.name}
                onDoubleClick={() => handleDoubleClick(item)}
                onContextMenu={(event) => handleRightClick(event, item)}
              >
                <GetIcon item={item} size={iconSize-1} />
                {editingItem === item ? (
                  <input
                    type="text"
                    value={newName}
                    ref={inputRef}
                    onChange={(event) => setNewName(event.target.value)}
                    onBlur={() => {
                      if (newName !== editingItem.name) {
                        const updatedItems = allItems.map((item) =>
                          item === editingItem ? { ...item, name: newName } : item
                        );
                        setSortedItems(updatedItems);
                      }
                      setEditingItem(null);
                    }}
                    autoFocus
                    className="w-full mt-1 text-xs text-center bg-white border border-gray-400 outline-none will-change-contents"
                  />
                ) : (
                  <span
                    className="text-white truncate"
                    style={{ maxWidth: gridConfig.itemWidth }}
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
