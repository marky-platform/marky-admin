import { Box, Button, Typography } from "@mui/material";
import Add from "@mui/icons-material/Add";
import { FieldArray, getIn, useFormikContext } from "formik";
import React from "react";
import { ChannelKey } from "../../../../types/channel";
import { CHANNEL_META } from "./channels.constants";
import { ChannelsFormValues } from "./ChannelWizardModal";
import ChannelEntryRow from "./ChannelEntryRow";

interface ChannelDetailStepProps {
  channel: ChannelKey;
}

const ChannelDetailStep: React.FC<ChannelDetailStepProps> = ({ channel }) => {
  const { values, errors } = useFormikContext<ChannelsFormValues>();
  const meta = CHANNEL_META[channel];
  const entries = values.channels[channel] || [];
  const atLimit = entries.length >= meta.maxEntries;

  // Yup adjunta los errores de .min()/.max()/.test("no-duplicates", ...) al
  // propio array (no a una entrada puntual), como un string en vez de un
  // array de errores por entrada.
  const channelError = getIn(errors, `channels.${channel}`);
  const arrayLevelError =
    typeof channelError === "string" ? channelError : undefined;

  return (
    <FieldArray name={`channels.${channel}`}>
      {({ push, remove }) => (
        <Box py={2}>
          {meta.multiEntry && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 3,
                gap: 2,
              }}
            >
              <Typography variant="body2" color="textSecondary">
                {meta.limitCopy}
              </Typography>
              <Typography variant="body2" color="primary" whiteSpace="nowrap">
                {entries.length}/{meta.maxEntries} añadidos
              </Typography>
            </Box>
          )}

          {entries.map((_, index) => (
            <ChannelEntryRow
              key={index}
              channel={channel}
              index={index}
              onRemove={
                meta.multiEntry && index > 0 ? () => remove(index) : undefined
              }
            />
          ))}

          {arrayLevelError && (
            <Typography
              variant="body2"
              color="error"
              sx={{ display: "block", mb: 2 }}
            >
              {arrayLevelError}
            </Typography>
          )}

          {meta.multiEntry && (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 2,
                  cursor: atLimit ? "default" : "pointer",
                }}
                onClick={() => {
                  if (atLimit) return;
                  push({ label: "", url: "" });
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    backgroundColor: "surface.tint",
                    borderRadius: 2,
                    mr: 2,
                  }}
                >
                  <Add fontSize="large" color="primary" sx={{ mt: 1 }} />
                </Box>
                <Button disabled={atLimit}>{meta.addEntryLabel}</Button>
              </Box>
              {atLimit && (
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  Has alcanzado el máximo de {meta.maxEntries} {meta.entryNoun}s
                </Typography>
              )}
            </>
          )}
        </Box>
      )}
    </FieldArray>
  );
};

export default ChannelDetailStep;
