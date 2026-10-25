import { Box, MenuItem, Select, SxProps, Theme, Typography } from "@mui/material";
import { ReactNode } from "react";
import { ReactComponent as ChevronIcon } from "../../../../assets/icons/analytics/chevron-down.svg";

// Escala tipográfica del widget Pulso (estilos de texto de Figma).
export const pulseText = {
  h2: { fontSize: 24, fontWeight: 700, lineHeight: "32px", letterSpacing: "-0.096px" },
  h3: { fontSize: 18, fontWeight: 500, lineHeight: "23px", letterSpacing: "-0.096px" },
  h4: { fontSize: 16, fontWeight: 500, lineHeight: "22px", letterSpacing: "-0.1px" },
  big: { fontSize: 36, fontWeight: 700, lineHeight: "34px", letterSpacing: "-0.096px" },
  lead: { fontSize: 14, fontWeight: 700, lineHeight: "22px", letterSpacing: "-0.1px" },
  p: { fontSize: 14, fontWeight: 400, lineHeight: "18px", letterSpacing: "-0.1px" },
  tiny: { fontSize: 12, fontWeight: 400, lineHeight: "16px", letterSpacing: "0.03px" },
  tinyMedium: { fontSize: 12, fontWeight: 500, lineHeight: "22px", letterSpacing: "0.03px" },
} as const;

/** Tarjeta blanca (fondo del panel: `pulse.canvas`). */
export const PulseCard = ({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) => (
  <Box
    component="section"
    sx={[
      { bgcolor: "surface.main", borderRadius: 4, p: 4, width: "100%", boxSizing: "border-box" },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);

/** Recolorea un SVG de Figma con un token (para el modo oscuro) sin editar el asset. */
export const tintSvg = (color: string) => ({
  display: "block",
  flexShrink: 0,
  "& [stroke]:not([stroke='none'])": { stroke: color },
  "& [fill]:not([fill='none'])": { fill: color },
});

const SelectChevron = (props: { className?: string }) => (
  <Box
    component="span"
    className={props.className}
    sx={(t) => ({
      ...tintSvg(t.palette.pulse.muted),
      top: "calc(50% - 8px) !important",
      right: "12px !important",
      pointerEvents: "none",
      position: "absolute",
    })}
  >
    <ChevronIcon width={16} height={16} />
  </Box>
);

/** Selector compacto del panel ("7 días", "Más vistos"). */
export function PulseSelect<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <Select
      value={value}
      onChange={(e) => {
        const next = options.find((o) => String(o.value) === String(e.target.value));
        if (next) onChange(next.value);
      }}
      variant="standard"
      disableUnderline
      IconComponent={SelectChevron}
      inputProps={{ "aria-label": ariaLabel }}
      sx={{
        height: 34,
        borderRadius: 3,
        bgcolor: "surface.main",
        color: "pulse.ink",
        ...pulseText.tinyMedium,
        "& .MuiSelect-select": {
          pl: 3,
          pr: "36px !important",
          py: 0,
          display: "flex",
          alignItems: "center",
          height: 34,
          boxSizing: "border-box",
          borderRadius: 3,
        },
        "& .MuiSelect-select:focus": { bgcolor: "transparent" },
      }}
    >
      {options.map((o) => (
        <MenuItem key={String(o.value)} value={o.value} sx={{ fontSize: 13 }}>
          {o.label}
        </MenuItem>
      ))}
    </Select>
  );
}

/** Encabezado de bloque: título + subtítulo a la izquierda, acción a la derecha. */
export const BlockHeader = ({
  title,
  subtitle,
  titleSx,
  action,
}: {
  title: string;
  subtitle?: string;
  titleSx?: object;
  action?: ReactNode;
}) => (
  <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, pt: "2px", px: "2px", width: "100%", boxSizing: "border-box" }}>
    <Box sx={{ minWidth: 0 }}>
      <Typography component="h3" sx={{ ...pulseText.h4, ...titleSx, color: "pulse.ink" }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ ...pulseText.tiny, color: "pulse.muted", pt: "2px" }}>{subtitle}</Typography>
      )}
    </Box>
    {action}
  </Box>
);
