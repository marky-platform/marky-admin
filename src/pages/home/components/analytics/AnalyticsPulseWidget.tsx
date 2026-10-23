import { Box } from "@mui/material";
import { useCallback, useEffect, useId, useState } from "react";
import { HEADER_HEIGHT } from "../../../../constants/layout";
import { useAnalyticsPulse } from "../../../../hooks/useAnalyticsPulse";
import AnalyticsPulsePanel from "./AnalyticsPulsePanel";
import AnalyticsPulseRail from "./AnalyticsPulseRail";

const TRANSITION = "300ms ease-out";
// Aire entre el Header y el borde superior del widget / borde inferior de la ventana.
const GAP = 12;
const AVAILABLE = `calc(100vh - ${HEADER_HEIGHT + GAP * 2}px)`;

/**
 * Widget "Pulso" de /home. Debe renderizarse como primer hijo del contenedor
 * derecho (display block en mobile, flex en md+): en mobile queda anclado
 * arriba a la derecha sobre la grilla (sticky de alto 0); en md+ es una
 * columna sticky de 104px (cerrado) / 352px (abierto) junto a la grilla.
 */
const AnalyticsPulseWidget = () => {
  const [open, setOpen] = useState(false);
  const panelId = `analytics-pulse-${useId().replace(/:/g, "")}`;
  const { data, isFetching, isError, refetch } = useAnalyticsPulse(open);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <Box
      data-testid="analytics-pulse-widget"
      sx={{
        boxSizing: "border-box",
        position: "sticky",
        top: HEADER_HEIGHT + GAP,
        zIndex: (t) => t.zIndex.appBar - 1,
        // mobile: alto 0 para no empujar la grilla; el panel se superpone.
        height: { xs: 0, md: "auto" },
        width: { xs: "100%", md: open ? 352 : 104 },
        flexShrink: 0,
        order: { md: 2 },
        alignSelf: { md: "flex-start" },
        display: "flex",
        justifyContent: "flex-end",
        pr: { md: 8 },
        pointerEvents: { xs: "none", md: "auto" },
        transition: `width ${TRANSITION}`,
        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      }}
    >
      <Box
        sx={{
          position: "relative",
          boxSizing: "border-box",
          pointerEvents: "auto",
          overflow: "hidden",
          maxWidth: "100%",
          width: open ? { xs: 402, md: 320 } : 72,
          height: open
            ? {
                xs: `min(864px, ${AVAILABLE})`,
                md: `min(793px, ${AVAILABLE})`,
              }
            : { xs: 208, md: 266 },
          mt: { xs: 0, md: 0 },
          borderRadius: 3,
          bgcolor: "surface.main",
          border: (t) => `1px solid ${t.palette.border.field}`,
          boxShadow: (t) => `0 2px 12px ${t.palette.shadow.soft}`,
          transition: `width ${TRANSITION}, height ${TRANSITION}`,
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        }}
      >
        <AnalyticsPulseRail open={open} controlsId={panelId} onToggle={toggle} />
        <AnalyticsPulsePanel
          id={panelId}
          open={open}
          data={data}
          isLoading={isFetching}
          isError={isError}
          onRetry={() => refetch()}
          onClose={() => setOpen(false)}
        />
      </Box>
    </Box>
  );
};

export default AnalyticsPulseWidget;
