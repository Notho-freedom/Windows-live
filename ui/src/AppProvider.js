import React, { createContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FaArrowAltCircleRight, FaCheck, FaChevronRight, FaCircle, FaCopy, FaCut, FaEdit, FaFileArchive, FaFileWord, FaFolderOpen, FaFolderPlus, FaImages, FaPaste, FaTrash} from 'react-icons/fa';
import {GetIcon} from './jsx/LoardData';
import {createApiService, fetchLink} from './jsx/ApiService';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [API_BASE_URL, setAPI_BASE_URL]=useState('http://localhost:5000')
  const [isStartMenuVisible, setIsStartMenuVisible] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [backgroundLockImage, setBackgroundLockImage] = useState('https://windows-live.genesis-company.net/images/lock_bg.jpeg');
  const [items, setItems] = useState([]);
  const [errorc, setErrorc] = useState('');
  const [loading, setLoading] = useState(false);
  const [Starting, setStarting] = useState(true);
  const [user, setUser] = useState('user');
  const [drives, setDrives] = useState([]);
  const [originPath, setOriginPath] = useState('');
  const [allDrives, setAllDrives] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [openWindows, setOpenWindows] = useState([]);
  const [error, setError] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState(originPath);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [sortOrder, setSortOrder] = useState('Type');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectionBox, setSelectionBox] = useState(null);
  const [focusedItem, setFocusedItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTimeout, setDragTimeout] = useState(null);
  const [clipboard, setClipboard] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [newName, setNewName] = useState('');
  const inputRef = useRef(null);
  const [style, setStyle] = useState('mt-1 mb-1');
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [inputPath, setInputPath] = useState(currentPath);
  const [searchInput, setSearchInput] = useState('');
  const [showPathDropdown, setShowPathDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [dateTime, setDateTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [pinnedApps, setPinnedApps] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [displayMode, setDisplayMode] = useState('grid');
  const [contents, setContents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [log, setLog] = useState(false);
  const [logError, setLogError] = useState(null);
  const [load, setLoad] = useState(false);
  let ApiService = createApiService(API_BASE_URL);

  const allItems = useMemo(() => {
    const defaultIcons = [
      {
        name: 'Corbleille',
        path: 'C:\\$Recycle.Bin',
        type: 'trash',
        size: 63,
        last_modified: '2024-11-19T02:05:58.005693',
        is_hidden: false,
      },
      {
        name: user,
        path: '',
        type: 'desktop',
        size: 63,
        last_modified: '2024-11-19T02:05:58.005693',
        is_hidden: false,
      },
    ];

    return [...defaultIcons, ...items];
  }, [items, user]);
  const [sortedItems, setSortedItems] = useState(allItems);
  const [gridConfig, setGridConfig] = useState({columns: 1,itemsPerColumn: allItems.length,itemWidth: 100,itemHeight: 100,});
  const [isSidebarOpen, setSidebarOpen]=useState(false);
  const [iconSize, setIconSize] = useState(3);
  const [networkItems, setnetworkItems] = useState([
    { name: 'Réseau 1', path: '/Réseau 1', type: 'Router' },
    { name: 'Réseau 2', path: '/Réseau 2', type: 'Router' },
  ]);
  const defaultFolders = [
    { name: 'Bureau', path: originPath + 'Desktop', type: 'desktop' },
    { name: 'Téléchargements', path: originPath + 'Downloads', type: 'downloads' },
    { name: 'Documents', path: originPath + 'Documents', type: 'documents' },
    { name: 'Images', path: originPath + 'Pictures', type: 'pictures' },
    { name: 'Musique', path: originPath + 'Music', type: 'musics' },
    { name: 'Objets 3D', path: originPath + '3D Objects', type: 'objects' },
    { name: 'Vidéos', path: originPath + 'Videos', type: 'videos' },
  ];

  const handleSelectionBox = (box) => {
    if (!box) return;

    const selected = sortedItems.filter((item) => {
      const itemElement = document.getElementById(item.name);
      if (!itemElement) return false;

      const rect = itemElement.getBoundingClientRect();
      return (
        rect.left < box.x2 &&
        rect.right > box.x1 &&
        rect.top < box.y2 &&
        rect.bottom > box.y1
      );
    });

    setSelectedItems(selected);
  };

  useEffect(() => {
    const updateGrid = () => {
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
  
      let estimatedItemWidth = Math.max(60, screenWidth * 0.05);
      let estimatedItemHeight = Math.max(40, screenHeight * 0.08);
  
      let itemsPerColumn = Math.max(1, Math.floor(screenHeight / estimatedItemHeight));
  
      if (screenWidth >= 900) {
        estimatedItemWidth += 30;
        estimatedItemHeight -= 26;
        setStyle('mb-5');
      } else {
        estimatedItemWidth += 10;
        estimatedItemHeight -= 10;
        setStyle('mb-1');
      }
  
      if (screenHeight <= 700) {
        estimatedItemHeight += 40;
        itemsPerColumn = Math.max(1, itemsPerColumn - 3);
        setStyle('mb-1');
      }
  
      const totalColumns = Math.ceil(allItems.length / itemsPerColumn);
      const maxColumns = Math.max(1, Math.floor(screenWidth / estimatedItemWidth));
      const columns = Math.min(totalColumns, maxColumns);
  
      setGridConfig({
        columns,
        itemsPerColumn,
        itemWidth: estimatedItemWidth,
        itemHeight: estimatedItemHeight,
      });
    };
  
    updateGrid();
    window.addEventListener('resize', updateGrid);
  
    return () => {
      window.removeEventListener('resize', updateGrid);
    };
  }, [allItems.length]);

  const handleRightClick = (event, item) => {
    event.preventDefault();
    const options = [
      {
        label: 'Affichage',
        icon: <FaChevronRight />,
        subOptions: [
          { label: 'Grande icones', icon: <FaCircle />, onClick: () => console.log('Grande icones') },
          { label: 'Icônes moyennes', icon: <FaCircle />, onClick: () => console.log('Icônes moyennes') },
          { label: 'Petites icônes', icon: <FaCircle />, onClick: () => console.log('Petites icônes') },
          { label: 'Réorganiser automatiquement les icônes', icon: <FaCircle />, onClick: () => console.log('Réorganiser automatiquement les icônes') },
          { label: 'Afficher les icônes sur la grille', icon: <FaCheck />, onClick: () => console.log('Afficher les icônes sur la grille') },
          { label: 'Afficher les éléments du bureau', icon: <FaCheck />, onClick: () => console.log('Afficher les éléments du bureau') },
        ],
      },
      {
        label: 'Trier par',
        icon: <FaChevronRight />,
        subOptions: [
          { label: 'Nom', icon: <FaCircle />, onClick: () => setSortOrder('Nom') }, // Tri par Nom
          { label: 'Taille', icon: <FaCircle />, onClick: () => setSortOrder('Taille') }, // Tri par Taille
          { label: "Type d'éléments", icon: <FaCircle />, onClick: () => setSortOrder('Type') }, // Tri par Type
          { label: "Modiffié le", icon: <FaCircle />, onClick: () => setSortOrder('last_modified') }, // Tri par last_modified
        ],
      },
      { label: 'Actualiser', icon: <FaCircle />, onClick: () => console.log('Actualiser') },
      { label: 'Coller', icon: <FaPaste />, onClick: () => console.log('Coller') },
      { label: 'Afficher l’arrière-plan suivant', icon: <FaArrowAltCircleRight />, onClick: () => console.log('Afficher l’arrière-plan suivant') },
      { label: 'Changer d’arrière-plan', icon: <FaImages />, onClick: () => console.log('Changer d’arrière-plan') },
      {
        label: 'Nouveau',
        icon: <FaChevronRight />,
        subOptions: [
          { label: 'Dossier', icon: <FaFolderPlus className='bg-gold text-gold' />, onClick: () => setCurrentPath('Ce PC') },
          { label: 'Document Texte', icon: <FaFileWord />, onClick: () => console.log('Document Texte') },
          { label: "Archive", icon: <FaFileArchive />, onClick: () => console.log('Archive') },
        ],
      },
    ];
  
    if (item) {
      event.stopPropagation();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        options: [
          { label: 'Ouvrir', icon: <FaFolderOpen />, action: () => handleDoubleClick(item) },
          { label: 'Renommer', icon: <FaEdit />, action: () => handleEditName(item) },
          { label: 'Supprimer', icon: <FaTrash />, action: () => console.log(item) },
          {
            label: 'Édition',
            icon: <FaEdit />,
            subOptions: [
              { label: 'Copier', icon: <FaCopy />, onClick: () => console.log('Copier', item) },
              { label: 'Couper', icon: <FaCut />, onClick: () => console.log('Couper', item) },
              { label: 'Coller', icon: <FaPaste />, onClick: () => console.log('Coller', item) },
            ],
          },
        ],
      });
    }else{
      setContextMenu({ x: event.clientX, y: event.clientY, options });
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };
  const updateDateTime = () => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  };

  const connected = async () => {
    try {
      if (password.trim() !== '') {
        setLog(true);
  
        const response = await fetchLink(password);
  
        if (response.success) {
          setAPI_BASE_URL(response.link);
          console.log(API_BASE_URL);
          ApiService = createApiService(response.link);
  
          // Récupération des données initiales
          //const fetchedBackground = await ApiService.fetchLockWallpaper();
          const Users = await ApiService.fetchUsers();
          const user = Users.current_user;
          const datas = await ApiService.fetchDisk();
          const data = datas.disk;
          const keys = Object.keys(data);
          const user_origin = `${keys[0]}\\Users\\${user}\\`;
  
          const drivesData = keys.map((key) => {
            const drive = data[key];
            return {
              name: `Disque local (${key})`,
              freeSpace: drive.free ? `${(drive.free / (1024 ** 3)).toFixed(1)} Go` : 'Inaccessible',
              totalSpace: drive.total ? `${(drive.total / (1024 ** 3)).toFixed(1)} Go` : '',
              barColor: drive.percent >= 90 ? 'bg-red-500' : 'bg-blue-500',
              barWidth: drive.percent ? `${drive.percent}%` : '0%',
              path: key,
              type: 'directory',
            };
          });
  
          setUser(user);
          setAllDrives(keys);
          setDrives(drivesData);
          setOriginPath(user_origin);

          const desktopItems = await ApiService.fetchDirectoryContents(user_origin + "\\OneDrive\\Desktop\\");
          setItems(desktopItems);
  
          ApiService.subscribeToWallpaperUpdates(
            (imageUrl) => {
              setBackgroundImage(imageUrl);
              setLoad(true);
            }
          );
  
          ApiService.subscribeToResourceUpdates(
            (data) => {
              const drivesData = Object.keys(data.disk).map((key) => {
                const drive = data.disk[key];
                return {
                  name: `Disque local (${key})`,
                  freeSpace: drive.free ? `${(drive.free / (1024 ** 3)).toFixed(1)} Go` : 'Inaccessible',
                  totalSpace: drive.total ? `${(drive.total / (1024 ** 3)).toFixed(1)} Go` : '',
                  barColor: drive.percent >= 90 ? 'bg-red-500' : 'bg-blue-500',
                  barWidth: drive.percent ? `${drive.percent}%` : '0%',
                  path: key,
                  type: 'directory',
                };
              });
              setDrives(drivesData);
            }
          );

          if (backgroundImage !==null) {
            setTimeout(() => {
              setIsLocked(false);
            }, 2000);
          }

        } else {
          setLogError('Mot de passe incorrect. Reessayez!');
          setLog(false);
        }
      } else {
        setLogError('Mot de passe incorrect. Reessayez!');
        setLog(false);
      }
    } catch (err) {
      setLogError(err.message);
      setLog(false);
    }
  };
  

  useEffect(() => {
    const loadContents = async () => {
      try {
        setContentLoading(true);
        const data = await ApiService.fetchDirectoryContents(currentPath);
        const sortedData = data.sort((a, b) => {
          if (a.type === 'directory' && b.type !== 'directory') return -1;
          if (a.type !== 'directory' && b.type === 'directory') return 1;
          return 0;
        });
        setContents(sortedData);
      } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
      } finally {
        setContentLoading(false);
      }
    };

    currentPath !== '' ? loadContents() : setContents([]);
  }, [currentPath]);

  const closeWindow = (id) => {
    setOpenWindows((prev) => prev.filter((win) => win.id !== id));
  };


  const updateTime = () => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setCurrentDate(now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }));
  };
  
  const handleDoubleClick = (item) => {
    if (item.type === "file") {
      setOpenWindows((prevWindows) => [
        ...prevWindows,
        {
          id: `${item.name}-${Date.now()}`,
          path: item.path,
          title: item.name,
          type: "file",
          item: item,
        },
      ]);
    } else {
      const existingExplorer = openWindows.some(
        (win) => win.type === "explorer"
      );
  
      if (!existingExplorer) {
        const newPath = item.path;
        setCurrentPath(newPath);
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, newPath]);
        setHistoryIndex(newHistory.length);
        
        setOpenWindows((prevWindows) => [
          ...prevWindows,
          {
            id: `${item.name}-${Date.now()}`,
            path: item.path,
            title: item.name,
            type: "explorer",
            item: item,
          },
        ]);
      }else{

        const newPath = item.path;
        setCurrentPath(newPath);
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, newPath]);
        setHistoryIndex(newHistory.length);
      }
    }
  };

  const handleBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setCurrentPath(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  }, [historyIndex, history]);

  const handleForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setCurrentPath(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  }, [historyIndex, history]);

const formatSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
    if (size < 1073741824) return `${(size / 1048576).toFixed(2)} MB`;
    return `${(size / 1073741824).toFixed(2)} GB`;
  };

  useEffect(() => {

    const sortItems = (criteria) => {
      let sorted;
      switch (criteria) {
        case 'Nom':
          sorted = [...allItems].sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'Taille':
          sorted = [...allItems].sort((a, b) => a.size - b.size);
          break;
        case 'Type':
          sorted = [...allItems].sort((a, b) => a.type.localeCompare(b.type));
          break;
        case 'Modifié le':
          sorted = [...allItems].sort((a, b) => a.last_modified.localeCompare(b.last_modified));
          break;
        default:
          sorted = [...allItems];
      }
      return sorted;
    };
  
    setSortedItems(sortItems(sortOrder));
  }, [sortOrder,allItems]);


  const handleEditName = (item) => {
    setEditingItem(item);
    setNewName(item.name);
};

useEffect(() => {
    if (inputRef.current) {
        inputRef.current.select();
    }
}, [editingItem]);

const handlePathDropdownClick = (path) => {
  setInputPath(path);
  setCurrentPath(path);
  setShowPathDropdown(false);
};

const handleSearchDropdownClick = (query) => {
  setSearchInput(query);
  setSearchQuery(query);
  setShowSearchDropdown(false);
};

