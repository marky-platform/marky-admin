import { Box } from "@mui/material";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { HEADER_HEIGHT } from "../../../../constants/layout";
import { useAnalyticsPulse } from "../../../../hooks/useAnalyticsPulse";
import AnalyticsPulsePanel from "./AnalyticsPulsePanel";
import AnalyticsPulseRail from "./AnalyticsPulseRail";

const TRANSITION = "300ms ease-out";
// Aire entre el Header y el borde superior del widget / borde inferior de la ventana.
const GAP = 12;
const availableHeight = (unit: "vh" | "dvh") =>
  `calc(100${unit} - ${HEADER_HEIGHT + GAP * 2}px)`;
// Alto mínimo del panel abierto cuando se limita por el espacio visible.
const MIN_OPEN_HEIGHT = 240;
// Elementos que, si están abiertos, se quedan con Escape (diálogos MUI).
const MODAL_SELECTOR = '[role="dialog"], .MuiModal-root';

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

  const wrapperRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  // Espacio entre el borde superior del widget y el pie de la ventana.
  const [maxHeight, setMaxHeight] = useState<number | null>(null);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Foco: al abrir va al botón de cierre; al cerrar vuelve al riel.
  useEffect(() => {
    if (open) closeRef.current?.focus();
    else if (wasOpen.current) railRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      // Escape cierra primero el diálogo/modal que esté abierto, no el widget.
      if (document.querySelector(MODAL_SELECTOR)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Si se abre con la página arriba, el widget queda más abajo que el tope
  // pegajoso: se limita el alto al espacio real hasta el pie de la ventana.
  useEffect(() => {
    if (!open) {
      setMaxHeight(null);
      return;
    }
    const measure = () => {
      const top = wrapperRef.current?.getBoundingClientRect().top ?? 0;
      setMaxHeight(
        Math.max(MIN_OPEN_HEIGHT, Math.floor(window.innerHeight - top - GAP)),
      );
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [open]);

  const innerHeight = (unit: "vh" | "dvh") =>
    open
      ? {
          xs: `min(864px, ${availableHeight(unit)})`,
          md: `min(793px, ${availableHeight(unit)})`,
        }
      : { xs: 208, md: 266 };

  return (
    <Box
      ref={wrapperRef}
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
          height: innerHeight("vh"),
          // dvh evita que la barra del navegador móvil tape el pie del panel.
          "@supports (height: 100dvh)": { height: innerHeight("dvh") },
          maxHeight: open && maxHeight !== null ? `${maxHeight}px` : undefined,
          mt: { xs: 0, md: 0 },
          borderRadius: 3,
          bgcolor: "surface.main",
          border: (t) => `1px solid ${t.palette.border.field}`,
          boxShadow: (t) => `0 2px 12px ${t.palette.shadow.soft}`,
          transition: `width ${TRANSITION}, height ${TRANSITION}`,
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        }}
      >
        <AnalyticsPulseRail ref={railRef} open={open} controlsId={panelId} onToggle={toggle} />
        <AnalyticsPulsePanel
          id={panelId}
          open={open}
          data={data}
          isLoading={isFetching}
          isError={isError}
          onRetry={() => refetch()}
          onClose={() => setOpen(false)}
          closeButtonRef={closeRef}
        />
      </Box>
    </Box>
  );
};

export default AnalyticsPulseWidget;
