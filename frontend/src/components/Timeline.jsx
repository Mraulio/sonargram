/* src/components/Timeline.js */
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import useActivity from "../hooks/useActivity";
import ActivityCard from "./ActivityCard";
import { Typography, Box, Card, CardContent, Divider } from "@mui/material";
import useRatings from "../hooks/useRatings";
import useFavorites from "../hooks/useFavorites";
import { useTranslation } from 'react-i18next';
import LoadingScreen from "../components/LoadingScreen.jsx";
import { showToast } from '../utils/toast';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListUl,
  faHeart,
  faMedal,
  faMoon,
  faSun,
  faXmark,
  faMagnifyingGlass
} from '@fortawesome/free-solid-svg-icons';

const Timeline = () => {
  const { t } = useTranslation();  // Hook para obtener las traducciones
  const { token } = useContext(UserContext);
  const { activities, loading, error, fetchTimeline } = useActivity(token);

  const ratingProps = useRatings(token);
  const favoriteProps = useFavorites(token);

  const [favoriteCounts, setFavoriteCounts] = useState({});

  useEffect(() => {
    if (token) fetchTimeline();
  }, [token, fetchTimeline]);

  useEffect(() => {
    if (activities.length > 0 && Object.keys(favoriteCounts).length === 0) {
      Promise.all(
        activities.map(act => favoriteProps.getFavoriteCount(act.targetId || act.mbid || act._id))
      ).then(countsArray => {
        const countsMap = {};
        activities.forEach((act, idx) => {
          const id = act.targetId || act.mbid || act._id;
          countsMap[id] = countsArray[idx] || 0;
        });
        setFavoriteCounts(countsMap);
      });
    }
  }, [activities, favoriteProps, favoriteCounts]);

  useEffect(() => {
    if (activities.length > 0) {
      const mbids = activities.map(act => act.targetId || act.mbid || act._id);
      ratingProps.fetchMultipleItemRatings(mbids);
    }
  }, [activities, ratingProps.fetchMultipleItemRatings]);


  const handleFavoriteToggle = async (id, type, item) => {
    try {
      if (favoriteProps.isFavorite(id)) {
        await favoriteProps.removeFavorite(id);
      } else {
        await favoriteProps.addFavorite(
          id,
          type,
          item?.title || item?.name || "",
          item?.artist || item?.artistName || "",
          item?.coverUrl || "",
          item?.releaseDate || "",
          item?.duration || "",
          item?.spotifyUrl || "",   // <-- añadir aquí
          item?.youtubeUrl || ""    // <-- añadir aquí
        );
      }

      const newCount = await favoriteProps.getFavoriteCount(id);
      setFavoriteCounts((prev) => ({
        ...prev,
        [id]: newCount,
      }));
    } catch (e) {
      console.error("Error alternando favorito", e);
    }
  };

  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box sx={{ width: '100%', marginTop:'5px'}}>
      {activities.length === 0 ? (
       
        <Card sx={{width:'100%', display: 'flex', justifyContent:'center', p:4, marginTop: '5px'}}>
          <Divider/>
          <CardContent sx={{ display:'flex', flexDirection:'column', gap: 4}}>
            <Typography variant='h5'>{t('welcomeToSonargram')}</Typography>
            <Typography>{t('message')}</Typography>
            <Typography>{t('message2')} <FontAwesomeIcon style={{ fontSize: 20, color:'#d63b1f'  }} icon={faMagnifyingGlass} /></Typography>
            <Typography>{t('message3')}</Typography>
            <Typography>{t('message4')} <FontAwesomeIcon style={{ fontSize: 20, color:'#d63b1f'  }} icon={faListUl} /></Typography>
            <Typography>{t('message5')}</Typography>
            <Typography>{t('message6')} <FontAwesomeIcon style={{ fontSize: 20, color:'#d63b1f'  }} icon={faMedal} /></Typography>
            <Typography>{t('endMessage')}</Typography>
          </CardContent>
          <Divider/>
        </Card>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            {t('timeline')}
          </Typography>
          {activities.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              ratingProps={ratingProps}
              favoriteProps={{
                ...favoriteProps,
                favoriteCounts,
                setFavoriteCounts,
                handleFavoriteToggle,
              }}
            />
          ))}
        </>
      )}
      <LoadingScreen open={loading} />
    </Box>
  );
};

export default Timeline;
