import React, { useRef, useState, useEffect } from "react";
import { IconButton, Paper, Typography, Box } from "@mui/material";
import { Close } from "@mui/icons-material";

const FloatingSpotifyPlayer = ({ url, onClose }) => {
  const dragRef = useRef(null);
  const [position, setPosition] = useState({
    top: window.innerHeight - 320,
    left: window.innerWidth - 520,
  });
  const [size, setSize] = useState({ width: 480, height: 270 });
  const offset = useRef({ x: 0, y: 0 });
  const resizing = useRef({ active: false, corner: "" });
  const dragging = useRef(false);

  // Para recalcular posición si cambia tamaño ventana
  useEffect(() => {
    const handleResizeWindow = () => {
      setPosition((pos) => ({
        top: Math.min(pos.top, window.innerHeight - 100),
        left: Math.min(pos.left, window.innerWidth - 100),
      }));
    };
    window.addEventListener("resize", handleResizeWindow);
    return () => window.removeEventListener("resize", handleResizeWindow);
  }, []);

  const startDrag = (e) => {
    if (resizing.current.active) return;
    dragging.current = true;
    offset.current = {
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    };
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const handleDrag = (e) => {
    if (!dragging.current) return;
    setPosition({
      top: Math.min(
        Math.max(e.clientY - offset.current.y, 0),
        window.innerHeight - size.height
      ),
      left: Math.min(
        Math.max(e.clientX - offset.current.x, 0),
        window.innerWidth - size.width
      ),
    });
  };

  const stopDrag = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", stopDrag);
  };

  const startResize = (e, corner) => {
    e.stopPropagation();
    dragging.current = false;
    resizing.current = { active: true, corner };
    offset.current = { x: e.clientX, y: e.clientY };
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
  };

  const handleResize = (e) => {
    if (!resizing.current.active) return;
    const dx = e.clientX - offset.current.x;
    const dy = e.clientY - offset.current.y;
    offset.current = { x: e.clientX, y: e.clientY };

    setSize((prevSize) => {
      const newSize = { ...prevSize };
      const corner = resizing.current.corner;

      if (corner.includes("right")) {
        newSize.width = Math.max(250, prevSize.width + dx);
      } else if (corner.includes("left")) {
        newSize.width = Math.max(250, prevSize.width - dx);
      }

      if (corner.includes("bottom")) {
        newSize.height = Math.max(80, prevSize.height + dy);
      } else if (corner.includes("top")) {
        newSize.height = Math.max(80, prevSize.height - dy);
      }

      return newSize;
    });

    setPosition((prevPos) => {
      const newPos = { ...prevPos };
      const corner = resizing.current.corner;

      if (corner.includes("left")) {
        newPos.left = prevPos.left + dx;
      }

      if (corner.includes("top")) {
        newPos.top = prevPos.top + dy;
      }

      // Limitar para que no se salga de pantalla
      newPos.left = Math.min(Math.max(newPos.left, 0), window.innerWidth - size.width);
      newPos.top = Math.min(Math.max(newPos.top, 0), window.innerHeight - size.height);

      return newPos;
    });
  };

  const stopResize = () => {
    resizing.current = { active: false, corner: "" };
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
  };

  const extractSpotifyId = (url) => {
    const match = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    return match ? { type: match[1], id: match[2] } : null;
  };

  const spotifyData = extractSpotifyId(url);
  if (!spotifyData) return null;

  const embedUrl = `https://open.spotify.com/embed/${spotifyData.type}/${spotifyData.id}`;

  return (
    <Paper
      ref={dragRef}
      elevation={5}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 9999,
        width: size.width,
        height: size.height + 40, // altura del iframe + header
        cursor: "default",
        borderRadius: 12,
        overflow: "hidden",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000",
      }}
    >
      <Box
        onMouseDown={startDrag}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#1DB954",
          color: "#fff",
          padding: "4px 12px",
          cursor: "move",
          flexShrink: 0,
          height: 40,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          Sonargram
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <iframe
        width="100%"
        height={size.height}
        src={embedUrl}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        style={{
          display: "block",
          pointerEvents: resizing.current.active ? "none" : "auto",
          flexShrink: 0,
        }}
        title="Spotify Player"
      />

      {[
        { corner: "bottom-right", cursor: "nwse-resize", bottom: -8, right: -8 },
        { corner: "bottom-left", cursor: "nesw-resize", bottom: -8, left: -8 },
        { corner: "top-right", cursor: "nesw-resize", top: -8, right: -8 },
        { corner: "top-left", cursor: "nwse-resize", top: -8, left: -8 },
      ].map((handle, index) => (
        <Box
          key={index}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            startResize(e, handle.corner);
          }}
          sx={{
            width: 16,
            height: 16,
            position: "absolute",
            backgroundColor: "transparent",
            cursor: handle.cursor,
            zIndex: 10000,
            ...handle,
          }}
        />
      ))}
    </Paper>
  );
};

export default FloatingSpotifyPlayer;
