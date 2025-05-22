// components/RatingDisplay.js
import { Box, Typography, IconButton } from "@mui/material";
import Rating from "@mui/material/Rating";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { styled } from '@mui/material/styles';
import { faRecordVinyl } from '@fortawesome/free-solid-svg-icons';
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

  // Estilo personalizado para el Rating
  const StyledRating = styled(Rating)({
    '& .MuiRating-iconFilled': {
      color: '#FFD700', // dorado
    },
    '& .MuiRating-iconHover': {
      color: '#FFC107', // dorado más intenso al pasar el mouse
    },
    '& .MuiRating-icon': {
      fontSize: '18px', // tamaño más pequeño
      marginRight: '2px', // espacio entre íconos
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
        {average ? `${average.toFixed(1)} (${count})` : "Sin valoraciones"}
      </Typography>
      {userRating && (
        <IconButton onClick={handleDelete}>
            <FontAwesomeIcon icon={faTrashAlt} style={{ color: "gray" }} />
        </IconButton>
      )}
    </Box>
  );
};

export default RatingDisplay;
