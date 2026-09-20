import { Box, Typography } from "@mui/material";
import { StorefrontOutlined } from "@mui/icons-material";
import React from "react";
import BusinessAvatar from "../pages/home/components/BusinessAvatar";
import DescriptionInfo from "../pages/home/components/DescriptionInfo";
import AttributesInfo from "../pages/home/components/AttributesInfo";
import SocialMediaInfo from "../pages/home/components/SocialMediaInfo";
import { LocationEntryValue } from "../pages/home/components/LocationsModal";
import { ChannelsByKey } from "../types/channel";

interface BusinessProfilePanelAttribute {
  id: number;
  name: string;
}

interface BusinessProfilePanelProps {
  name: string;
  categoriesText: string;
  photo: unknown;
  description: string;
  attributes: BusinessProfilePanelAttribute[];
  socialMedia: ChannelsByKey;
  locations: LocationEntryValue[];
  /** Public/read-only rendering: hides every empty-state "Agrega..." CTA. */
  readOnly?: boolean;
  /** Replaces the plain avatar (e.g. admin's upload-overlay wrapper). */
  avatarSlot?: React.ReactNode;
  /** Rendered below the description/attributes block (e.g. admin's ProfileActionsRow). */
  actionsSlot?: React.ReactNode;
  /** Rendered between the avatar block and the social-media row (e.g. admin's
   * "Completa el perfil de tu negocio" nudge). Never used on the public page. */
  nudgeSlot?: React.ReactNode;
  onOpenDescription?: () => void;
  onOpenAttributes?: () => void;
  onEmptySocialMedia?: () => void;
}

const BusinessProfilePanel: React.FC<BusinessProfilePanelProps> = ({
  name,
  categoriesText,
  photo,
  description,
  attributes,
  socialMedia,
  locations,
  readOnly = false,
  avatarSlot,
  actionsSlot,
  nudgeSlot,
  onOpenDescription = () => {},
  onOpenAttributes = () => {},
  onEmptySocialMedia = () => {},
}) => {
  return (
    <Box display="flex" flexDirection="column" gap={{ xs: "18px", md: 6 }}>
      {/* Datos principales del negocio (avatar, nombre, categoría, tipo de cuenta) */}
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        {avatarSlot ?? <BusinessAvatar photo={photo} size={100} />}
        <Typography
          variant="h3"
          mt={1}
          sx={{ fontSize: "18px", fontWeight: 500 }}
        >
          {name}
        </Typography>
        <Typography variant="body2">{categoriesText}</Typography>
        <Box display="flex" alignItems="center" gap={0.5}>
          <StorefrontOutlined sx={{ fontSize: 14, color: "#2563EB" }} />
          <Typography sx={{ fontSize: 12, color: "#2563EB", fontWeight: 400 }}>
            Negocio
          </Typography>
        </Box>
      </Box>
      {nudgeSlot}
      {/* Redes sociales */}
      <SocialMediaInfo
        socialMedia={socialMedia}
        locations={locations}
        businessName={name}
        onEmptyState={onEmptySocialMedia}
        readOnly={readOnly}
      />
      <Box display="flex" flexDirection="column" gap={2}>
        {/* Descripción */}
        <DescriptionInfo
          description={description}
          onOpen={onOpenDescription}
          readOnly={readOnly}
        />
        {/* Atributos */}
        <AttributesInfo
          attributes={attributes}
          onOpen={onOpenAttributes}
          readOnly={readOnly}
        />
      </Box>
      {actionsSlot}
    </Box>
  );
};

export default BusinessProfilePanel;
