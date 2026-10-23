import { Box, ButtonBase, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import { forwardRef } from "react";
import { ReactComponent as ChevronIcon } from "../../../../assets/icons/analytics/chevron-down.svg";
import { AnalyticsPulse } from "../../../../types/analytics";
import { barRatio, deltaPercent, formatCount } from "./format";
import { DeltaChip, pulseText, tintSvg } from "./sectionStyles";

interface Props {
  open: boolean;
  controlsId: string;
  onToggle: () => void;
  /** Datos de los últimos 7 días (el riel ignora el período elegido en el panel). */
  data?: AnalyticsPulse;
}

const SPARK_HEIGHT = 46;

// Halo del punto "en vivo" (en Figma: círculo de 16px detrás del punto de 8px).
const ping = keyframes`
  0% { transform: scale(0.5); opacity: 0.45; }
  80%, 100% { transform: scale(1); opacity: 0; }
`;

/**
 * Estado cerrado (Figma 6621:22856): "Pulso", visitas de hoy, barras de los
 * últimos 7 días (hoy resaltado) y variación de visitas vs. los 7 anteriores.
 * Es un botón real que ocupa todo el riel y abre el panel.
 */
const AnalyticsPulseRail = forwardRef<HTMLButtonElement, Props>(
  ({ open, controlsId, onToggle, data }, ref) => {
    const history = data?.history.slice(-7) ?? [];
    const weekVisits = history.reduce((sum, d) => sum + d.visits, 0);
    const delta = data ? deltaPercent(weekVisits, data.previous.visits) : null;
    const max = Math.max(0, ...history.map((d) => d.visits));

    return (
      <ButtonBase
        ref={ref}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={controlsId}
        aria-label="Abrir analíticas"
        tabIndex={open ? -1 : 0}
        sx={(t) => ({
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 3,
          px: 2,
          py: 5,
          borderRadius: "inherit",
          opacity: open ? 0 : 1,
          visibility: open ? "hidden" : "visible",
          pointerEvents: open ? "none" : "auto",
          transition: open
            ? "opacity 300ms ease-out, visibility 0s linear 300ms"
            : "opacity 300ms ease-out, visibility 0s",
          "&:focus-visible": {
            outline: `2px solid ${t.palette.primary.main}`,
            outlineOffset: -3,
          },
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        })}
      >
        <Typography sx={{ ...pulseText.lead, color: "pulse.muted" }}>Pulso</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Box aria-hidden sx={{ position: "relative", width: 8, height: 8, mb: 1 }}>
            <Box
              sx={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                bgcolor: "pulse.sparkAccent",
                opacity: 0,
                animation: `${ping} 2s ease-out infinite`,
                "@media (prefers-reduced-motion: reduce)": { animation: "none" },
              }}
            />
            <Box sx={{ position: "absolute", inset: 0, borderRadius: "50%", bgcolor: "pulse.sparkAccent" }} />
          </Box>
          <Typography data-testid="rail-today" sx={{ ...pulseText.h2, color: "pulse.ink" }}>
            {data ? formatCount(data.today.visits) : "–"}
          </Typography>
          <Typography sx={{ ...pulseText.tiny, color: "pulse.muted", pt: "2px" }}>HOY</Typography>
        </Box>
        {/* El riel mobile (208px) no lleva barras. */}
        <Box
          aria-hidden
          data-testid="rail-sparkline"
          sx={{ display: { xs: "none", md: "flex" }, alignItems: "flex-end", gap: "3px", height: SPARK_HEIGHT }}
        >
          {history.map((d, i) => (
            <Box
              key={d.date}
              data-testid="rail-bar"
              sx={{
                width: 4,
                height: Math.max(4, Math.round(barRatio(d.visits, max) * SPARK_HEIGHT)),
                borderRadius: 999,
                bgcolor: i === history.length - 1 ? "pulse.sparkAccent" : "pulse.sparkTrack",
              }}
            />
          ))}
        </Box>
        {delta !== null && <DeltaChip delta={delta} compact />}
        <Box aria-hidden sx={(t) => ({ ...tintSvg(t.palette.pulse.muted), pt: 1 })}>
          <ChevronIcon width={16} height={16} />
        </Box>
      </ButtonBase>
    );
  },
);
AnalyticsPulseRail.displayName = "AnalyticsPulseRail";

export default AnalyticsPulseRail;
