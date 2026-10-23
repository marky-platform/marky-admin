import { Box, Button, ButtonBase, Skeleton, Typography } from "@mui/material";
import { Ref } from "react";
import { ReactComponent as CollapseIcon } from "../../../../assets/icons/analytics/collapse.svg";
import {
  AnalyticsProductSort,
  AnalyticsPulse,
  AnalyticsPulseDays,
} from "../../../../types/analytics";
import ActionBreakdown from "./ActionBreakdown";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import { formatClock, formatPeriodRange } from "./format";
import { BlockHeader, PulseSelect, pulseText, tintSvg } from "./sectionStyles";
import TopProducts from "./TopProducts";
import VisitsHistory from "./VisitsHistory";
import VisitsSummary from "./VisitsSummary";

const DAYS_OPTIONS: { value: AnalyticsPulseDays; label: string }[] = [
  { value: 7, label: "7 días" },
  { value: 30, label: "30 días" },
];

interface Props {
  id: string;
  open: boolean;
  data?: AnalyticsPulse;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onClose: () => void;
  closeButtonRef?: Ref<HTMLButtonElement>;
  days: AnalyticsPulseDays;
  onDaysChange: (days: AnalyticsPulseDays) => void;
  sort: AnalyticsProductSort;
  onSortChange: (sort: AnalyticsProductSort) => void;
}

export const hasNoActivity = (p: AnalyticsPulse): boolean =>
  p.today.visits === 0 &&
  p.history.every((d) => d.visits === 0) &&
  Object.values(p.sources).every((v) => v === 0) &&
  Object.values(p.actions).every((v) => v === 0) &&
  p.topProducts.length === 0;

const PanelSkeleton = () => (
  <Box aria-busy="true" data-testid="analytics-skeleton" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <Skeleton variant="rounded" height={115} sx={{ borderRadius: 4 }} />
    <Skeleton variant="text" width="45%" height={32} />
    <Skeleton variant="rounded" height={393} sx={{ borderRadius: 4 }} />
    <Skeleton variant="rounded" height={260} sx={{ borderRadius: 4 }} />
  </Box>
);

/** Panel abierto (Figma 6642:25207). */
const AnalyticsPulsePanel = ({
  id,
  open,
  data,
  isLoading,
  isError,
  onRetry,
  onClose,
  closeButtonRef,
  days,
  onDaysChange,
  sort,
  onSortChange,
}: Props) => {
  let body;
  if (data) {
    body = (
      <>
        <VisitsSummary pulse={data} />
        {hasNoActivity(data) && <AnalyticsEmptyState />}
        <BlockHeader
          title="Historial"
          titleSx={pulseText.h3}
          subtitle={formatPeriodRange(data.period.start, data.period.end)}
          action={<PulseSelect value={days} options={DAYS_OPTIONS} onChange={onDaysChange} ariaLabel="Período" />}
        />
        <VisitsHistory pulse={data} />
        <ActionBreakdown pulse={data} />
        <TopProducts pulse={data} sort={sort} onSortChange={onSortChange} />
      </>
    );
  } else if (isError && !isLoading) {
    body = (
      <Box role="alert" sx={{ py: 4 }}>
        <Typography sx={{ ...pulseText.p, color: "pulse.ink", mb: 3 }}>
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
        width: { xs: "calc(100vw - 24px)", md: 320 },
        maxWidth: { xs: 406, md: "none" },
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
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          px: 4,
          pt: 4,
          pb: 6,
        }}
      >
        <Box component="header" sx={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Box sx={{ flex: 1, minWidth: 0, pt: 1, px: "2px", alignSelf: "flex-end" }}>
            <Typography component="h2" sx={{ ...pulseText.h2, color: "pulse.ink" }}>
              Pulso
            </Typography>
            <Typography sx={{ ...pulseText.tinyMedium, color: "pulse.muted", pt: 1 }}>
              Actividad de tu catálogo
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <ButtonBase
              ref={closeButtonRef}
              onClick={onClose}
              aria-expanded={open}
              aria-controls={id}
              aria-label="Cerrar analíticas"
              sx={(t) => ({
                width: 32,
                height: 32,
                borderRadius: 3,
                bgcolor: "surface.main",
                "& svg": { ...tintSvg(t.palette.pulse.muted), transform: "rotate(90deg)" },
                "&:focus-visible": { outline: `2px solid ${t.palette.primary.main}` },
              })}
            >
              <CollapseIcon width={16} height={16} />
            </ButtonBase>
            {data?.generatedAt && (
              <Typography sx={{ ...pulseText.tiny, color: "pulse.muted", pt: "6px", whiteSpace: "nowrap" }}>
                Actualizado {formatClock(data.generatedAt, data.timezone)}
              </Typography>
            )}
          </Box>
        </Box>
        {body}
      </Box>
    </Box>
  );
};

export default AnalyticsPulsePanel;
