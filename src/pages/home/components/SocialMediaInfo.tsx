import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
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

// Pequeña burbuja con el conteo, superpuesta al borde inferior del ícono
// (mt negativo), por spec de Figma -- reemplaza el Badge de notificación
// que se usaba antes.
const CountBubble: React.FC<{ count: number }> = ({ count }) => (
  <Box
    sx={{
      mt: -2,
      px: 2,
      lineHeight: "16px",
      bgcolor: (theme) => theme.palette.grey[50],
      border: (theme) => `1px solid ${theme.palette.primary.main}`,
      borderRadius: 1,
    }}
  >
    <Typography
      sx={{
        color: (theme) => theme.palette.primary.main,
        fontSize: 12,
        lineHeight: "16px",
      }}
    >
      {count}
    </Typography>
  </Box>
);

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
    // Un solo registro configurado abre directo, sin importar si el canal
    // admite varios (WhatsApp/Enlaces) o uno solo (Instagram/Facebook/
    // TikTok) -- lo que decide es cuántos registros hay realmente, no el
    // tipo de canal.
    if (entries.length === 1) {
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
    if (filledLocations.length === 1) {
      openExternalUrl(buildLocationMapsUrl(filledLocations[0].address));
      return;
    }
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
          alignItems="flex-start"
          gap={3}
          sx={{ justifyContent: "center" }}
        >
          {filledChannels.map(({ key, entries }) => {
            const meta = CHANNEL_META[key];
            const IconComponent = meta.icon;
            const handleClick = () => handleChannelClick(key, entries);
            return (
              <Box
                key={key}
                display="flex"
                flexDirection="column"
                alignItems="center"
                sx={{ width: 42 }}
              >
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label={meta.label}
                  onClick={handleClick}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleClick();
                  }}
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
                {entries.length > 1 && <CountBubble count={entries.length} />}
              </Box>
            );
          })}

          {hasAnyChannels && hasLocations && (
            <Box
              sx={{
                width: "1px",
                height: 32,
                bgcolor: (theme) => theme.palette.grey[800],
                alignSelf: "center",
              }}
            />
          )}

          {hasLocations && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              sx={{ width: 42 }}
            >
              <Box
                role="button"
                tabIndex={0}
                aria-label="Ubicaciones"
                onClick={handleLocationsClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleLocationsClick();
                }}
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
              {filledLocations.length > 1 && (
                <CountBubble count={filledLocations.length} />
              )}
            </Box>
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
