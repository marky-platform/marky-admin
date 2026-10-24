import { Box, Typography } from "@mui/material";
import { AnalyticsPulse } from "../../../../types/analytics";
import { barRatio, formatCount, weekdayInitial } from "./format";
import { PulseCard, pulseText } from "./sectionStyles";
import TrafficSources from "./TrafficSources";

const BAR_AREA = 70;

/** Tarjeta "Visitas al catálogo": total del período, barras por día y orígenes. */
const VisitsHistory = ({ pulse }: { pulse: AnalyticsPulse }) => {
  const total = pulse.history.reduce((sum, d) => sum + d.visits, 0);
  const max = Math.max(0, ...pulse.history.map((d) => d.visits));
  const days = pulse.history.length;
  // Con 30 días no entran las iniciales: barras más finas y sin etiquetas.
  const dense = days > 7;

  return (
    <PulseCard>
      <Typography component="h4" sx={{ ...pulseText.h4, color: "pulse.ink" }}>
        Visitas al catálogo
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, pt: 2, minHeight: 48 }}>
        <Typography sx={{ ...pulseText.big, color: "pulse.ink" }}>{formatCount(total)}</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 5 }}>
        <Typography sx={{ ...pulseText.tinyMedium, color: "pulse.inkSoft" }}>Visitas por día</Typography>
        <Typography sx={{ ...pulseText.tiny, color: "pulse.muted" }}>Últimos {days} días</Typography>
      </Box>
      <Box
        role="img"
        aria-label={`Visitas por día: ${pulse.history.map((d) => `${d.date} ${d.visits}`).join(", ")}`}
        sx={{ display: "flex", alignItems: "flex-end", gap: dense ? "2px" : "6px", pt: 3 }}
      >
        {pulse.history.map((d, i) => {
          const isToday = i === days - 1;
          const height = d.visits > 0 ? Math.max(8, Math.round(barRatio(d.visits, max) * BAR_AREA)) : 0;
          return (
            <Box key={d.date} sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <Box sx={{ height: BAR_AREA, width: "100%", display: "flex", alignItems: "flex-end" }}>
                <Box
                  data-testid="visits-bar"
                  title={`${d.date}: ${d.visits}`}
                  sx={{
                    width: "100%",
                    // Día sin visitas: línea base para que la serie se lea completa.
                    height: height || 2,
                    borderRadius: dense ? 1 : 2,
                    bgcolor: isToday ? "primary.main" : height ? "secondary.main" : "pulse.divider",
                  }}
                />
              </Box>
              {!dense && (
                <Typography aria-hidden sx={{ ...pulseText.tiny, color: isToday ? "pulse.ink" : "pulse.muted" }}>
                  {weekdayInitial(d.date)}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
      <Box aria-hidden sx={{ height: "1px", bgcolor: "pulse.divider", mt: 4 }} />
      <TrafficSources pulse={pulse} />
    </PulseCard>
  );
};

export default VisitsHistory;
