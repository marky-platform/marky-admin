import { Box, Typography } from "@mui/material";
import { AnalyticsPulse } from "../../../../types/analytics";
import { formatCount, formatLastVisit } from "./format";

const VisitsSummary = ({ pulse }: { pulse: AnalyticsPulse }) => {
  const { visits, uniqueVisitors, lastVisitAt } = pulse.today;
  return (
    <Box component="section" sx={{ pb: 4 }}>
      <Typography sx={{ fontSize: 13, color: "text.muted" }}>
        Visitas de hoy
      </Typography>
      <Typography
        sx={{ fontSize: 40, lineHeight: 1.1, fontWeight: 700, color: "text.strong" }}
      >
        {formatCount(visits)}
      </Typography>
      <Typography sx={{ fontSize: 13, color: "text.muted", mt: 1 }}>
        {formatCount(uniqueVisitors)}{" "}
        {uniqueVisitors === 1 ? "visitante único" : "visitantes únicos"}
      </Typography>
      <Typography sx={{ fontSize: 13, color: "text.muted", mt: 2 }}>
        Última visita:{" "}
        <Box component="span" sx={{ color: "text.body", fontWeight: 500 }}>
          {lastVisitAt
            ? formatLastVisit(lastVisitAt, pulse.timezone) || "—"
            : "Sin visitas todavía"}
        </Box>
      </Typography>
    </Box>
  );
};

export default VisitsSummary;
