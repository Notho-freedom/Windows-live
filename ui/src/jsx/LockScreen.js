import React, { useContext, useState } from 'react';
import { FaArrowRight, FaChevronDown, FaPowerOff, FaSyncAlt, FaWifi } from 'react-icons/fa';
import { AppContext } from '../AppProvider';

const LockScreen = () => {
  const {
    backgroundLockImage,
    user,
    password,
    setPassword,
    connected,
    dateTime,
    updateDateTime,
    formatDate,
    log,
    logError,
  } = useContext(AppContext);

  const [clicked, setClicked] = useState(false);

  React.useEffect(() => {
    return updateDateTime();
  }, [updateDateTime]);

  return (
    <div
      className="relative h-screen w-screen flex items-center justify-center text-white"
      style={{
        backgroundImage: `url(${backgroundLockImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          clicked ? 'backdrop-blur-md bg-black/30' : ''
        }`}
        onClick={() => setClicked(true)}
      ></div>

      <div className={`relative z-10 flex flex-col items-center ${clicked ? '' : 'cursor-pointer'}`}>
        {!clicked ? (
          <>
            <div className="fixed bottom-12 left-4 text-left">
              <div className="text-6xl md:text-8xl lg:text-10xl">
                {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-3xl md:text-4xl lg:text-5xl">{formatDate(dateTime)}</div>
            </div>
            <FaChevronDown className="text-4xl fixed bottom-10 animate-bounce hidden" />
            <div className="fixed bottom-4 right-4 flex items-center space-x-4">
              <span>FR</span>
              <FaWifi />
              <FaSyncAlt />
              <FaPowerOff />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center">
              <img src="https://icons.iconarchive.com/icons/graphicloads/flat-finance/128/person-icon.png" width="128" height="128" alt='' />
              </div>
              <h1 className="mt-4 text-2xl">{user}</h1>
            </div>

            {!log ? (
              <>
                <div className="mt-6 flex items-center border border-gray-400 hover:border-blue-400 rounded bg-white">
                  <input
                    type="password"
                    placeholder="Password"
                    className="bg-transparent border-none text-gray-800 px-4 py-2 focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button className="px-4 py-2" onClick={connected}>
                    <FaArrowRight className="text-gray-800" />
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  <h1 className="mt-2 text-sm text-red-500">{logError}</h1>
                </div>

                <div className="flex flex-col items-center">
                  <h1 className="mt-2 text-xs hover:text-blue-400">Vous avez oublié votre mot de passe ?</h1>
                </div>
            </>
            ):(
              <>
                <div className="mt-6 flex flex-col items-center">
                
                  <div className="loader"></div>
                  <div className="mt-1">
                    <h1 className="text-sm">connection..</h1>
                  </div>

                </div>
            </>
            )

            }

            <div className="fixed bottom-4 right-4 flex items-center space-x-4">
              <span>FR</span>
              <FaWifi />
              <FaSyncAlt />
              <FaPowerOff />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LockScreen;
