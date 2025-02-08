
export const fetchLink = async (code) => {
  if (!code || typeof code !== 'string') {
    throw new Error("Code invalide ou manquant.");
  }
  try {
    const response = await fetch('https://test.ora-app.genesis-company.net/index.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
      },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du lien: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de l’appel à fetchLink:', error);
    throw error;
  }
};



export const createApiService = (API_BASE_URL) => {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL est requis pour initialiser le service API.");
  }

  const apiCall = async (endpoint, method = 'POST', body = null, responseType = 'json') => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      console.log(`${API_BASE_URL}${endpoint}`);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      return responseType === 'blob' ? await response.blob() : await response.json();
    } catch (error) {
      console.error('Erreur lors de l’appel API:', error);
      throw error;
    }
  };

  const isValidDirectoryPath = (directoryPath) => {
    const windowsPathRegex = /^[a-zA-Z]:(\\|\/)(([^<>:"|?*]+(\\|\/)?)+)?$/; // Ex: C:\Users\...
    return typeof directoryPath === "string" && windowsPathRegex.test(directoryPath);
  };

  const fetchDirectoryContents = async (directoryPath) => {
    if (!isValidDirectoryPath(directoryPath)) {
      throw new Error(`Chemin de répertoire invalide: ${directoryPath}`);
    }
    return apiCall('/system/directory_contents', 'POST', { directory: directoryPath });
  };

  const fetchWallpaper = async () => {
    const blob = await apiCall('/system/current_wallpaper_image', 'GET', null, 'blob');
    return URL.createObjectURL(blob);
  };

  const fetchDisk = async () => apiCall('/system/resources', 'GET');

  const fetchUsers = async () => apiCall('/system/users-and-groups', 'GET');

  const fetchImageList = async () => {
    const response = await apiCall('/system/images', 'GET', null, 'json');
    return response.images;
  };

  const fetchSpecificImage = async (imageName) => {
    const blob = await apiCall('/system/image/', 'POST', { image_name: imageName }, 'blob');
    return URL.createObjectURL(blob);
  };

  const fetchLockWallpaper = async () => {
    const data = await fetchImageList();
    const randomIndex = Math.floor(Math.random() * data.length);
    return fetchSpecificImage(data[randomIndex]);
  };

  const fetchFileContent = async (filePath) => {
    const response = await apiCall('/system/stream_file/', 'POST', { file_path: filePath }, 'blob');
    const contentType = response.headers?.get('Content-Type');
    return { contentType, content: response };
  };


  const connectSSE = (endpoint, onMessage) => {
    const eventSource = new EventSource(`${API_BASE_URL}${endpoint}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error("Erreur lors de la réception des données SSE:", error);
      }
    };

    eventSource.onerror = (event) => {
      console.error("Erreur SSE:", event);
      eventSource.close();
    };

    eventSource.onclose = () => {
      console.log("SSE fermé");
    };

    return eventSource;
  };

  const subscribeToWallpaperUpdates = (onImageUpdate) => {
    const eventSource = new EventSource(`${API_BASE_URL}/sse/current_wallpaper_image`);
  
    eventSource.onmessage = (event) => {
      try {
        const base64Image = event.data;
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;
        onImageUpdate(imageUrl);
      } catch (error) {
        console.error("Erreur lors de la réception de l'image :", error);
      }
    };
  
    eventSource.onerror = (error) => {
      console.error("Erreur de connexion SSE :", error);
      eventSource.close();
    };
  
    return eventSource;
  };
  

  const subscribeToResourceUpdates = (onResourceUpdate) => {
    return connectSSE(
      '/sse/resources',
      onResourceUpdate
    );
  };

  const subscribeToRecycleBinUpdates = (onUpdate) => {
    return connectSSE("/sse/recycle_bin_state", onUpdate);
  };



















  return {
    fetchDirectoryContents,
    fetchWallpaper,
    fetchDisk,
    fetchUsers,
    fetchImageList,
    fetchSpecificImage,
    fetchLockWallpaper,
    fetchFileContent,
    subscribeToWallpaperUpdates,
    subscribeToResourceUpdates,
    subscribeToRecycleBinUpdates,
  };
};

export default createApiService;
