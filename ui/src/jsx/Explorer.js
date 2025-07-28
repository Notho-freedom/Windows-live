import React, { useContext} from 'react';
import { AppContext } from '../AppProvider';
import Content from './Content';
import DefaultContent from './DefaultContent';
import Sidebar from './Sidebar';
import Header from './Header';

const Explorer = () => {
  const {
    currentPath,
    isSidebarOpen,

  } = useContext(AppContext);


  return (
    <div className="flex flex-col h-full bg-white">
      <Header/>

      <div className="flex flex-grow relative overflow-hidden">
        {/* Barre latérale */}
        <div
          className={`transition-all duration-300 flex-shrink-0 bg-gray-50 border-r border-gray-200 h-full ${
            isSidebarOpen ? 'w-64' : 'w-0'
          } overflow-y-auto z-20`}
        >
          <Sidebar/>
        </div>

        {/* Contenu principal */}
        <div
          className={`flex-grow transition-all duration-300 ${
            isSidebarOpen ? 'ml-0' : 'ml-0'
          } bg-white overflow-y-auto`}
        >
          {currentPath === '' ? (
            <DefaultContent/>
          ) : (
            <Content/>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default Explorer;
