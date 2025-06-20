// context/MediaPlayerContext.js
import React, { createContext, useContext, useState } from "react";

const MediaPlayerContext = createContext();

export const MediaPlayerProvider = ({ children }) => {
  const [mediaPlayer, setMediaPlayer] = useState({ type: null, url: null });

  const openMedia = (type, url) => setMediaPlayer({ type, url });
  const closeMedia = () => setMediaPlayer({ type: null, url: null });

  return (
    <MediaPlayerContext.Provider value={{ mediaPlayer, openMedia, closeMedia }}>
      {children}
    </MediaPlayerContext.Provider>
  );
};

export const useMediaPlayer = () => useContext(MediaPlayerContext);