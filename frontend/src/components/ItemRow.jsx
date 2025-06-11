import React from "react";
import { Typography, IconButton } from "@mui/material";
import RatingDisplay from "./RatingDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart as solidHeart,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";

function formatDuration(ms) {
  if (!ms) return "";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const ItemRow = ({
  item,
  type,
  ratingProps,
  favoriteCounts = {},
  isFavorite,
  onToggleFavorite,
  onAddClick,
  onClickItem,
  highlightColor,
  compact = false,
}) => {
  const showCover = type === "album" && item.coverUrl;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: compact ? "none" : "1px solid #ddd",
        padding: compact ? "0" : "6px 0",
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

      <span
        onClick={onClickItem ? () => onClickItem(item.id) : undefined}
        style={{
          color: highlightColor || "black",
          textDecoration: onClickItem ? "underline" : "none",
          flexGrow: 1,
          cursor: onClickItem ? "pointer" : "default",
        }}
      >
        {type === "album"
          ? `${item.title}${
              item.artist
                ? " — " + item.artist
                : item.artistName
                ? " — " + item.artistName
                : ""
            }`
          : type === "song"
          ? `${item.title}${
              item.album || item.albumName
                ? " — " + (item.album || item.albumName)
                : ""
            }${
              item.artist || item.artistName
                ? " — " + (item.artist || item.artistName)
                : ""
            }`
          : item.name || item.title}
      </span>

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
        mbid={item.id}
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
      />

      {type === "song" && (
        <IconButton
          onClick={() => onAddClick(item)}
          size="small"
          title="Añadir a lista"
          sx={{ ml: 1 }}
        >
          <FontAwesomeIcon icon={faPlus} />
        </IconButton>
      )}

      <IconButton
        onClick={() => onToggleFavorite(item.id, type)}
        color={isFavorite(item.id) ? "error" : "default"}
        size="small"
      >
        <FontAwesomeIcon
          icon={isFavorite(item.id) ? solidHeart : regularHeart}
        />
      </IconButton>
      <Typography variant="body2" sx={{ ml: 1, minWidth: 25 }}>
        {favoriteCounts[item.id] || 0}
      </Typography>
    </div>
  );
};

export default ItemRow;
