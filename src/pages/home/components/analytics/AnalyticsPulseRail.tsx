import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import { Box, ButtonBase, Typography } from "@mui/material";

interface Props {
  open: boolean;
  controlsId: string;
  onToggle: () => void;
}

/** Estado cerrado: botón real que ocupa todo el riel y abre el panel. */
const AnalyticsPulseRail = ({ open, controlsId, onToggle }: Props) => (
  <ButtonBase
    onClick={onToggle}
    aria-expanded={open}
    aria-controls={controlsId}
    aria-label="Abrir analíticas"
    tabIndex={open ? -1 : 0}
    sx={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      borderRadius: "inherit",
      color: "primary.main",
      opacity: open ? 0 : 1,
      visibility: open ? "hidden" : "visible",
      pointerEvents: open ? "none" : "auto",
      transition: open
        ? "opacity 300ms ease-out, visibility 0s linear 300ms"
        : "opacity 300ms ease-out, visibility 0s",
      "&:focus-visible": {
        outline: (t) => `2px solid ${t.palette.primary.main}`,
        outlineOffset: -3,
      },
      "@media (prefers-reduced-motion: reduce)": { transition: "none" },
    }}
  >
    <InsightsOutlinedIcon sx={{ fontSize: 28 }} />
    <Typography
      aria-hidden
      sx={{
        fontSize: 12,
        fontWeight: 600,
        color: "text.body",
        writingMode: "vertical-rl",
        transform: "rotate(180deg)",
        letterSpacing: 0.5,
      }}
    >
      Visitas
    </Typography>
    <Box
      aria-hidden
      sx={{ width: 24, height: 4, borderRadius: 2, bgcolor: "border.field" }}
    />
  </ButtonBase>
);

export default AnalyticsPulseRail;
