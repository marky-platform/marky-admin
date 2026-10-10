import {
  Box,
  ButtonBase,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { HomePageData } from "../../../services/businessService";
import BusinessAvatar from "./BusinessAvatar";
import BusinessProfilePanel from "../../../components/BusinessProfilePanel";
import ProfileActionsRow from "./ProfileActionsRow";
import { LocationEntryValue } from "./LocationsModal";
import { EditOutlined, PhotoCamera } from "@mui/icons-material";

export const BusinessInfo: React.FC<{
  values: any;
  homePageData?: HomePageData;
  setFieldValue: (field: string, value: any) => void;
  locations: LocationEntryValue[];
  onOpenEditProfile: () => void;
  openDescriptionModal: () => void;
  openAttributesModal: () => void;
  onOpenPhotoPicker: () => void;
  onSettings?: () => void;
}> = ({
  values,
  homePageData,
  locations,
  onOpenEditProfile,
  openDescriptionModal,
  openAttributesModal,
  onOpenPhotoPicker,
  onSettings = () => {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Get business name - use API data if available, otherwise placeholder
  const businessName =
    homePageData?.business_name || values.business_name || "nombre_del_negocio";

  // Get categories - use API data if available, otherwise placeholder
  const categoriesText = homePageData?.categories?.length
    ? homePageData.categories.map((cat) => cat.name).join(" | ")
    : values.category || "Panaderia | Cafetería";

  const hasAnySocialMedia = Object.values(values.socialMedia || {}).some(
    (entries: any) =>
      Array.isArray(entries) &&
      entries.some((entry: any) => entry.url && entry.url.trim() !== ""),
  );
  const isProfileIncomplete =
    !hasAnySocialMedia ||
    !values.description ||
    (values.attributes || []).length === 0;

  return (
    <BusinessProfilePanel
      name={businessName}
      categoriesText={categoriesText}
      photo={values.profilePhoto}
      description={values.description}
      attributes={values.attributes}
      socialMedia={values.socialMedia}
      locations={locations}
      onOpenDescription={openDescriptionModal}
      onOpenAttributes={openAttributesModal}
      onEmptySocialMedia={onOpenEditProfile}
      titleActionSlot={
        // Solo mobile: en desktop la acción vive en ProfileActionsRow.
        isMobile ? (
          <ButtonBase
            aria-label="Editar perfil"
            onClick={onOpenEditProfile}
            sx={{
              position: "relative",
              bgcolor: "#EDEDED",
              borderRadius: "56px",
              px: 2,
              py: 0.5,
              // El pill visible es chico (16px de ícono); el área táctil real
              // se amplía sin cambiar el layout.
              "&::after": {
                content: '""',
                position: "absolute",
                inset: "-12px -8px",
              },
            }}
          >
            <EditOutlined sx={{ fontSize: 16 }} />
          </ButtonBase>
        ) : undefined
      }
      avatarSlot={
        <Box
          onClick={onOpenPhotoPicker}
          sx={{
            position: "relative",
            cursor: "pointer",
            width: 100,
            height: 100,
            "&:hover .edit-icon": {
              display: "flex",
            },
          }}
        >
          <BusinessAvatar photo={values.profilePhoto} size={100} />
          <Box
            className="edit-icon"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              color: "white",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}
          >
            <PhotoCamera />
          </Box>
        </Box>
      }
      nudgeSlot={
        isProfileIncomplete && (
          <Typography
            sx={{
              color: "#374151",
              fontWeight: 700,
              fontSize: 14,
              lineHeight: "18px",
              textAlign: "center",
            }}
          >
            Completa el perfil de tu negocio
          </Typography>
        )
      }
      actionsSlot={
        <ProfileActionsRow onEditProfile={onOpenEditProfile} onSettings={onSettings} />
      }
    />
  );
};
