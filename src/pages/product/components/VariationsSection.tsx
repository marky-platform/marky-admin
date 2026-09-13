import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { Field, FieldArray, FormikProps, getIn } from "formik";
import NumberInput from "../../../components/NumberInput";
import { useBusinessAccountInfo } from "../../../hooks/useBusinessAccountInfo";
import { useImageCropper } from "../../../hooks/useImageCropper";
import { useMediaObjectUrl } from "../../../hooks/useMediaObjectUrl";
import ImageCropModal from "../../../components/ImageCropModal";
import Input from "../../../components/Input";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { ReactComponent as AddVariationImageIcon } from "../../../assets/icons/product-form/add-variation-picture.svg";

// Renders a variant's image preview via the shared useMediaObjectUrl hook
// (create/revoke the object URL only when the underlying image actually
// changes, instead of on every render). `image` is typed `unknown` here
// because it comes straight off a FieldArray row; unsupported shapes fall
// back to rendering nothing instead of throwing.
const VariantImagePreview: React.FC<{ image: unknown }> = ({ image }) => {
  const file =
    typeof image === "string" || image instanceof File || image instanceof Blob
      ? image
      : null;
  const url = useMediaObjectUrl(file);

  if (!url) return null;
  return (
    <img
      src={url}
      alt="Variant"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
};

interface VariationsSectionProps extends FormikProps<any> {
  maxItems?: number;
  // Lifted up to ProductFormPage so the "Activar multi presentaciones"
  // selection survives switching to another tab and back (switching tabs
  // unmounts this component, which would otherwise reset any local state
  // back to its default).
  multiPresentation: boolean;
  onMultiPresentationChange: (value: boolean) => void;
}

const VariationsSection: React.FC<VariationsSectionProps> = ({
  values,
  errors,
  touched,
  setFieldValue,
  setFieldTouched,
  handleChange,
  handleBlur,
  maxItems = 10,
  multiPresentation,
  onMultiPresentationChange,
}) => {
  const { data: businessAccountInfo } = useBusinessAccountInfo();
  const currencyCode = businessAccountInfo?.primary_currency_code;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState<number | null>(
    null
  );

  const {
    crop,
    zoom,
    croppingMedia,
    imageUrl,
    setCrop,
    setZoom,
    handleCropComplete,
    handleOpenCropModal,
    handleCloseCropModal,
    handleApplyCrop,
    handleZoomChange,
  } = useImageCropper((croppedImage) => {
    if (activeVariantIndex !== null) {
      setFieldValue(`variants[${activeVariantIndex}].image`, croppedImage);
      setFieldTouched(`variants[${activeVariantIndex}].image`, true, false);
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleOpenCropModal(file);
    }
    // Reset file input to allow selecting the same file again
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleIconClick = (index: number) => {
    setActiveVariantIndex(index);
    fileInputRef.current?.click();
  };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "grey.100",
        borderRadius: 2,
        p: 4,
      }}
    >
      <ImageCropModal
        open={!!croppingMedia}
        onClose={handleCloseCropModal}
        onApply={handleApplyCrop}
        image={imageUrl}
        crop={crop}
        zoom={zoom}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={handleCropComplete}
        handleZoomChange={handleZoomChange}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/*"
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <LocalOfferIcon />
        <Typography variant="h6" fontWeight="bold">
          Variaciones del producto base{" "}
          {multiPresentation &&
            `${values.variants.filter((v: any) => !v._delete).length}/${maxItems}`}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Agrega variantes de tu producto base. Ej. Presentación 24 oz / 8 oz / 4 oz
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={multiPresentation}
            onChange={(e) => onMultiPresentationChange(e.target.checked)}
          />
        }
        label="Activar presentaciones múltiples"
      />
      {multiPresentation && (
        <FieldArray name="variants">
          {({ push, remove }) => {
            const visibleVariants = values.variants
              .map((variant: any, index: number) => ({ variant, index }))
              .filter(({ variant }: any) => !variant._delete);
            return (
            <Box mt={2}>
              {visibleVariants.map(({ variant, index }: any) => {
                const imageError =
                  getIn(touched, `variants[${index}].image`) &&
                  getIn(errors, `variants[${index}].image`);
                return (
                <Box
                  key={index}
                  sx={{
                    border: "1px solid",
                    borderColor: "grey.100",
                    borderRadius: 1,
                    p: 3,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    backgroundColor: "grey.50",
                  }}
                >
                  {/* IMAGE */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        border: "2px dashed",
                        borderColor: imageError ? "error.main" : "primary.main",
                        borderRadius: 2,
                        width: 80,
                        height: 80,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        overflow: "hidden",
                      }}
                      onClick={() => handleIconClick(index)}
                    >
                      {variant.image ? (
                        <VariantImagePreview image={variant.image} />
                      ) : (
                        <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                          <IconButton size="small" sx={{ p: 0 }}>
                            <AddVariationImageIcon />
                          </IconButton>
                          <Typography
                            variant="caption"
                            fontWeight="bold"
                            color={imageError ? "error.main" : "primary.main"}
                          >
                            Agregar
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      color={imageError ? "error.main" : "text.secondary"}
                      textAlign="center"
                      sx={{ mt: 0.5, maxWidth: 90 }}
                    >
                      {imageError ? "Imagen requerida" : "Imagen *"}
                    </Typography>
                  </Box>
                  {/* FIELDS: name on its own row, description + price below it */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      gap: 1,
                    }}
                  >
                    <Input
                      name={`variants[${index}].name`}
                      label="Nombre de presentación"
                      placeholder="Nombre de presentación"
                      value={variant.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      maxLength={32}
                      counterPosition="none"
                      error={
                        getIn(touched, `variants[${index}].name`) &&
                        Boolean(getIn(errors, `variants[${index}].name`))
                      }
                      helperText={
                        getIn(touched, `variants[${index}].name`)
                          ? getIn(errors, `variants[${index}].name`)
                          : undefined
                      }
                      InputProps={{
                        sx: {
                          backgroundColor: "white",
                        },
                      }}
                    />

                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                      <Box sx={{ flex: 2 }}>
                        <Input
                          name={`variants[${index}].description`}
                          label="Descripción"
                          placeholder="Descripción"
                          value={variant.description}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                          maxLength={32}
                          counterFormat="fraction"
                          counterPosition="label"
                          error={
                            getIn(touched, `variants[${index}].description`) &&
                            Boolean(getIn(errors, `variants[${index}].description`))
                          }
                          helperText={
                            getIn(touched, `variants[${index}].description`)
                              ? getIn(errors, `variants[${index}].description`)
                              : undefined
                          }
                          InputProps={{
                            sx: {
                              backgroundColor: "white",
                            },
                          }}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Field
                          name={`variants[${index}].price`}
                          component={NumberInput}
                          label="Precio"
                          required
                          fullWidth
                          margin="normal"
                          InputProps={{
                            sx: {
                              backgroundColor: "white",
                            },
                            endAdornment: currencyCode ? (
                              <InputAdornment position="end">
                                <Typography variant="body2">{`[${currencyCode}]`}</Typography>
                              </InputAdornment>
                            ) : undefined,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  {/* DELETE BUTTON */}
                  <IconButton
                    aria-label="Eliminar presentación"
                    onClick={() => {
                      // Persisted rows (real DB id) are soft-deleted so the
                      // submit handler can send a { id, _delete: true }
                      // tombstone the backend understands. Rows that were
                      // never saved (no id yet) can just be spliced out.
                      if (variant.id) {
                        setFieldValue(`variants[${index}]._delete`, true);
                      } else {
                        remove(index);
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
                );
              })}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 4,
                  cursor:
                    visibleVariants.length >= maxItems ? "default" : "pointer",
                }}
                onClick={() => {
                  if (visibleVariants.length >= maxItems) return;
                  push({
                    name: "",
                    description: "",
                    price: "",
                    image: null,
                  });
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    backgroundColor: "#DBE9F9",
                    borderRadius: 2,
                    mr: 2,
                  }}
                >
                  <Add fontSize="large" color="primary" sx={{ mt: 1 }} />
                </Box>
                <Button disabled={visibleVariants.length >= maxItems}>
                  Añadir otra presentación
                </Button>
              </Box>
            </Box>
            );
          }}
        </FieldArray>
      )}
    </Box>
  );
};

export default VariationsSection;
