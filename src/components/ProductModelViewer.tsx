import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import { Box, Button, LinearProgress, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

// Único archivo que conoce <model-viewer>. El paquete (three.js incluido) se
// carga con import() dinámico: queda en un chunk aparte y solo se descarga
// cuando se monta un visor, es decir, cuando el usuario elige el ítem 3D.

type ModelViewerElement = HTMLElement & {
  canActivateAR?: boolean;
  activateAR?: () => Promise<void>;
};

type ViewerStatus = "loading" | "loaded" | "error";

export interface ProductModelViewerProps {
  glbUrl: string;
  usdzUrl?: string;
  /** Texto alternativo, p. ej. "Modelo 3D de {nombre}". */
  alt: string;
  /** Se llama tras `load` con `canActivateAR` del elemento. */
  onArAvailability?: (canAR: boolean) => void;
}

const ProductModelViewer: React.FC<ProductModelViewerProps> = ({
  glbUrl,
  usdzUrl,
  alt,
  onArAvailability,
}) => {
  const viewerRef = useRef<ModelViewerElement>(null);
  const [status, setStatus] = useState<ViewerStatus>("loading");
  const [progress, setProgress] = useState(0);
  const [canActivateAR, setCanActivateAR] = useState(false);
  // El callback puede cambiar en cada render del padre; los listeners leen
  // siempre el último sin re-suscribirse.
  const onArAvailabilityRef = useRef(onArAvailability);
  onArAvailabilityRef.current = onArAvailability;

  useEffect(() => {
    let cancelled = false;
    import("@google/model-viewer").catch(() => {
      if (!cancelled) setStatus("error");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // React 18 no conecta eventos de custom elements: listeners vía ref.
  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    setStatus("loading");
    setProgress(0);
    setCanActivateAR(false);

    const handleLoad = () => {
      const canAR = Boolean(el.canActivateAR);
      setStatus("loaded");
      setCanActivateAR(canAR);
      onArAvailabilityRef.current?.(canAR);
    };
    const handleError = () => setStatus("error");
    const handleProgress = (event: Event) => {
      const total = (event as CustomEvent<{ totalProgress?: number }>).detail
        ?.totalProgress;
      if (typeof total === "number") setProgress(Math.round(total * 100));
    };
    // Una sesión de AR fallida no es un error del modelo: se sigue mostrando
    // el visor 3D tal como estaba.
    const handleArStatus = (event: Event) => {
      const arStatus = (event as CustomEvent<{ status?: string }>).detail
        ?.status;
      if (arStatus === "failed") {
        setStatus((prev) => (prev === "error" ? prev : "loaded"));
      }
    };

    el.addEventListener("load", handleLoad);
    el.addEventListener("error", handleError);
    el.addEventListener("progress", handleProgress);
    el.addEventListener("ar-status", handleArStatus);
    return () => {
      el.removeEventListener("load", handleLoad);
      el.removeEventListener("error", handleError);
      el.removeEventListener("progress", handleProgress);
      el.removeEventListener("ar-status", handleArStatus);
    };
  }, [glbUrl, usdzUrl]);

  return (
    <Box
      data-testid="product-model-viewer"
      sx={{ position: "relative", width: "100%", height: "100%" }}
    >
      {glbUrl && (
        <model-viewer
          ref={viewerRef}
          data-testid="model-viewer-element"
          src={glbUrl}
          {...(usdzUrl ? { "ios-src": usdzUrl } : {})}
          alt={alt}
          camera-controls=""
          touch-action="pan-y"
          ar=""
          ar-modes="webxr scene-viewer quick-look"
          ar-placement="floor"
          loading="eager"
          style={{ display: "block", width: "100%", height: "100%" }}
        >
          {/* Reemplaza la barra de progreso por defecto: usamos la de MUI. */}
          <div slot="progress-bar" />
          {/* Oculta el botón AR por defecto: el nuestro va fuera del elemento
            para no depender de que model-viewer ya esté cargado. */}
          <div slot="ar-button" />
        </model-viewer>
      )}

      {/* Solo en dispositivos con AR (celulares); la cámara y la sesión AR
        arrancan recién al tocarlo. */}
      {status === "loaded" && canActivateAR && (
        <Button
          variant="contained"
          startIcon={<ViewInArIcon />}
          onClick={() => viewerRef.current?.activateAR?.()}
          sx={{ position: "absolute", right: 16, bottom: 16, px: 3 }}
        >
          Ver en tu espacio
        </Button>
      )}

      {(status === "loading" || !glbUrl) && (
        <LinearProgress
          variant={progress > 0 ? "determinate" : "indeterminate"}
          value={progress}
          aria-label="Cargando modelo 3D"
          sx={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
        />
      )}

      {status === "error" && (
        <Box
          role="alert"
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            p: 3,
            textAlign: "center",
            bgcolor: "background.paper",
          }}
        >
          <ErrorOutlineIcon color="error" />
          <Typography variant="body2" color="text.secondary">
            No se pudo cargar el modelo 3D
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProductModelViewer;
