import React, { useEffect, useRef, useState } from 'react';

const LiveScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000/ws/live_screen");

    socket.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connecté");
    };

    socket.onmessage = (event) => {
      const arrayBuffer = event.data;
      const blob = new Blob([arrayBuffer], { type: "image/jpeg" });
      const imgUrl = URL.createObjectURL(blob);
      setImageSrc(imgUrl);
    };

    socket.onerror = (error) => {
      console.error("Erreur WebSocket:", error);
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket fermé");
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div>
      <h2>{isConnected ? "Connexion en cours..." : "Non connecté"}</h2>
      {imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Live Screen"
          style={{ width: "100%", height: "auto" }}
        />
      )}
    </div>
  );
};

export default LiveScreen;
