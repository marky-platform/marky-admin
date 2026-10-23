import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, IconButton, Skeleton, Typography } from "@mui/material";
import { Ref } from "react";
import { AnalyticsPulse } from "../../../../types/analytics";
import ActionBreakdown from "./ActionBreakdown";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import TopProducts from "./TopProducts";
import TrafficSources from "./TrafficSources";
import VisitsHistory from "./VisitsHistory";
import VisitsSummary from "./VisitsSummary";

interface Props {
  id: string;
  open: boolean;
  data?: AnalyticsPulse;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onClose: () => void;
  closeButtonRef?: Ref<HTMLButtonElement>;
}

export const hasNoActivity = (p: AnalyticsPulse): boolean =>
  p.today.visits === 0 &&
  p.history.every((d) => d.visits === 0) &&
  Object.values(p.sources).every((v) => v === 0) &&
  Object.values(p.actions).every((v) => v === 0) &&
  p.topProducts.length === 0;

const PanelSkeleton = () => (
  <Box aria-busy="true" data-testid="analytics-skeleton">
    <Skeleton variant="text" width="40%" />
    <Skeleton variant="text" width="30%" height={56} />
    <Skeleton variant="rounded" height={96} sx={{ my: 4 }} />
    <Skeleton variant="rounded" height={80} sx={{ mb: 4 }} />
    <Skeleton variant="rounded" height={80} sx={{ mb: 4 }} />
    <Skeleton variant="rounded" height={120} />
  </Box>
);

const AnalyticsPulsePanel = ({
  id,
  open,
  data,
  isLoading,
  isError,
  onRetry,
  onClose,
  closeButtonRef,
}: Props) => {
  let body;
  if (data) {
    body = (
      <>
        <VisitsSummary pulse={data} />
        {hasNoActivity(data) && <AnalyticsEmptyState />}
        <VisitsHistory pulse={data} />
        <TrafficSources pulse={data} />
        <ActionBreakdown pulse={data} />
        <TopProducts pulse={data} />
      </>
    );
  } else if (isError && !isLoading) {
    body = (
      <Box role="alert" sx={{ py: 4 }}>
        <Typography sx={{ fontSize: 13, color: "text.body", mb: 3 }}>
          No pudimos cargar la actividad.
        </Typography>
        <Button variant="outlined" size="small" onClick={onRetry}>
          Reintentar
        </Button>
      </Box>
    );
  } else {
    body = <PanelSkeleton />;
  }

  return (
    <Box
      id={id}
      aria-hidden={!open}
      // `inert` evita foco/lectura del contenido oculto sin desmontarlo.
      {...(!open ? { inert: "" as any } : {})}
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: { xs: 402, md: 320 },
        maxWidth: { xs: "calc(100vw - 32px)", md: "none" },
        display: "flex",
        flexDirection: "column",
        opacity: open ? 1 : 0,
        visibility: open ? "visible" : "hidden",
        transition: open
          ? "opacity 300ms ease-out, visibility 0s"
          : "opacity 300ms ease-out, visibility 0s linear 300ms",
        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 4,
          pt: 3,
          flexShrink: 0,
        }}
      >
        <Typography
          component="h2"
          sx={{ fontSize: 16, fontWeight: 700, color: "text.strong" }}
        >
          Actividad de tu perfil
        </Typography>
        <IconButton
          ref={closeButtonRef}
          onClick={onClose}
          aria-expanded={open}
          aria-controls={id}
          aria-label="Cerrar analíticas"
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
          px: 4,
          pt: 3,
          pb: 4,
        }}
      >
        {body}
      </Box>
    </Box>
  );
};

export default AnalyticsPulsePanel;
