import { Box, Typography, IconButton } from "@mui/material";
import Rating from "@mui/material/Rating";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { styled } from "@mui/material/styles";
import { faRecordVinyl } from "@fortawesome/free-solid-svg-icons";

const RatingDisplay = ({
  mbid,
  type,
  getItemStats,
  getRatingFor,
  rateItem,
  deleteRating,
}) => {
  const { average, count } = getItemStats(mbid);
  const userRating = getRatingFor(mbid, type);

  const handleChange = (_, newValue) => {
    if (newValue !== null) {
      rateItem(mbid, type, newValue);
    }
  };

  const handleDelete = () => {
    deleteRating(mbid);
  };

  const StyledRating = styled(Rating)({
    "& .MuiRating-iconFilled": {
      color: "#FFD700",
    },
    "& .MuiRating-iconHover": {
      color: "#FFC107",
    },
    "& .MuiRating-icon": {
      fontSize: "18px",
      marginRight: "2px",
    },
  });

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <StyledRating
        name={`rating-${mbid}`}
        precision={0.5}
        value={userRating}
        onChange={handleChange}
        icon={<FontAwesomeIcon icon={faRecordVinyl} fontSize="inherit" />}
        emptyIcon={<FontAwesomeIcon icon={faRecordVinyl} fontSize="inherit" />}
      />
      <Typography variant="body2" color="text.secondary">
        {average !== null ? `${average.toFixed(1)} (${count})` : "Sin valoraciones"}
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
