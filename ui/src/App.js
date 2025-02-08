import React, { useContext, useEffect } from 'react';
import { AppContext } from './AppProvider';
import Desktop from './jsx/Desktop';
import Taskbar from './jsx/Taskbar';
import LockScreen from './jsx/LockScreen';
import WelcomeScreen from './jsx/WelcomeScreen';

const App = () => {
  const {
    isLocked,
    user,
    loading,
    Starting,
    errorc,
    setStarting,
  } = useContext(AppContext);

useEffect(() => {
  document.addEventListener('DOMContentLoaded',setStarting(false));
}, [setStarting]);


  if (Starting) {
    return <WelcomeScreen />;
  }

  if (errorc) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-500">
        {errorc}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden text-xs text-white">
      {isLocked ? (
        <LockScreen />
      ) : loading ? (
        <WelcomeScreen User={user} />
      ) : (
        <div className="h-full flex flex-col">
        <div className="flex-grow">
          <Desktop />
        </div>

        <div className="flex-shrink-0">
          <Taskbar />
        </div>
      </div>

      )}
    </div>
  );
};

export default App;
