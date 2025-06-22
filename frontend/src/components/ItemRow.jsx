import { useMediaPlayer } from "../context/MediaPlayerContext";
import { Typography, IconButton, useTheme, Box } from "@mui/material";
import RatingDisplay from "./RatingDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart as solidHeart,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faSpotify, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";

function formatDuration(ms) {
  if (!ms) return "";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const ItemRow = ({
  item,
  list,
  type,
  ratingProps,
  favoriteCounts = {},
  isFavorite,
  onToggleFavorite,
  onAddClick,
  onClickItem,
  highlightColor,
  compact = false,
  onDeleteFromList
}) => {
  const showCover = type === "album" && item.coverUrl;
  const theme = useTheme();
  const { openMedia } = useMediaPlayer();

  const handleYouTubeClick = () => {
    const url = item?.externalLinks?.youtubeUrl || item?.youtubeUrl;
    if (url) openMedia("youtube", url, item.title);
  };

  const handleSpotifyClick = () => {
    const url = item?.externalLinks?.spotifyUrl || item?.spotifyUrl;
    if (url) openMedia("spotify", url, item.title);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.palette.background.secondary, // gris claro
        borderRadius: 2,           // bordes redondeados
        margin: "8px 0",           // margen arriba y abajo
        padding: "10px 15px",      // padding para espacio interno
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)", // sombra sutil para profundidad
        border: "1px solid #ddd",  // borde suave
        width: { xs: '150vw', md: '100%' }
      }}
    >
      {showCover && (
        <img
          src={item.coverUrl}
          alt="Cover"
          style={{
            width: 40,
            height: 40,
            objectFit: "cover",
            marginRight: 8,
            borderRadius: 4,
          }}
        />
      )}

      <Typography
        onClick={onClickItem ? () => onClickItem(item.id) : undefined}
        sx={{
          color: "text.primary",
          textDecoration: onClickItem ? "underline" : "none",
          flexGrow: 1,
          fontWeight: "bold", // negrita
          cursor: onClickItem ? "pointer" : "default",
        }}
      >
        {type === "album"
          ? `${item.title}${item.artist
            ? " — " + item.artist
            : item.artistName
              ? " — " + item.artistName
              : ""
          }`
          : type === "song"
            ? `${item.title}${item.album || item.albumName
              ? " — " + (item.album || item.albumName)
              : ""
            }${item.artist || item.artistName
              ? " — " + (item.artist || item.artistName)
              : ""
            }`
            : item.name || item.title}
      </Typography>

      <Typography
        variant="body2"
        sx={{ mr: 2, minWidth: 60, textAlign: "right" }}
      >
        {type === "song"
          ? formatDuration(item.duration)
          : type === "album"
            ? item?.releaseDate?.split("-")[0] || ""
            : ""}
      </Typography>

      <RatingDisplay
        mbid={item.id || item.musicbrainzId}
        type={type}
        getItemStats={ratingProps.getItemStats}
        getRatingFor={ratingProps.getRatingFor}
        rateItem={ratingProps.rateItem}
        deleteRating={ratingProps.deleteRating}
        title={item.title}
        artistName={item.artist || item.artistName}
        coverUrl={item.coverUrl}
        releaseDate={item.releaseDate}
        duration={item.duration}
        spotifyUrl={item?.spotifyUrl || item?.externalLinks?.spotifyUrl}
        youtubeUrl={item?.youtubeUrl || item?.externalLinks?.youtubeUrl}
      />

      {type === "song" && (
        <IconButton
          onClick={() => {
            console.log('ITEM PULSADO', item);
            onAddClick(item)
          }}
          size="small"
          title="Añadir a lista"
          sx={{ ml: 1 }}
        >
          <FontAwesomeIcon icon={faPlus} style={{ color: '#d63b1f' }} />
        </IconButton>
      )}

      {/* Botón Spotify */}
      {(item?.externalLinks?.spotifyUrl?.trim() || item?.spotifyUrl?.trim()) && (
        <IconButton
          onClick={handleSpotifyClick}
          size="small"
          title="Escuchar en Spotify"
          sx={{ ml: 1, color: "#1DB954" }}
        >
          <FontAwesomeIcon icon={faSpotify} />
        </IconButton>
      )}

      {/* Botón YouTube */}
      {(item?.externalLinks?.youtubeUrl?.trim() || item?.youtubeUrl?.trim()) && (
        <IconButton
          onClick={handleYouTubeClick}
          size="small"
          title="Ver en YouTube"
          sx={{ ml: 1, color: "#FF0000" }}
        >
          <FontAwesomeIcon icon={faYoutube} />
        </IconButton>
      )}


      <IconButton
        onClick={() => onToggleFavorite(item.id || item.musicbrainzId, type, item)}
        color={isFavorite(item.id || item.musicbrainzId) ? "error" : "default"}
        size="small"
      >
        <FontAwesomeIcon
          icon={isFavorite(item.id || item.musicbrainzId) ? solidHeart : regularHeart}
        />
      </IconButton>
      <Typography variant="body2" sx={{ ml: 1, minWidth: 25 }}>
        {favoriteCounts[item.id || item.musicbrainzId] || 0}
      </Typography>
      {onDeleteFromList && (
        <IconButton

          onClick={() => {
            console.log("🔴 Eliminar de lista → item.id:", item.musicbrainzId);
            console.log("🔴 Eliminar de lista → list:", list);
            onDeleteFromList(list, item.musicbrainzId);
          }}

          size="small"
          title="Eliminar de la lista"
          sx={{ color: 'gray', ml: 1 }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      )}
      { }

    </Box>
  );
};

export default ItemRow;
