// components/TopRatingsList.jsx
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
import { getTopRatingsByType } from "../api/internal/ratingApi";
import { useTranslation } from "react-i18next";
import ItemRow from "./ItemRow";

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

function TopRatingsList({
  limit = 5,
  title = "Items con Mejor Rating",
  setLoading,
  ratingProps = {},
  favoriteProps = {},
  onAddClick = () => { },
  onRatingsDataUpdate = () => { },
}) {
  const { t } = useTranslation();
  const { token } = useContext(UserContext);
  const [topRatingsByType, setTopRatingsByType] = useState({
    artist: [],
    album: [],
    song: [],
  });

  useEffect(() => {
    async function fetchTopRatings() {
      try {
        setLoading(true);
        const data = await getTopRatingsByType(limit, token);
        const formattedData = data.reduce(
          (acc, curr) => {
            acc[curr._id] = curr.ratings || [];
            return acc;
          },
          { artist: [], album: [], song: [] }
        );
        setTopRatingsByType(formattedData);
        onRatingsDataUpdate(formattedData);
        console.log('FORMATTED DATA RATINGS', formattedData)
      } catch (error) {
        console.error(t("errorFetchingTopRatings"), error);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchTopRatings();
  }, [token, limit, setLoading, t]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
      <Typography variant="h4" mb={2}>
        {title}
      </Typography>
      <AccordionBox>
        {["artist", "album", "song"].map((type) => (
          <CustomAccordion key={type}>
            <AccordionSummary
              expandIcon={<FontAwesomeIcon icon={faCaretDown} />}
              sx={{ backgroundColor: "#d63b1f", color: "white", borderRadius: 2, height: "20px" }}
            >
              <Typography variant="h5" textTransform="capitalize">
                {type === "song" ? t("songs") : `${type}s`} {t("bestRated")}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Card sx={{ width: "100%" }}>
                <CardContent>
                  {topRatingsByType[type].length === 0 ? (
                    <Typography>{t("noDataAvailable")}</Typography>
                  ) : (
                    topRatingsByType[type].map((item) => {
                      const id = item.mbid || item._id;
                      const itemData = {
                        ...item,  // <-- aquí el objeto completo tal cual
                        id: id,
                        average: item.average,
                        count: item.count,
                      };
                      return (
                        <ItemRow
                          key={id}
                          item={itemData}
                          type={type}
                          ratingProps={{
                            showRating: true,
                            average: item.average,
                            count: item.count,
                            ...ratingProps,
                          }}
                          favoriteCounts={favoriteProps.favoriteCounts || {}}
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

export default TopRatingsList;
