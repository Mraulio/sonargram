// context/YoutubePlayerContext.js
import React, { createContext, useContext, useState } from "react";

const YoutubePlayerContext = createContext();

export const YoutubePlayerProvider = ({ children }) => {
  const [youtubeUrl, setYoutubeUrl] = useState(null);

  const openYoutube = (url) => setYoutubeUrl(url);
  const closeYoutube = () => setYoutubeUrl(null);

  return (
    <YoutubePlayerContext.Provider value={{ youtubeUrl, openYoutube, closeYoutube }}>
      {children}
    </YoutubePlayerContext.Provider>
  );
};

export const useYoutubePlayer = () => useContext(YoutubePlayerContext);
