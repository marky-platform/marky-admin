import { ArrowBack } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  Typography,
} from "@mui/material";
import { FormikProps } from "formik";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as DuplicateProductIcon } from "../../../assets/icons/product-form/duplicate-product.svg";
import { ReactComponent as TrashIcon } from "../../../assets/icons/trash-icon.svg";
import { Product } from "../../../types/product";
import { useUpdateProductAvailability } from "../../product/../../hooks/useProductMutations";

interface ProductFormHeaderProps {
  formik: FormikProps<Product>;
  onDeleteClick?: () => void;
  onDuplicateClick?: () => void;
  onBack?: () => void;
  // Defaults to "Configuración" (desktop). On mobile, ProductFormPage passes
  // the current section's name while a non-"Producto" section is open, so
  // the header reads e.g. "Variaciones" instead.
  title?: string;
}

const ProductFormHeader: React.FC<ProductFormHeaderProps> = ({
  formik,
  onDeleteClick,
  onDuplicateClick,
  onBack,
  title = "Configuración",
}) => {
  const updateAvailability = useUpdateProductAvailability();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        my: 3,
        mx: { xs: 1, md: 10 },
        pb: 3,
        borderBottom: 1,
        borderColor: "grey.400",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            padding: 1,
            backgroundColor: "grey.400",
            borderRadius: 2,
            ml: { xs: 2, md: 0 },
            flexShrink: 0,
          }}
        >
          <IconButton onClick={() => (onBack ? onBack() : navigate(-1))}>
            <ArrowBack />
          </IconButton>
        </Box>
        <Typography
          variant="h2"
          fontWeight="bold"
          noWrap
          sx={{ ml: { xs: 1, md: 2 }, minWidth: 0, fontSize: { xs: 20, md: 24 } }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 }, flexShrink: 0 }}>
        <FormControlLabel
          control={
            <Switch
              // bind to is_available; keep is_active in sync for backward compatibility
              checked={Boolean(
                formik.values.is_available ?? formik.values.is_active,
              )}
              disabled={updateAvailability.isPending}
              onChange={async (e) => {
                const checked = e.target.checked;
                // keep previous value to restore on error
                const previous = Boolean(
                  formik.values.is_available ?? formik.values.is_active,
                );

                // optimistic update to formik (only the field changed)
                formik.setFieldValue("is_available", checked);

                // if editing an existing product, call API to persist only availability
                const id = (formik.values as any).id;
                if (id) {
                  const fd = new FormData();
                  // persist only the is_available field on the backend
                  fd.append("is_available", checked ? "true" : "false");
                  try {
                    await updateAvailability.mutateAsync({ id, product: fd });
                  } catch (err) {
                    // revert optimistic update
                    formik.setFieldValue("is_available", previous);
                    formik.setFieldValue("is_active", previous);
                  }
                }
              }}
              name="is_available"
            />
          }
          label="Disponible"
          sx={{ mr: { xs: 0 } }}
        />
        <IconButton
          onClick={handleMenuClick}
          sx={{
            borderRadius: 2,
            backgroundColor: "grey.100",
          }}
        >
          <MoreVertIcon />
        </IconButton>
        {/*  */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              marginTop: 2,
              backgroundColor: "white",
              p: 2,
              width: 260,
              borderRadius: 3,
              boxShadow: "1px 2px 3.5px rgba(194, 194, 194, 0.6)",
            },
          }}
        >
          {formik.values && (formik.values as any).id ? (
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onDuplicateClick?.();
              }}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 2,
                display: "flex",
                gap: 4,
                "&:hover": { backgroundColor: "grey.50" },
              }}
            >
              <DuplicateProductIcon width={24} height={24} />
              <Typography variant="body2" color="text.secondary">
                Duplicar producto
              </Typography>
            </MenuItem>
          ) : null}
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onDeleteClick?.();
            }}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 2,
              display: "flex",
              gap: 4,
            }}
          >
            <TrashIcon width={18} height={19} />
            <Typography variant="body2" color="error">
              Eliminar producto
            </Typography>
          </MenuItem>

          <Divider sx={{ my: 1 }} />

          <Box px={3} py={2}>
            <FormControlLabel
              control={
                <Checkbox
                  // checked when product is hidden (is_active === false)
                  checked={!formik.values.is_active}
                  disabled={updateAvailability.isPending}
                  onChange={async (e) => {
                    const checked = e.target.checked; // checked === true means "hide"
                    const previous = Boolean(formik.values.is_active);

                    const newIsActive = !checked; // hide => is_active = false

                    // optimistic update locally (only is_active)
                    formik.setFieldValue("is_active", newIsActive);

                    const id = (formik.values as any).id;
                    if (id) {
                      const fd = new FormData();
                      // persist only the is_active field on the backend
                      fd.append("is_active", newIsActive ? "true" : "false");
                      try {
                        await updateAvailability.mutateAsync({
                          id,
                          product: fd,
                        });
                      } catch (err) {
                        // revert optimistic update on error
                        formik.setFieldValue("is_active", previous);
                        formik.setFieldValue("is_available", previous);
                      }
                    }
                  }}
                />
              }
              label={<Typography variant="body2">Ocultar producto</Typography>}
              sx={{
                "& .MuiSvgIcon-root": {
                  fontSize: 22,
                },
              }}
            />
            <Box mt={1}>
              <Typography variant="caption" color="grey.900">
                Al marcar esta opción, el producto se ocultará a sus comensales.
                Tu si podrás verlo.
              </Typography>
            </Box>
          </Box>
        </Menu>
        {/*  */}
      </Box>
    </Box>
  );
};

export default ProductFormHeader;
