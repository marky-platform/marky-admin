import React from "react";
import { Avatar, SxProps, Theme } from "@mui/material";
import { useThemeAssets } from "../../../themes/useThemeAssets";

interface BusinessAvatarProps {
  // Puede ser un File recién seleccionado (aún no subido) o la URL que
  // devuelve el backend.
  photo?: unknown;
  size: number;
  sx?: SxProps<Theme>;
}

// Avatar con el mismo fallback ("marca de agua" de Marky) en todos los
// lugares donde se muestra la foto de perfil del negocio (Home, modal de
// Presentación en desktop y mobile), para que el estado "sin foto" se vea
// igual en todos lados.
const BusinessAvatar: React.FC<BusinessAvatarProps> = ({ photo, size, sx }) => {
  const { defaultAvatar } = useThemeAssets();
  // El backend siempre completa BusinessProfile.profile_image con un default
  // ("business_profiles/default.png") cuando el negocio no subió una foto,
  // así que un valor no vacío no implica necesariamente que haya una foto
  // real: ese path puntual se trata igual que "sin foto".
  const isBackendDefaultPhoto =
    typeof photo === "string" &&
    photo.includes("business_profiles/default.png");
  const photoSrc =
    photo instanceof File
      ? URL.createObjectURL(photo)
      : !isBackendDefaultPhoto && photo
        ? (photo as string)
        : undefined;
  const hasPhoto = Boolean(photoSrc);

  return (
    <Avatar
      src={photoSrc}
      sx={{
        width: size,
        height: size,
        border: (theme) =>
          `1px solid ${
            hasPhoto ? theme.palette.border.avatar : theme.palette.border.field
          }`,
        backgroundColor: hasPhoto ? "surface.avatar" : "surface.disabled",
        ...sx,
      }}
    >
      {!hasPhoto && (
        <img
          src={defaultAvatar}
          alt="Marky"
          style={{ width: "45%", height: "45%", objectFit: "contain" }}
        />
      )}
    </Avatar>
  );
};

export default BusinessAvatar;
