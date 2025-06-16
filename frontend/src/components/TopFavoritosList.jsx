import { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Divider,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  styled
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../context/UserContext";
import { getTopFavorites } from "../api/internal/favoriteApi";
import { useTranslation } from "react-i18next";

const AccordionBox = styled(Box)`
  display: flex;
  justify-content: space-around;
  width: 100%;

  @media (max-width: 920px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const CustomAccordion = styled(Accordion)`
  width: 30%;
  @media (max-width: 920px) {
    width: 100%;
  }
`;

function TopFavoritosList({ limit = 5, title = "Items Más Gustados" }) {
  const { t } = useTranslation();
  const { token } = useContext(UserContext);
  const [topFavorites, setTopFavorites] = useState({
    artist: [],
    album: [],
    song: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopFavorites() {
      try {
        const data = await getTopFavorites(limit, token);
        const formattedData = data.reduce(
          (acc, curr) => {
            acc[curr._id] = curr.favorites || [];
            return acc;
          },
          { artist: [], album: [], song: [] }
        );
        setTopFavorites(formattedData);
        
      } catch (error) {
        console.error(t("errorFetchingTopFavorites") || "Error cargando favoritos populares", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopFavorites();
  }, [token, limit]);

  function getItemName(item, type) {
  const fallback = "Sin nombre";

  switch (type) {
    case "artist":
      return item?.data?.name || item?.title || fallback;
    case "album":
      return item?.data?.title || item?.data?.name || item?.title || fallback;
    case "song":
      // Solo canciones pueden tener claves de traducción como "song.title01"
      return t(item?.title, { defaultValue: item?.data?.title || item?.title || fallback });
    default:
      return item?.name || fallback;
  }
}

  if (loading) {
    return <Typography>{t("loadingTopFavorites") || "Cargando favoritos populares..."}</Typography>;
  }

  return (
    <Box sx={{ width: "100vw", display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
      <Typography variant="h4" mb={2}>
        {title}
      </Typography>

      <AccordionBox>
        {["artist", "album", "song"].map((type) => (
          <CustomAccordion key={type}>
            <AccordionSummary expandIcon={<FontAwesomeIcon icon={faCaretDown} />} sx={{ backgroundColor: '#d63b1f', color: 'white', borderRadius: 2 }}>
              <Typography variant="h5" textTransform="capitalize">
                {type === "song" ? t("songs") : `${type}s`} {t("mostLiked") || "más populares"}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Card sx={{ width: "100%" }}>
                <CardContent>
                  {topFavorites[type].length === 0 ? (
                    <Typography>{t("noDataAvailable") || "No hay datos disponibles."}</Typography>
                  ) : (
                    topFavorites[type].map((item) => (
                      <Box
                        key={item.favoriteId}
                        mt={1}
                        p={1}
                        borderRadius={1}
                        bgcolor="background.default"
                      >
                        <Typography fontWeight="bold">{getItemName(item, type)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t("count") || "Cantidad"}: {item.count}
                        </Typography>
                        <Divider sx={{ mt: 1 }} />
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </AccordionDetails>
          </CustomAccordion>
        ))}
      </AccordionBox>
    </Box>
  );
}

export default TopFavoritosList;