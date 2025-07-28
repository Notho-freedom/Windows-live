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
    handleBack, 
    handleForward, 
    contentLoading, 
    currentPath, 
    setCurrentPath, 
    history, 
    setSidebarOpen, 
    isSidebarOpen,
    setShowSearchDropdown,
    showSearchDropdown,
    searchHistory,
    setShowPathDropdown,
    showPathDropdown,
    setSearchQuery,
  } = useContext(AppContext);

  // Fonction pour gérer la soumission du chemin
  const handlePathSubmit = () => {
    if (inputPath && inputPath !== currentPath) {
      setCurrentPath(inputPath);
    }
  };

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <Tabs/>
      <div className="p-4">
        {/* Barre d'outils */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              title={isSidebarOpen ? "Masquer le volet de navigation" : "Afficher le volet de navigation"}
            >
              {isSidebarOpen ? <FaChevronLeft size={14} /> : <FaChevronRight size={14} />}
            </button>
            <button 
              onClick={handleBack}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              title="Précédent"
            >
              <FaArrowLeft size={14} />
            </button>
            <button 
              onClick={handleForward}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              title="Suivant"
            >
              <FaArrowRight size={14} />
            </button>
            <button 
              className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              title="Niveau supérieur"
            >
              <FaArrowUp size={14} />
            </button>
            <button 
              onClick={() => setCurrentPath('')}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              title="Accueil"
            >
              <FaHome size={14} />
            </button>
            <button 
              onClick={() => setCurrentPath(currentPath)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              title="Actualiser"
            >
              <FaSyncAlt size={14} />
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="relative flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                onBlur={() => {
                  setTimeout(() => {
                    setShowSearchDropdown(false);
                  }, 200);
                }}
                placeholder="Rechercher..."
                className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FaSearch size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            {showSearchDropdown && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-auto z-20">
                {searchHistory.map((query, index) => (
                  <div
                    key={index}
                    onMouseDown={() => handleSearchDropdownClick(query)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {query}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Barre d'adresse */}
        <div className="flex items-center w-full gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={currentPath}
              onChange={(e) => setInputPath(e.target.value)}
              onFocus={() => setShowPathDropdown(true)}
              onBlur={
                () => {
                  setTimeout(() => {
                    setShowPathDropdown(false);
                  }, 200);
                }
              }
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handlePathSubmit();
                }
              }}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ 
                background: contentLoading ? 'linear-gradient(90deg, #e5f3ff 50%, #f0f9ff 50%)' : '#f9fafb',
                backgroundSize: '20px 100%',
                animation: contentLoading ? 'loading 1s infinite' : 'none'
              }}
            />
            {showPathDropdown && history.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-auto z-20">
                {history.map((path, index) => (
                  <div
                    key={index}
                    onMouseDown={() => handlePathDropdownClick(path)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {path}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

