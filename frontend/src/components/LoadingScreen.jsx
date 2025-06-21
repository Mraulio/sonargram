import React from "react";
import { Box, Backdrop } from "@mui/material";
import { keyframes } from "@emotion/react";

// Animación de rotación profesional (suave y continua)
const rotate = keyframes`
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
`;

const FullScreenLoader = ({ open = false }) => {
  return (
    <Backdrop
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 9999,
        color: "#fff",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
      }}
      open={open}
    >
      <Box
        component="img"
        src={"/assets/images/logo.svg"} // Asegúrate que esta ruta sea válida
        alt="Logo cargando"
        sx={{
          width: 120,
          height: 120,
          animation: `${rotate} 2s infinite ease-in-out`,
          transformOrigin: "center",
        }}
      />
    </Backdrop>
  );
};

export default FullScreenLoader;
