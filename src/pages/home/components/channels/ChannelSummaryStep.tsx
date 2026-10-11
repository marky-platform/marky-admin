import { Box, IconButton, Typography } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getIn, useFormikContext } from "formik";
import React from "react";
import { ChannelKey } from "../../../../types/channel";
import { CHANNEL_META } from "./channels.constants";
import { ChannelsFormValues } from "./ChannelWizardModal";

interface ChannelSummaryStepProps {
  selectedChannels: ChannelKey[];
  onOpenDetail: (channel: ChannelKey) => void;
}

const ChannelSummaryStep: React.FC<ChannelSummaryStepProps> = ({
  selectedChannels,
  onOpenDetail,
}) => {
  const { values } = useFormikContext<ChannelsFormValues>();

  return (
    <Box display="flex" flexDirection="column">
      <Box
        sx={{
          // display: "flex",
          // justifyContent: "space-between",
          // alignItems: "baseline",
          marginBottom: 4,
          // gap: 2,
        }}
      >
        {" "}
        <Typography variant="body2" color="textSecondary" whiteSpace="nowrap">
          Configuración de los canales
        </Typography>
        <Typography sx={{ color: "grey.700" }}>
          Completa la configuración para finalizar.
        </Typography>
      </Box>

      <Box>
        {selectedChannels.map((chan) => {
          const meta = CHANNEL_META[chan];
          const entries = getIn(values, `channels.${chan}`) || [];
          const filled = entries.filter(
            (entry: any) => entry.url && entry.url.trim() !== "",
          );
          const IconComponent = meta.icon;

          const singleValueText = filled[0]
            ? `${meta.urlPrefix ? "@" : ""}${filled[0].url}`
            : "Configurar";

          const iconBox = (
            <Box
              sx={{
                width: 26,
                height: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                "& svg": { width: "100%", height: "100%" },
              }}
            >
              <IconComponent />
            </Box>
          );

          return (
            <Box
              key={chan}
              onClick={() => onOpenDetail(chan)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 1.5,
                pl: 2,
                pb: 4,
                mb: 2,
                borderBottom: "1px solid",
                borderColor: "border.divider",
                cursor: "pointer",
                "&:hover": { backgroundColor: "grey.50" },
              }}
            >
              {meta.multiEntry ? (
                <Box
                  flex={1}
                  minWidth={0}
                  display="flex"
                  flexDirection="column"
                  gap={1}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={0.75}
                      flex={1}
                      minWidth={0}
                    >
                      {iconBox}
                      <Typography
                        variant="body2"
                        sx={{ color: "text.strong" }}
                        noWrap
                      >
                        {meta.label}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="primary" noWrap>
                      {filled.length}/{meta.maxEntries} añadidos
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="primary"
                    mt={2}
                  >
                    Configurar
                  </Typography>
                </Box>
              ) : (
                <Box
                  flex={1}
                  minWidth={0}
                  display="flex"
                  flexDirection="column"
                  gap={1}
                >
                  <Box display="flex" alignItems="center" gap={0.75}>
                    {iconBox}
                    <Typography
                      variant="body2"
                      sx={{ color: "text.strong" }}
                      noWrap
                    >
                      {meta.label}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ color: "text.primary", mt: 2 }}
                    noWrap
                  >
                    {singleValueText}
                  </Typography>
                </Box>
              )}
              <IconButton
                size="small"
                edge="end"
                aria-label={`Configurar ${meta.label}`}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ChannelSummaryStep;
