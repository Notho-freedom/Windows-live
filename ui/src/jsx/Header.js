import React, { useContext } from 'react';
import { FaArrowLeft, FaArrowRight, FaArrowUp, FaChevronLeft, FaChevronRight, FaHome, FaSearch, FaSyncAlt } from 'react-icons/fa';
import Tabs from './Tabs';
import { AppContext } from '../AppProvider';

const Header = () => {
const {
      setSearchInput,
      setSearchHistory,
      handleSearchDropdownClick,
      setInputPath,
      inputPath,
      handlePathDropdownClick,
      searchInput,
      handleBack, handleForward, 
      contentLoading, currentPath, 
      setCurrentPath, history, 
      setSidebarOpen, isSidebarOpen,
      setShowSearchDropdown,
      showSearchDropdown,
      searchHistory,
      setShowPathDropdown,
      showPathDropdown,
      setSearchQuery,
  } = useContext(AppContext);


  return (
    <div className="w-full">
      <Tabs/>
      <div className="header p-1 flex flex-col relative z-10 border-t-1 border-gray-700 w-full bg-neutral-900">
        <div className="flex items-center justify-between mb-2 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
            </button>
            <button onClick={handleBack}><FaArrowLeft /></button>
            <button onClick={handleForward}><FaArrowRight /></button>
            <button><FaArrowUp /></button>
            <button onClick={() => setCurrentPath('')}><FaHome /></button>
            <button onClick={() => setCurrentPath(currentPath)}><FaSyncAlt /></button>
          </div>

          <div className="relative flex items-center gap-2 w-full">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={
                () => {
                  if (searchInput) {
                    setSearchHistory([...new Set([searchInput, ...searchHistory])]);
                  }
                  setShowSearchDropdown(false);
                }                
              }
              placeholder="Rechercher..."
              className="bg-transparent border-none outline-none p-1 w-full"
            />
            <FaSearch size={16} className="text-gray-400" />
            {showSearchDropdown && (
              <ul
                style={{ top: '100%' }}
                className="absolute left-0 right-0 bg-neutral-900 border border-gray-400 max-h-40 overflow-auto z-20"
              >
                {searchHistory.map((query, index) => (
                  <li
                    key={index}
                    onMouseDown={() => handleSearchDropdownClick(query)}
                    className="p-1 hover:bg-blue-500 cursor-pointer"
                  >
                    {query}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="relative flex items-center w-full gap-2">

          <div className="relative flex-grow">
            <input
              type="text"
              value={currentPath}
              onChange={(e) =>setInputPath(e.target.value)}
              onFocus={() => setShowPathDropdown(true)}
              onBlur={
                () => {
                  setCurrentPath(inputPath);
                  setShowPathDropdown(false);
                }
              }
              className="bg-transparent border-none outline-none p-1 w-full"
              style={{ background: contentLoading ? 'linear-gradient(to right, #3490CEFF 50%, #3490CEFF 50%)' : 'none' }}
            />
            {showPathDropdown && (
              <ul className="sticky left-0 right-0 bg-neutral-900 mt-1 max-h-40 overflow-auto z-100">
                {history.map((path, index) => (
                  <li
                    key={index}
                    onMouseDown={() => handlePathDropdownClick(path)}
                    className="p-1 hover:bg-blue-400 cursor-pointer"
                  >
                    {path}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
