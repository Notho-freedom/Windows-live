import React, { useContext, useState } from 'react';
import { FaTh, FaList, FaColumns } from 'react-icons/fa';
import { AppContext } from '../AppProvider';

const Tabs = () => {
  const { setDisplayMode } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('Accueil');
  const [showTooltip, setShowTooltip] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'Accueil':
        return <div>Contenu d'Accueil</div>;
      case 'Partage':
        return <div>Contenu de Partage</div>;
      case 'Affichage':
        return (
          <div>
            <div className="flex gap-2">
              <div className="flex flex-col items-center" onClick={() => setDisplayMode('grid')}>
                <FaTh size={16} />
                <span>Grille</span>
              </div>
              <div className="flex flex-col items-center" onClick={() => setDisplayMode('list')}>
                <FaList size={16} />
                <span>Liste</span>
              </div>
              <div className="flex flex-col items-center" onClick={() => setDisplayMode('columns')}>
                <FaColumns size={16} />
                <span>Colonnes</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleFichierClick = () => {
    setShowTooltip(!showTooltip);
  };

  return (
    <div className='bg-gray-900 w-full' style={{ bottom: '0', zIndex: '9999' }}>
      <div className="tabs bg-transparent flex items-center justify-between w-full">
        <div className="flex items-center gap-1">
          <button className="bg-blue-500 p-1" onClick={handleFichierClick}>Fichier</button>
          <button className={`hover:bg-neutral-800 p-1 ${activeTab === 'Accueil' ? 'bg-neutral-800' : ''}`} onClick={() => setActiveTab('Accueil')}>Accueil</button>
          <button className={`hover:bg-neutral-800 p-1 ${activeTab === 'Partage' ? 'bg-neutral-800' : ''}`} onClick={() => setActiveTab('Partage')}>Partage</button>
          <button className={`hover:bg-neutral-800 p-1 ${activeTab === 'Affichage' ? 'bg-neutral-800' : ''}`} onClick={() => setActiveTab('Affichage')}>Affichage</button>
        </div>
      </div>
      <div className="tab-content bg-neutral-800 p-4 w-full">
        {renderContent()}
      </div>
      {showTooltip && (
        <div className="absolute bg-white text-black p-2 shadow-2xl shadow-black top-3.5 mt-2.5 transform">
          <h2 className="font-bold mb-2">Contenu de Fichier</h2>
          <p>Voici le contenu de l'onglet Fichier.</p>
        </div>
      )}
    </div>
  );
};

export default Tabs;
