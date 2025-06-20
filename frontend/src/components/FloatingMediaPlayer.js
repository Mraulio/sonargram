import React, { useRef, useState, useEffect } from "react";
import { IconButton, Paper, Typography, Box } from "@mui/material";
import { Close, ExpandLess, ExpandMore } from "@mui/icons-material";

const FloatingMediaPlayer = ({ type, url, title= "Sin título", onClose }) => {
  const dragRef = useRef(null);
  const [position, setPosition] = useState({
    top: window.innerHeight - 320,
    left: window.innerWidth - 520,
  });
  const [size, setSize] = useState({ width: 480, height: 270 });
  const offset = useRef({ x: 0, y: 0 });
  const resizing = useRef({ active: false, corner: "" });
  const dragging = useRef(false);

 const [minimized, setMinimized] = useState(false);
  const prevPosition = useRef(position);
  const prevSize = useRef(size);

  useEffect(() => {
    setMinimized(false);
    setPosition(prevPosition.current || {
      top: window.innerHeight - 320,
      left: window.innerWidth - 520,
    });
    setSize(prevSize.current || { width: 480, height: 270 });
  }, [url]);

  // Drag handlers
  const startDrag = (e) => {
    if (resizing.current.active || minimized) return;
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
    const newTop = Math.min(
      Math.max(e.clientY - offset.current.y, 10),
      window.innerHeight - size.height - 10
    );
    const newLeft = Math.min(
      Math.max(e.clientX - offset.current.x, 10),
      window.innerWidth - size.width - 10
    );
    setPosition({ top: newTop, left: newLeft });
  };

  const stopDrag = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", stopDrag);
  };

  // Resize handlers
  const startResize = (e, corner) => {
    e.stopPropagation();
    if (minimized) return;
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

    setSize((prevSizeState) => {
      const newSize = { ...prevSizeState };
      const { corner } = resizing.current;

      if (corner.includes("right")) {
        newSize.width = Math.min(
          Math.max(200, prevSizeState.width + dx),
          window.innerWidth - position.left - 10
        );
      } else if (corner.includes("left")) {
        newSize.width = Math.min(
          Math.max(200, prevSizeState.width - dx),
          position.left + prevSizeState.width - 10
        );
      }

      if (corner.includes("bottom")) {
        newSize.height = Math.min(
          Math.max(120, prevSizeState.height + dy),
          window.innerHeight - position.top - 10
        );
      } else if (corner.includes("top")) {
        newSize.height = Math.min(
          Math.max(120, prevSizeState.height - dy),
          position.top + prevSizeState.height - 10
        );
      }

      return newSize;
    });

    setPosition((prevPos) => {
      const newPos = { ...prevPos };
      const { corner } = resizing.current;

      if (corner.includes("left")) {
        const newLeft = prevPos.left + dx;
        newPos.left = Math.max(10, newLeft);
      }

      if (corner.includes("top")) {
        const newTop = prevPos.top + dy;
        newPos.top = Math.max(10, newTop);
      }

      return newPos;
    });
  };

  const stopResize = () => {
    resizing.current = { active: false, corner: "" };
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
  };

  // Extraer ID de YouTube
  const extractYouTubeId = (url) => {
    const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([^?&]+)/);
    return match?.[1] || "";
  };

  const videoId = extractYouTubeId(url);

  const embedSrc =
    type === "youtube"
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1`
      : type === "spotify"
      ? url.replace("/track/", "/embed/track/")
      : "";

  // Minimizar / maximizar
  const handleMinimize = () => {
    if (!minimized) {
      prevPosition.current = position;
      prevSize.current = size;
      setPosition({
        top: window.innerHeight - 50 - 10,
        left: window.innerWidth - 400 - 10,
      });
      setSize({ width: 400, height: 40 });
      setMinimized(true);
    } else {
      setPosition(prevPosition.current);
      setSize(prevSize.current);
      setMinimized(false);
    }
  };

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
        height: minimized ? size.height : "auto",
        borderRadius: 12,
        overflow: "hidden",
        userSelect: "none",
        cursor: minimized ? "default" : "default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        onMouseDown={startDrag}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#d63b1f",
          color: "#fff",
          padding: "4px 12px",
          cursor: minimized ? "default" : "move",
          height: 40,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "bold",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: minimized ? 320 : "100%",
          }}
          title={title}
        >
          Sonargram - {title}
        </Typography>

        <Box>
          <IconButton
            onClick={handleMinimize}
            size="small"
            sx={{ color: "#fff" }}
            title={minimized ? "Maximizar" : "Minimizar"}
          >
            {minimized ? <ExpandLess /> : <ExpandMore />}
          </IconButton>

          <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* iFrame */}
      <iframe
        width={size.width}
        height={minimized ? 0 : size.height}
        src={embedSrc}
        frameBorder="0"
        allow={
          type === "youtube"
            ? "autoplay; encrypted-media"
            : "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        }
        allowFullScreen
        title="Media Player"
        style={{
          display: minimized ? "none" : "block",
          pointerEvents: resizing.current.active ? "none" : "auto",
          transition: "height 0.3s ease",
        }}
      />

      {/* Resize Handles */}
      {!minimized &&
        [
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

export default FloatingMediaPlayer;
