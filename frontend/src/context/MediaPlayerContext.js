// context/MediaPlayerContext.js
import React, { createContext, useContext, useState } from "react";

const MediaPlayerContext = createContext();

export const MediaPlayerProvider = ({ children }) => {
  const [mediaPlayer, setMediaPlayer] = useState({ type: null, url: null, title: null });

  const openMedia = (type, url, title) => setMediaPlayer({ type, url, title });
  const closeMedia = () => setMediaPlayer({ type: null, url: null, title: null });

  return (
    <MediaPlayerContext.Provider value={{ mediaPlayer, openMedia, closeMedia }}>
      {children}
    </MediaPlayerContext.Provider>
  );
};

export const useMediaPlayer = () => useContext(MediaPlayerContext);