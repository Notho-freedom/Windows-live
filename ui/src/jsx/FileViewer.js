import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../AppProvider";
import axios from "axios";

const FileViewer = ({ filePath }) => {
  const [fileContent, setFileContent] = useState(null);
  const [mimeType, setMimeType] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const {API_BASE_URL} = useContext(AppContext);

  useEffect(() => {
    if (filePath) {
      fetchFileContent(filePath);
    }

    // Cleanup: Libérer les URL créées
    return () => {
      if (fileContent instanceof Blob) {
        URL.revokeObjectURL(fileContent);
      }
    };
  }, [filePath]);

  const fetchFileContent = async (path) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/system/stream_file/`,
        { file_path: path },
        { responseType: "blob" } // Réception des données binaires
      );

      setMimeType(response.headers["content-type"] || "application/octet-stream");
      setFileContent(response.data);
    } catch (err) {
      setError("Erreur lors du chargement du fichier. Vérifiez le chemin ou réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-full">Chargement...</div>;
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-500">
          <p>{error}</p>
          <button
            onClick={() => fetchFileContent(filePath)}
            className="p-2 mt-4 text-white bg-blue-500 rounded"
          >
            Réessayer
          </button>
        </div>
      );
    }

    if (!fileContent) {
      return null;
    }

    const blobUrl = URL.createObjectURL(fileContent);

    if (mimeType.startsWith("image/")) {
      return <img src={blobUrl} alt="file" className="object-contain w-full h-full" />;
    } else if (mimeType.startsWith("text/") || mimeType.includes("json")) {
      return (
        <iframe
          src={blobUrl}
          title="Text Viewer"
          className="w-full h-full border-none"
        ></iframe>
      );
    } else if (mimeType.startsWith("video/")) {
      return (
        <video controls className="w-full h-full">
          <source src={blobUrl} type={mimeType} />
          Votre navigateur ne supporte pas le format vidéo.
        </video>
      );
    } else if (mimeType.startsWith("audio/")) {
      return (
        <audio controls className="w-full">
          <source src={blobUrl} type={mimeType} />
          Votre navigateur ne supporte pas le format audio.
        </audio>
      );
    } else if (mimeType === "application/pdf") {
      return (
        <iframe
          src={blobUrl}
          title="PDF Viewer"
          className="w-full h-full border-none"
        ></iframe>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p>Format non supporté.</p>
          <a
            href={blobUrl}
            download
            className="p-2 mt-4 text-white bg-blue-500 rounded"
          >
            Téléchargez le fichier ici
          </a>
        </div>
      );
    }
  };

  return (
    <div className="w-full h-full text-white bg-gray-900 file-viewer">
      {renderContent()}
    </div>
  );
};

export default FileViewer;