const togglePinItem = (item) => {
  setPinnedApps((prevApps) => {
    const isPinned = prevApps.some((pinnedItem) => pinnedItem.path === item.path);

    if (isPinned) {
      return prevApps.filter((pinnedItem) => pinnedItem.path !== item.path);
    } else {
      return [
        ...prevApps,
        {
          id: prevApps.length + 1,
          name: item.name,
          icon: <GetIcon item={item} size={5} />,
          path: item.path,
        },
      ];
    }
  });
};


  return (
    <AppContext.Provider
      value={{
        isStartMenuVisible, setIsStartMenuVisible,
        isLocked, setIsLocked,
        password, setPassword,
        backgroundImage, setBackgroundImage,
        backgroundLockImage, setBackgroundLockImage,
        items, setItems,
        errorc, setErrorc,
        loading, setLoading,
        Starting, setStarting,
        user, setUser ,
        drives, setDrives,
        originPath, setOriginPath,
        allDrives, setAllDrives,
        handleLock: () => {setIsLocked(false);}, 
        connected,
        contextMenu, setContextMenu,
        allItems,
        gridConfig, setGridConfig,
        openWindows, setOpenWindows,
        error, setError,
        contentLoading, setContentLoading,
        currentPath, setCurrentPath,
        history, setHistory,
        historyIndex, setHistoryIndex,
        sortedItems, setSortedItems,
        sortOrder, setSortOrder,
        selectedItems, setSelectedItems,
        selectionBox, setSelectionBox,
        focusedItem, setFocusedItem,
        isDragging, setIsDragging,
        dragTimeout, setDragTimeout,
        clipboard, setClipboard,
        editingItem, setEditingItem,
        newName, setNewName,
        inputRef, style,dateTime,
        setStyle, explorerOpen,
        setExplorerOpen, inputPath,
        setInputPath, searchInput,
        setSearchInput, showPathDropdown,
        setShowPathDropdown, showSearchDropdown,
        setShowSearchDropdown, searchHistory,
        setSearchHistory, updateDateTime: () => updateDateTime(),
        formatDate: (date) => date.toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' }), 
        currentTime, currentDate,
        pinnedApps, updateTime,
        onLock: () => {setIsLocked(true);}
        ,handleDoubleClick,
        handleBack, handleForward,
        selectedRow, setSelectedRow,
        handleRightClick, handleCloseContextMenu,
        displayMode, setDisplayMode,
        setContents, contents,
        setSearchQuery, setPinnedApps,
        closeWindow,searchQuery,
        handleEditName,handleSelectionBox,
        handleSearchDropdownClick,formatSize,
        handlePathDropdownClick,
        isSidebarOpen, setSidebarOpen,
        iconSize, setIconSize, togglePinItem,
        log,setLog,
        API_BASE_URL, setAPI_BASE_URL,
        defaultFolders, networkItems, setnetworkItems,
        logError, setLogError,
        load, setLoad,
      }}
    >
      {children}
    </AppContext.Provider>
);
};

export { AppContext, AppProvider };
