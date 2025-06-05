const axios = require("axios");
const express = require("express");
const router = express.Router();

async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await axios.get(url, options);
      return response;
    } catch (error) {
      if (error.response?.status === 503 && i < retries) {
        console.warn(`503 recibido. Reintentando en ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // Backoff exponencial
      } else {
        throw error;
      }
    }
  }
}

router.get("/:service/*", async (req, res) => {
  const { service } = req.params;
  const path = req.params[0];
  const queryString = new URLSearchParams(req.query).toString();

  let baseUrl;

  if (service === "musicbrainz") {
    baseUrl = "https://musicbrainz.org";
  } else if (service === "coverartarchive.org") {
    baseUrl = "https://coverartarchive.org";
  } else {
    return res.status(400).json({ error: "Servicio proxy desconocido" });
  }

  const url = `${baseUrl}/${path}${queryString ? "?" + queryString : ""}`;

  try {
    const response = await fetchWithRetry(url, {
      headers: {
        "User-Agent": "TuApp/1.0 (tuemail@ejemplo.com)",
        Accept: "application/json",
      },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404 && service === "coverartarchive.org") {
        console.warn(`⚠️ Imagen no encontrada para ${url}`);
        return res
          .status(404)
          .json({ notFound: true, error: "Imagen no encontrada" });
      }
      res
        .status(error.response.status)
        .json({ error: error.response.statusText });
    } else {
      res
        .status(500)
        .json({ error: "Error en el proxy", details: error.message });
    }
  }
});

module.exports = router;
