import { Box, Typography } from "@mui/material";
import { AnalyticsPulse } from "../../../../types/analytics";
import {
  barRatio,
  formatCount,
  formatDayMonth,
  formatWeekdayShort,
} from "./format";
import { Section } from "./sectionStyles";

const BAR_AREA_HEIGHT = 96;

const VisitsHistory = ({ pulse }: { pulse: AnalyticsPulse }) => {
  const days = pulse.history;
  const max = days.reduce((m, d) => Math.max(m, d.visits), 0);
  const total = days.reduce((sum, d) => sum + d.visits, 0);

  return (
    <Section title="Últimos 7 días">
      <Typography sx={{ fontSize: 13, color: "text.muted", mb: 3 }}>
        {formatCount(total)} {total === 1 ? "visita" : "visitas"} en total
      </Typography>
      {days.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: "text.muted" }}>
          Sin datos del período.
        </Typography>
      ) : (
        <Box
          role="img"
          aria-label={`Visitas por día: ${days
            .map((d) => `${formatDayMonth(d.date)} ${d.visits}`)
            .join(", ")}`}
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
            columnGap: 2,
            alignItems: "end",
          }}
        >
          {days.map((d) => {
            const ratio = barRatio(d.visits, max);
            return (
              <Box
                key={d.date}
                sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                <Typography sx={{ fontSize: 11, color: "text.muted", mb: 1 }}>
                  {formatCount(d.visits)}
                </Typography>
                <Box
                  sx={{
                    height: BAR_AREA_HEIGHT,
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-end",
                    borderBottom: (t) => `1px solid ${t.palette.border.field}`,
                  }}
                >
                  <Box
                    data-testid="visits-bar"
                    sx={{
                      width: "100%",
                      // Con valor 0 queda un trazo mínimo: línea base consistente.
                      height: ratio > 0 ? `${Math.max(ratio * 100, 4)}%` : 2,
                      bgcolor: ratio > 0 ? "primary.main" : "border.field",
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: 11, color: "text.muted", mt: 1 }}>
                  {formatWeekdayShort(d.date)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Section>
  );
};

export default VisitsHistory;
