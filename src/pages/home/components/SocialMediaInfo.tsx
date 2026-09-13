import React, { useState } from "react";
import { Badge, Box, Typography } from "@mui/material";
import { ALL_CHANNEL_KEYS, CHANNEL_META } from "./channels/channels.constants";
import { ChannelEntry, ChannelKey, ChannelsByKey } from "../../../types/channel";
import { buildChannelExternalUrl } from "../../../mappers/channelMapper";
import { openExternalUrl, buildLocationMapsUrl } from "../../../utils/externalLinks";
import { ReactComponent as LocationIcon } from "../../../assets/icons/location-marker.svg";
import EntryListPopup, { EntryListPopupItem } from "./EntryListPopup";
import { LocationEntryValue } from "./LocationsModal";

interface SocialMediaInfoProps {
  socialMedia: ChannelsByKey;
  locations: LocationEntryValue[];
  businessName: string;
  onEmptyState: () => void;
}

interface ActivePopup {
  icon: React.ReactNode;
  subtitle: string;
  items: EntryListPopupItem[];
}

const SocialMediaInfo: React.FC<SocialMediaInfoProps> = ({
  socialMedia,
  locations,
  businessName,
  onEmptyState,
}) => {
  const [activePopup, setActivePopup] = useState<ActivePopup | null>(null);

  const filledChannels = ALL_CHANNEL_KEYS.map((key) => ({
    key,
    entries: (socialMedia?.[key] || []).filter(
      (entry) => entry.url && entry.url.trim() !== "",
    ),
  })).filter(({ entries }) => entries.length > 0);

  const hasAnyChannels = filledChannels.length > 0;
  const filledLocations = locations || [];
  const hasLocations = filledLocations.length > 0;
  const isEmpty = !hasAnyChannels && !hasLocations;

  const handleChannelClick = (key: ChannelKey, entries: ChannelEntry[]) => {
    const meta = CHANNEL_META[key];
    if (!meta.multiEntry) {
      openExternalUrl(buildChannelExternalUrl(key, entries[0]));
      return;
    }
    const IconComponent = meta.icon;
    setActivePopup({
      icon: <IconComponent style={{ width: 28, height: 28 }} />,
      subtitle: key === "whatsapp" ? "Canales WhatsApp" : "Enlaces oficiales",
      items: entries.map((entry, i) => ({
        id: entry.id ?? i,
        label: entry.label || meta.label,
        onSelect: () => openExternalUrl(buildChannelExternalUrl(key, entry)),
      })),
    });
  };

  const handleLocationsClick = () => {
    setActivePopup({
      icon: <LocationIcon width={26} height={26} />,
      subtitle: "Ubicaciones",
      items: filledLocations.map((loc, i) => ({
        id: loc.id ?? i,
        label: loc.name,
        onSelect: () => openExternalUrl(buildLocationMapsUrl(loc.address)),
      })),
    });
  };

  return (
    <>
      {isEmpty ? (
        <Box
          onClick={onEmptyState}
          sx={{
            border: "1px dashed #B8CDF5",
            backgroundColor: "#FAFCFF",
            borderRadius: "6px",
            py: 4,
            px: 3,
            cursor: "pointer",
          }}
        >
          <Typography
            sx={{
              color: "#2563EB",
              fontWeight: 700,
              fontSize: 14,
              lineHeight: "22px",
              textAlign: "center",
            }}
          >
            Agrega tus canales
          </Typography>
        </Box>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          gap={3}
          sx={{ justifyContent: "center" }}
        >
          {filledChannels.map(({ key, entries }) => {
            const IconComponent = CHANNEL_META[key].icon;
            return (
              <Badge
                key={key}
                badgeContent={entries.length > 1 ? entries.length : undefined}
                color="primary"
              >
                <Box
                  onClick={() => handleChannelClick(key, entries)}
                  sx={{
                    width: 42,
                    height: 42,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: (theme) => `1px solid ${theme.palette.grey[800]}`,
                    borderRadius: 1,
                    cursor: "pointer",
                  }}
                >
                  <IconComponent style={{ width: 26, height: 26 }} />
                </Box>
              </Badge>
            );
          })}

          {hasAnyChannels && hasLocations && (
            <Box
              sx={{
                width: "1px",
                height: 32,
                bgcolor: (theme) => theme.palette.grey[800],
              }}
            />
          )}

          {hasLocations && (
            <Badge
              badgeContent={
                filledLocations.length > 1 ? filledLocations.length : undefined
              }
              color="primary"
            >
              <Box
                onClick={handleLocationsClick}
                sx={{
                  width: 42,
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: (theme) => `1px solid ${theme.palette.grey[800]}`,
                  borderRadius: 1,
                  cursor: "pointer",
                }}
              >
                <LocationIcon width={26} height={26} />
              </Box>
            </Badge>
          )}
        </Box>
      )}

      <EntryListPopup
        open={!!activePopup}
        onClose={() => setActivePopup(null)}
        businessName={businessName}
        icon={activePopup?.icon}
        subtitle={activePopup?.subtitle ?? ""}
        items={activePopup?.items ?? []}
      />
    </>
  );
};

export default SocialMediaInfo;
