import { Box, Typography } from "@mui/material";
import { FC, SVGProps } from "react";
import { ReactComponent as LocationIcon } from "../../../../assets/icons/analytics/action-location.svg";
import { ReactComponent as WhatsappIcon } from "../../../../assets/icons/analytics/action-whatsapp.svg";
import { ReactComponent as InstagramIcon } from "../../../../assets/icons/analytics/action-instagram.svg";
import { ReactComponent as OtherIcon } from "../../../../assets/icons/analytics/action-other.svg";
import { AnalyticsPulse } from "../../../../types/analytics";
import { formatCount } from "./format";
import { PulseCard, pulseText, tintSvg } from "./sectionStyles";

type ActionKey = keyof AnalyticsPulse["actions"];

const ACTIONS: { key: ActionKey; label: string; Icon: FC<SVGProps<SVGSVGElement>> }[] = [
  { key: "location", label: "Ubicación", Icon: LocationIcon },
  { key: "whatsapp", label: "WhatsApp", Icon: WhatsappIcon },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "other", label: "Otros enlaces", Icon: OtherIcon },
];

/** Tarjeta "Acciones en el catálogo": total y desglose por tipo de acción. */
const ActionBreakdown = ({ pulse }: { pulse: AnalyticsPulse }) => {
  const total = Object.values(pulse.actions).reduce((a, b) => a + b, 0);

  return (
    <PulseCard>
      <Typography component="h4" sx={{ ...pulseText.h4, color: "pulse.ink" }}>
        Acciones en el catálogo
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, pt: 2, minHeight: 48 }}>
        <Typography sx={{ ...pulseText.big, color: "pulse.ink" }}>{formatCount(total)}</Typography>
      </Box>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, pt: 4 }}>
        {ACTIONS.map(({ key, label, Icon }, i) => (
          <Box
            component="li"
            key={key}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              py: 3,
              borderTop: i ? (t) => `1px solid ${t.palette.pulse.divider}` : "none",
            }}
          >
            <Box
              aria-hidden
              sx={(t) => ({
                width: 36,
                height: 36,
                borderRadius: 3,
                bgcolor: "secondary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                "& svg": tintSvg(t.palette.primary.main),
              })}
            >
              <Icon width={20} height={20} />
            </Box>
            <Typography sx={{ ...pulseText.p, color: "pulse.ink", flex: 1, minWidth: 0 }}>{label}</Typography>
            <Typography sx={{ ...pulseText.lead, color: "pulse.ink" }}>{formatCount(pulse.actions[key])}</Typography>
          </Box>
        ))}
      </Box>
    </PulseCard>
  );
};

export default ActionBreakdown;
