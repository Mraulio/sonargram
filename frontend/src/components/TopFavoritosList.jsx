import { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  styled,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../context/UserContext";
import { useTranslation } from "react-i18next";
import * as api from "../api/internal/favoriteApi";
import ItemRow from "./ItemRow";

const AccordionBox = styled(Box)`
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  width: 100%;
  gap: 20px;
`;

const CustomAccordion = styled(Accordion)`
  width: 100%;
  gap: 20px;
`;

function TopFavoritosList({
  limit = 5,
  title = "Items más Favoritos",
  setLoading,
  favoriteProps = {},
  ratingProps = {},
  onAddClick = () => { },
  onFavoritesDataUpdate = () => { },

}) {
  const { t } = useTranslation();
  const { token } = useContext(UserContext);
  const [favoritesByType, setFavoritesByType] = useState({
    artist: [],
    album: [],
    song: [],
  });

  useEffect(() => {
    async function fetchTopFavorites() {
      try {
        setLoading(true);
        const data = await api.getTopFavorites(limit, token);
        const formattedData = data.reduce(
          (acc, curr) => {
            acc[curr._id] = curr.favorites || [];
            return acc;
          },
          { artist: [], album: [], song: [] }
        );
        setFavoritesByType(formattedData);
        onFavoritesDataUpdate(formattedData);
      } catch (error) {
        console.error(t("errorFetchingTopRatings"), error);
      } finally {
        setLoading(false);
      }
    }

    if (token) fetchTopFavorites();
  }, [token, limit, setLoading, t]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
      <Typography variant="h4" mb={2}>{title}</Typography>
      <AccordionBox>
        {["artist", "album", "song"].map((type) => (
          <CustomAccordion key={type}>
            <AccordionSummary
              expandIcon={<FontAwesomeIcon icon={faCaretDown} />}
              sx={{ backgroundColor: "#d63b1f", color: "white", borderRadius: 2, height: "20px" }}
            >
              <Typography variant="h5" textTransform="capitalize">
                {type === "song" ? t("songs") : `${type}s`} {t("mostLiked") || "más populares"}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Card sx={{ width: "100%" }}>
                <CardContent>
                  {favoritesByType[type].length === 0 ? (
                    <Typography>{t("noDataAvailable")}</Typography>
                  ) : (
                    favoritesByType[type].map((item) => {
                      const id = item.mbid || item._id;
                      const itemData = {
                        ...item.data,
                        id: item.data.mbid || item.data._id,
                      };

                      return (
                        <ItemRow
                          key={id}
                          item={itemData}
                          type={type}
                          ratingProps={ratingProps}
                          favoriteCounts={favoriteProps.favoriteCounts}
                          isFavorite={
                            favoriteProps.isFavorite
                              ? () => favoriteProps.isFavorite(itemData.id)
                              : () => false
                          }
                          onToggleFavorite={
                            favoriteProps.handleFavoriteToggle
                              ? () => favoriteProps.handleFavoriteToggle(itemData.id, type, itemData)
                              : () => { }
                          }
                          onAddClick={() => onAddClick(itemData)}
                          compact={true}
                          showAddButton={type === "song"}
                        />
                      );
                    })
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
