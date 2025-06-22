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
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faHeart } from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../context/UserContext";
import { getTopRatingsByType } from "../api/internal/ratingApi";
import useFavorites from "../hooks/useFavorites";
import { useTranslation } from "react-i18next";
import * as api from '../api/internal/favoriteApi';

const AccordionBox = styled(Box)`
  display: flex; 
  justify-content: space-around; 
  flex-direction: column; 
  width: 100%;
  gap: 20px;

  @media (max-width: 920px) {
    flex-direction: column; 
    gap: 20px;
  }

`;

const CustomAccordion = styled(Accordion)`
  width: 100%;
  gap: 20px;
  @media (max-width: 920px) {
    width: 100%; 
  }
`;

function TopRatingsList({ limit = 5, title = "Items con Más Likes", setLoading}) {
  const { t } = useTranslation();
  const { token } = useContext(UserContext);
  const [topRatings, setTopRatings] = useState({ artist: [], album: [], song: [] });
  const { getFavoriteCount, favoriteCounts } = useFavorites(token);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
  async function fetchTopFavorites() {
    try {
      const data = await api.getTopFavorites(limit, token);
      const formattedData = data.reduce(
        (acc, curr) => {
          acc[curr._id] = curr.favorites || [];
          return acc;
        },
        { artist: [], album: [], song: [] }
      );
      setFavorites(formattedData);
    } catch (error) {
      console.error(t("errorFetchingTopRatings"), error);
    } finally {
      setLoading(false);
    }
  }

  fetchTopFavorites();
}, [token, limit]);

  function getItemName(item, type) {
    const base = item.data || {};
    return (
      item.title ||
      base.title ||
      base.name ||
      item.name ||
      t("unnamed") || "Sin nombre"
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 2,
      }}
    >
      <Typography variant="h4" mb={2}>
        {title}
      </Typography>

      <AccordionBox>
        {["artist", "album", "song"].map((type) => (
          <CustomAccordion key={type}>
            <AccordionSummary
              expandIcon={<FontAwesomeIcon icon={faCaretDown} />}
              sx={{ backgroundColor: "#d63b1f", color: "white", borderRadius: 2 }}
            >
              <Typography variant="h5" textTransform="capitalize">
                {type === "song" ? t("songs") : `${type}s`} {t("mostLiked") || "más populares"}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Card sx={{ width: "100%" }}>
                <CardContent>
                  {favorites[type]?.length === 0 ? (
                    <Typography>{t("noDataAvailable")}</Typography>
                  ) : (
                    <List dense>
                      {favorites[type]?.map((item, index) => {
                const id = item.favoriteId || item._id || item.data?.mbid || item.data?._id || index;
                const name = getItemName(item, type);
                const likes = item.count ?? 0;

                return (
                  <ListItem key={id} sx={{ gap: 2 }}>
                    <ListItemText
                      primary={
                        <>
                          <Typography component="span" fontWeight="bold">
                            {name}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.secondary" ml={1}>
                            ❤️ {likes} {t("likes")}
                          </Typography>
                          <Divider />
                        </>
                      }
                    />
                  </ListItem>
                );
              })}
                    </List>
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

export default TopRatingsList;
