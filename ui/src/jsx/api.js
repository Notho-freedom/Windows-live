import { useContext } from "react";
import { AppContext } from "../AppProvider";

const {API_BASE_URL} = useContext(AppContext);


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
  // Vérifie si le chemin n'est pas vide, est une chaîne, et semble valide (en utilisant une expression régulière simple)
  const windowsPathRegex = /^[a-zA-Z]:(\\|\/)(([^<>:"|?*]+(\\|\/)?)+)?$/; // Ex: C:\Users\...
  return typeof directoryPath === "string" && windowsPathRegex.test(directoryPath);
};

/**
 * Récupère les données des contenus d'un répertoire après vérification du chemin.
 * @param {string} directoryPath - Le chemin du répertoire.
 * @returns {Promise<Object>} - Les données JSON des fichiers et dossiers.
 * @throws {Error} - Si le chemin est invalide.
 */
export const fetchDirectoryContents = async (directoryPath) => {
  if (!isValidDirectoryPath(directoryPath)) {
    throw new Error(`Chemin de répertoire invalide: ${directoryPath}`);
  }

  // Si le chemin est valide, soumettre la requête à l'API
  return apiCall('/system/directory_contents', 'POST', { directory: directoryPath });
};

/**
 * Récupère l'image de fond d'écran actuelle.
 * @returns {Promise<string>} - L'URL de l'image de fond d'écran.
 */
export const fetchWallpaper = async () => {
  const blob = await apiCall('/system/current_wallpaper_image', 'GET', null, 'blob');
  return URL.createObjectURL(blob);
};

export const fetchDisk = async () => {
  return apiCall('/system/resources', 'GET');
};

export const fetchUsers = async () => {
  return apiCall('/system/users-and-groups', 'GET');
};

export const fetchImageList = async () => {
  const response = await apiCall('/system/images', 'GET', null, 'json');
  return response.images;
};

export const fetchSpecificImage = async (imageName) => {
  const blob = await apiCall('/system/image/', 'POST', { image_name: imageName }, 'blob');
  return URL.createObjectURL(blob);
};

export const fetchLockWallpaper = async () => {
  const data = await fetchImageList();
  const randomIndex = Math.floor(Math.random() * data.length);
  return fetchSpecificImage(data[randomIndex]);
};


/**
 * Récupère le contenu d'un fichier.
 * @param {string} filePath - Le chemin complet du fichier.
 * @returns {Promise<{contentType: string, content: Blob}>} - Le type de contenu et le contenu du fichier.
 */
export const fetchFileContent = async (filePath) => {
  try {
    const response = await fetch(`${API_BASE_URL}/system/stream_file/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file_path: filePath }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('Content-Type');
    console.log(response.headers.get('Content-Type'));
    const blob = await response.blob();
    return { contentType, content: blob };
  } catch (error) {
    console.error('Erreur lors de l’appel API:', error);
    throw error;
  }
};
