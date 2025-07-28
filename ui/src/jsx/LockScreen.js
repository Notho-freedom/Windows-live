import React, { useContext, useState } from 'react';
import { FaArrowRight, FaChevronDown, FaPowerOff, FaSyncAlt, FaWifi, FaVolumeUp } from 'react-icons/fa';
import { AppContext } from '../AppProvider';

const LockScreen = () => {
  const { user, onUnlock, backgroundLockImage } = useContext(AppContext);
  const [clicked, setClicked] = useState(false);
  const [password, setPassword] = useState('');
  const [log, setLog] = useState(false);
  const [logError, setLogError] = useState('');

  const [dateTime, setDateTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleScreenClick = () => {
    console.log('Screen clicked, setting clicked to true');
    setClicked(true);
  };

  const connected = () => {
    // Validation du mot de passe
    if (!password.trim()) {
      setLogError('Veuillez saisir un mot de passe');
      return;
    }

    if (password === 'admin' || password === '1234' || password === 'password') {
      setLog(true);
      setLogError(''); // Effacer les erreurs précédentes
      setTimeout(() => {
        onUnlock();
      }, 2000);
    } else {
      setLogError('Mot de passe incorrect');
      setPassword(''); // Vider le champ en cas d'erreur
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      connected();
    }
  };

  return (
    <div
      className="relative h-screen w-screen text-white overflow-hidden cursor-pointer"
      style={{
        backgroundImage: `url(${backgroundLockImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      onClick={handleScreenClick}
    >
      {/* Overlay avec effet de flou */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          clicked ? 'backdrop-blur-md bg-black/40' : 'backdrop-blur-sm bg-black/20'
        }`}
      ></div>

      {/* Heure et date - Position en bas à gauche */}
      <div className="absolute bottom-20 left-8 text-left z-20">
        <div className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wider">
          {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-lg md:text-xl lg:text-2xl font-light mt-2 opacity-90">
          {formatDate(dateTime)}
        </div>
      </div>

      {/* Icônes système - Position en bas à droite */}
      <div className="absolute bottom-6 right-6 flex items-center space-x-4 z-20">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">FR</span>
          <FaWifi className="text-lg" />
          <FaVolumeUp className="text-lg" />
          <FaSyncAlt className="text-lg" />
          <FaPowerOff className="text-lg" />
        </div>
      </div>

      {/* Flèche en bas - Position centrée en bas */}
      {!clicked && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-30">
          <FaChevronDown className="text-3xl animate-bounce opacity-70 mb-2" />
          <span className="text-sm opacity-70">Cliquez pour déverrouiller</span>
        </div>
      )}

      {/* Contenu central */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 z-30 ${clicked ? 'scale-95' : 'scale-100'}`}>
        {clicked && (
          <div className="flex flex-col items-center space-y-6">
            {/* Avatar et nom d'utilisateur */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                <img 
                  src="https://icons.iconarchive.com/icons/graphicloads/flat-finance/128/person-icon.png" 
                  width="80" 
                  height="80" 
                  alt="Avatar"
                  className="rounded-full"
                />
              </div>
              <h1 className="text-2xl font-medium">{user}</h1>
            </div>

            {/* Formulaire de connexion */}
            {!log ? (
              <div className="flex flex-col items-center space-y-4 w-80">
                <div className="w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Mot de passe"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-200"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (logError) setLogError(''); // Effacer l'erreur quand l'utilisateur tape
                      }}
                      onKeyPress={handleKeyPress}
                      autoFocus
                    />
                    <button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/20 transition-all duration-200"
                      onClick={connected}
                    >
                      <FaArrowRight className="text-white/70" />
                    </button>
                  </div>
                </div>

                {/* Messages d'erreur */}
                {logError && (
                  <div className="text-red-400 text-sm text-center bg-red-900/20 px-4 py-2 rounded w-full">
                    {logError}
                  </div>
                )}

                {/* Lien d'aide */}
                <div className="text-center">
                  <button className="text-sm text-white/70 hover:text-white transition-colors duration-200 underline">
                    Vous avez oublié votre mot de passe ?
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Indicateur de chargement */}
                <div className="flex flex-col items-center">
                  <div className="loader mb-4"></div>
                  <div className="text-white/70 text-sm">
                    Connexion en cours...
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LockScreen;
