// components/TopRatingsList.jsx
import { useEffect, useState, useContext } from "react";
import { Box, Typography, Divider, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, styled } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../context/UserContext";
import { getTopRatingsByType } from "../api/internal/ratingApi";
import { useTranslation } from 'react-i18next';

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

function TopRatingsList({ limit = 5, title = "Items con Mejor Rating" }) {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const { token } = useContext(UserContext);
  const [topRatings, setTopRatings] = useState({
    artist: [],
    album: [],
    song: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopRatings() {
      try {
        const data = await getTopRatingsByType(limit, token);
        const formattedData = data.reduce(
          (acc, curr) => {
            acc[curr._id] = curr.ratings || [];
            return acc;
          },
          { artist: [], album: [], song: [] }
        );

        setTopRatings(formattedData);
      } catch (error) {
        console.error(t('errorFetchingTopRatings'), error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopRatings();
  }, [token, limit]);

  function getItemName(item, type) {
    switch (type) {
      case "artist":
        return t(item.title) || t(item.data?.name) || "Sin nombre";
      case "album":
        return t(item.title) || t(item.data?.title) || item.data?.name || "Sin nombre";
      case "song":
        return t(item.title) || t(item.data?.title) || "Sin nombre";
      default:
        return item.name || "Sin nombre";
    }
  }

  if (loading) {
    return <Typography>Cargando ratings más altos...</Typography>;
  }

   return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
      <Typography variant="h4" mb={2}>
        {title}
      </Typography>
      <AccordionBox>

      {["artist", "album", "song"].map((type) => (
        <CustomAccordion key={type}>
          <AccordionSummary expandIcon={<FontAwesomeIcon icon={faCaretDown} />} sx={{ backgroundColor: '#d63b1f', color: 'white', borderRadius: 2 }}>
            <Typography variant="h5" textTransform="capitalize">
              {type === "song" ? t("songs") : `${type}s`} {t("bestRated")}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Card sx={{ width: "100%" }}>
              <CardContent>
                {topRatings[type].length === 0 ? (
                  <Typography>{t("noDataAvailable")}</Typography>
                ) : (
                  topRatings[type].map((item) => (
                    <Box
                      key={item.mbid || item._id}
                      mt={1}
                      p={1}
                      borderRadius={1}
                      bgcolor="background.default"
                    >
                      <Typography fontWeight="bold">{getItemName(item, type)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("averageRating")}: {item.average?.toFixed(2) ?? "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {t("votesNumber")}: {item.count ?? 0}
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

export default TopRatingsList;