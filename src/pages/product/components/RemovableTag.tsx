import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Typography } from "@mui/material";

interface RemovableTagProps {
  label: string;
  onRemove: () => void;
}

// Pill de selección con botón "X" (ingredientes y alérgenos). El botón es un
// <button> real: se alcanza con Tab y se activa con Enter/Espacio.
const RemovableTag = ({ label, onRemove }: RemovableTagProps) => (
  <Box
    component="li"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 2.5,
      bgcolor: "secondary.main",
      borderRadius: 1.5,
      py: 1,
      pl: 3,
      pr: 2,
      maxWidth: "100%",
    }}
  >
    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
      {label}
    </Typography>
    <IconButton
      type="button"
      size="small"
      onClick={onRemove}
      aria-label={`Quitar ${label}`}
      sx={{ p: 0.5 }}
    >
      <CloseIcon sx={{ fontSize: 12 }} />
    </IconButton>
  </Box>
);

export default RemovableTag;
