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
    <div className="flex flex-col h-screen bg-neutral-900">
      <Header/>
  
      <div className="flex flex-grow relative overflow-hidden">
        <div
          className={`transition-all flex-shrink-0 bg-neutral-900 h-full max-h-screen ${
            isSidebarOpen ? 'w-[45%] md:w-[23%] lg:w-[20%]' : 'w-0'
          } overflow-y-auto z-20`}
        >
          <Sidebar/>
        </div>
  
        <div
          className={`flex-grow transition-all ${
            isSidebarOpen ? 'w-[55%] md:w-2/3 lg:w-[85%]' : 'w-full'
          } bg-neutral-800 z-10 overflow-y-auto`}
        >
          {currentPath === '' ? (
            <DefaultContent />
          ) : (
            <Content />
          )}
        </div>
      </div>
    </div>
  );
  
};

export default Explorer;
