import { Box, Typography } from "@mui/material";
import { AnalyticsPulse } from "../../../../types/analytics";
import { formatCount, sharePercent } from "./format";
import { pulseText } from "./sectionStyles";

type SourceKey = keyof AnalyticsPulse["sources"];

// Link público y QR siempre (Figma); directo/otros solo si tienen visitas.
const SOURCES: { key: SourceKey; label: string; color: string; always: boolean }[] = [
  { key: "publicLink", label: "Link público", color: "primary.main", always: true },
  { key: "qr", label: "Código QR", color: "pulse.qr", always: true },
  { key: "direct", label: "Directo", color: "grey.800", always: false },
  { key: "other", label: "Otros", color: "pulse.sparkTrack", always: false },
];

/** "Origen de las visitas": barra apilada + leyenda con cantidad y porcentaje. */
const TrafficSources = ({ pulse }: { pulse: AnalyticsPulse }) => {
  const total = Object.values(pulse.sources).reduce((a, b) => a + b, 0);
  const rows = SOURCES.filter((s) => s.always || pulse.sources[s.key] > 0);
  return (
    <Box>
      <Typography component="h4" sx={{ ...pulseText.h4, color: "pulse.ink", pt: 4 }}>
        Origen de las visitas
      </Typography>
      <Box
        aria-hidden
        data-testid="sources-bar"
        sx={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", mt: 3, bgcolor: "pulse.divider" }}
      >
        {total > 0 &&
          rows.map((s) =>
            pulse.sources[s.key] > 0 ? (
              <Box key={s.key} sx={{ flexGrow: pulse.sources[s.key], flexBasis: 0, bgcolor: s.color }} />
            ) : null,
          )}
      </Box>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, pt: 4 }}>
        {rows.map((s, i) => (
          <Box
            component="li"
            key={s.key}
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: i ? 3 : 0 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box aria-hidden sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: s.color }} />
              <Typography sx={{ ...pulseText.tiny, color: "pulse.ink" }}>{s.label}</Typography>
            </Box>
            <Typography sx={{ ...pulseText.lead, color: "pulse.ink" }}>
              {formatCount(pulse.sources[s.key])}{" "}
              <Box component="span" sx={{ color: "pulse.muted" }}>
                ·
              </Box>{" "}
              {sharePercent(pulse.sources[s.key], total)} %
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default TrafficSources;
