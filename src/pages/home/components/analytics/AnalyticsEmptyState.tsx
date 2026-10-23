import { Box, Typography } from "@mui/material";

const AnalyticsEmptyState = () => (
  <Box
    role="status"
    sx={{
      p: 3,
      mb: 3,
      borderRadius: 2,
      bgcolor: "surface.tintFaint",
      border: (t) => `1px dashed ${t.palette.border.dashed}`,
    }}
  >
    <Typography sx={{ fontSize: 13, color: "text.body" }}>
      Todavía no hay actividad en tu perfil
    </Typography>
  </Box>
);

export default AnalyticsEmptyState;
