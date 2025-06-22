import { Box, Typography, IconButton } from "@mui/material";
import Rating from "@mui/material/Rating";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { styled } from "@mui/material/styles";
import { faRecordVinyl, faUser, faMusic } from "@fortawesome/free-solid-svg-icons";

const RatingDisplay = ({
  mbid,
  type,
  getItemStats,
  getRatingFor,
  rateItem,
  deleteRating,
  title,
  artistName,
  coverUrl,
  releaseDate,
  duration,
  spotifyUrl,
  youtubeUrl
}) => {
  const { average, count } = getItemStats(mbid);
  const userRating = getRatingFor(mbid, type);

  const handleChange = (_, newValue) => {
    if (newValue !== null) {
      rateItem(
        mbid,
        type,
        newValue,
        title,
        artistName,
        coverUrl,
        releaseDate,
        duration,
        spotifyUrl || "",
        youtubeUrl || ""
      );
    }
  };


  const handleDelete = () => {
    deleteRating(mbid);
  };

  const StyledRating = styled(Rating)({
    "& .MuiRating-iconFilled": {
      color: "#FFCC33", // amarillo dorado brillante
      textShadow: "0 0 8px #FF9900", // resplandor anaranjado
    },
    "& .MuiRating-iconHover": {
      color: "#FF9900", // dorado anaranjado fuerte
    },
    "& .MuiRating-icon": {
      fontSize: "18px",
      marginRight: "2px",
    },
  });

  const getIconByType = (type) => {
    switch (type) {
      case "artist":
        return faUser;
      case "album":
        return faRecordVinyl;
      case "song":
        return faMusic;
      default:
        return faRecordVinyl;
    }
  };


  return (
    <Box display="flex" alignItems="center" gap={1}>
      <StyledRating
        name={`rating-${mbid}`}
        precision={0.5}
        value={userRating}
        onChange={handleChange}
        icon={<FontAwesomeIcon icon={getIconByType(type)} fontSize="inherit" />}
        emptyIcon={<FontAwesomeIcon icon={getIconByType(type)} fontSize="inherit" />}
      />
      <Typography variant="body2" color="text.secondary">
        {average !== null ? `${average.toFixed(1)} (${count})` : "(0)"}
      </Typography>
      {userRating && (
        <IconButton onClick={handleDelete} size="small">
          <FontAwesomeIcon icon={faTrashAlt} style={{ color: "gray" }} />
        </IconButton>
      )}
    </Box>
  );
};

export default RatingDisplay;
