import { Box, Typography } from "@mui/material";
import { AnalyticsPulse } from "../../../../types/analytics";
import { formatCount, formatTimeAgo } from "./format";
import { pulseText } from "./sectionStyles";

/** Bloque "Hoy · Actividad reciente" (fondo celeste). */
const VisitsSummary = ({ pulse, now }: { pulse: AnalyticsPulse; now?: Date }) => {
  const { visits, lastVisitAt } = pulse.today;
  return (
    <Box
      component="section"
      sx={{ bgcolor: "secondary.main", borderRadius: 4, p: 4, width: "100%", boxSizing: "border-box" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "6px", height: 15 }}>
        <Box aria-hidden sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main" }} />
        <Typography sx={{ ...pulseText.tinyMedium, color: "primary.main" }}>
          Hoy · Actividad reciente
        </Typography>
      </Box>
      <Typography sx={{ ...pulseText.h2, color: "pulse.ink", pt: 2 }}>
        {formatCount(visits)} {visits === 1 ? "visita" : "visitas"} hoy
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, pt: "10px" }}>
        <Typography sx={{ ...pulseText.tiny, color: "pulse.muted" }}>
          {lastVisitAt ? `Última visita ${formatTimeAgo(lastVisitAt, now)}` : "Sin visitas todavía"}
        </Typography>
        <Typography sx={{ ...pulseText.tiny, color: "pulse.muted", whiteSpace: "nowrap" }}>
          Día en curso
        </Typography>
      </Box>
    </Box>
  );
};

export default VisitsSummary;
