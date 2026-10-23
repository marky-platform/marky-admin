import { Box, Typography } from "@mui/material";
import { pulseText } from "./sectionStyles";

const AnalyticsEmptyState = () => (
  <Box
    role="status"
    sx={{
      px: 4,
      py: 3,
      borderRadius: 3,
      bgcolor: "surface.main",
      border: (t) => `1px dashed ${t.palette.border.dashed}`,
    }}
  >
    <Typography sx={{ ...pulseText.tiny, color: "pulse.ink" }}>
      Todavía no hay actividad en tu perfil
    </Typography>
    <Typography sx={{ ...pulseText.tiny, color: "pulse.muted", pt: 1 }}>
      Compartí tu link o tu código QR para empezar a ver visitas.
    </Typography>
  </Box>
);

export default AnalyticsEmptyState;
