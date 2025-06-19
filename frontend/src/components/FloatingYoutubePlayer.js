import React, { useRef, useState } from "react";
import { IconButton, Paper, Typography, Box } from "@mui/material";
import { Close } from "@mui/icons-material";

const FloatingYouTubePlayer = ({ url, onClose }) => {
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const [position, setPosition] = useState({ top: 100, left: 100 });
  const [size, setSize] = useState({ width: 340, height: 180 });
  const offset = useRef({ x: 0, y: 0 });
  const resizing = useRef(false);
  const dragging = useRef(false);

  const startDrag = (e) => {
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
      top: e.clientY - offset.current.y,
      left: e.clientX - offset.current.x,
    });
  };

  const stopDrag = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", stopDrag);
  };

  const startResize = (e) => {
    e.stopPropagation();
    resizing.current = true;
    offset.current = {
      x: e.clientX,
      y: e.clientY,
    };
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
  };

  const handleResize = (e) => {
    if (!resizing.current) return;
    const dx = e.clientX - offset.current.x;
    const dy = e.clientY - offset.current.y;
    setSize((prev) => ({
      width: Math.max(200, prev.width + dx),
      height: Math.max(120, prev.height + dy),
    }));
    offset.current = { x: e.clientX, y: e.clientY };
  };

  const stopResize = () => {
    resizing.current = false;
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
  };

  const extractVideoId = (url) => {
    const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([^?&]+)/);
    return match?.[1] || "";
  };

  const videoId = extractVideoId(url);

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
        cursor: "default",
        paddingBottom: 8,
        borderRadius: 12,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Encabezado */}
      <Box
        onMouseDown={startDrag}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#d63b1f",
          color: "#fff",
          padding: "4px 12px",
          cursor: "move",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          Sonargram
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      {/* Video */}
      <iframe
        width="100%"
        height={size.height}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="YouTube Video"
        style={{ display: "block" }}
      />

      {/* Resize handle */}
      <Box
        ref={resizeRef}
        onMouseDown={startResize}
        sx={{
          width: 16,
          height: 16,
          position: "absolute",
          bottom: 0,
          right: 0,
          cursor: "nwse-resize",
          backgroundColor: "transparent",
        }}
      />
    </Paper>
  );
};

export default FloatingYouTubePlayer;
