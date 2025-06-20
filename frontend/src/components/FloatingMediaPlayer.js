import React, { useRef, useState } from "react";
import { IconButton, Paper, Typography, Box } from "@mui/material";
import { Close } from "@mui/icons-material";

const FloatingMediaPlayer = ({ type, url, onClose }) => {
  const dragRef = useRef(null);
  const [position, setPosition] = useState({
    top: window.innerHeight - 320,
    left: window.innerWidth - 520,
  });
  const [size, setSize] = useState({ width: 480, height: 270 });
  const offset = useRef({ x: 0, y: 0 });
  const resizing = useRef({ active: false, corner: "" });
  const dragging = useRef(false);

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
      top: e.clientY - offset.current.y,
      left: e.clientX - offset.current.x,
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
      const { corner } = resizing.current;

      if (corner.includes("right")) {
        newSize.width = Math.max(200, prevSize.width + dx);
      } else if (corner.includes("left")) {
        newSize.width = Math.max(200, prevSize.width - dx);
      }

      if (corner.includes("bottom")) {
        newSize.height = Math.max(120, prevSize.height + dy);
      } else if (corner.includes("top")) {
        newSize.height = Math.max(120, prevSize.height - dy);
      }

      return newSize;
    });

    setPosition((prevPos) => {
      const newPos = { ...prevPos };
      const { corner } = resizing.current;

      if (corner.includes("left")) {
        newPos.left = prevPos.left + dx;
      }

      if (corner.includes("top")) {
        newPos.top = prevPos.top + dy;
      }

      return newPos;
    });
  };

  const stopResize = () => {
    resizing.current = { active: false, corner: "" };
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
  };

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
        borderRadius: 12,
        overflow: "hidden",
        userSelect: "none",
        cursor: "default",
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

      {/* iFrame */}
      <iframe
        width="100%"
        height={size.height}
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
          display: "block",
          pointerEvents: resizing.current.active ? "none" : "auto",
        }}
      />

      {/* Resize Handles */}
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

export default FloatingMediaPlayer;
