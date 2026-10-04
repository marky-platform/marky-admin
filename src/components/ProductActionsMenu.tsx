import {
  Box,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import { useUpdateProductAvailability } from "../hooks/useProductMutations";
import useDuplicateProduct from "../hooks/useDuplicateProduct";
import { useBusinessAccountInfo } from "../hooks/useBusinessAccountInfo";
import { getPublicProductUrl } from "../utils/publicUrls";
import { ShowNotification } from "../utils/utils";

export interface ProductCategoryRef {
  id: number | null;
  name: string;
}

export interface ProductActionsMenuProduct {
  id?: string | number;
  is_available?: boolean;
  is_active?: boolean;
}

interface ProductActionsMenuProps<P extends ProductActionsMenuProduct> {
  product: P;
  currentCategory?: ProductCategoryRef;
  onPromotionClick?: (product: P) => void;
  onDeleteClick?: (product: P) => void;
  onMoveClick?: (product: P, currentCategory?: ProductCategoryRef) => void;
  /** Lets each call site style the trigger IconButton (background, padding, radius, position) without duplicating the menu logic. */
  triggerSx?: SxProps<Theme>;
  iconFontSize?: "inherit" | "small" | "medium" | "large";
}

function ProductActionsMenu<P extends ProductActionsMenuProduct>({
  product,
  currentCategory,
  onPromotionClick,
  onDeleteClick,
  onMoveClick,
  triggerSx,
  iconFontSize = "small",
}: ProductActionsMenuProps<P>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const updateAvailability = useUpdateProductAvailability();
  const duplicateProduct = useDuplicateProduct();
  const { data: accountInfo } = useBusinessAccountInfo();

  // derive initial availability from product payload (may be snake_case or camelCase)
  const initialIsAvailable = Boolean(
    product.is_available ?? product.is_active ?? true,
  );
  const [isUnavailable, setIsUnavailable] = useState(!initialIsAvailable);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const handleCopyUrl = async () => {
    const businessId = accountInfo?.business_id;
    if (!businessId || product.id === undefined || product.id === null) {
      ShowNotification({
        message: "No se pudo copiar el enlace",
        type: "error",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(
        getPublicProductUrl(businessId, product.id),
      );
      ShowNotification({ message: "Enlace copiado", type: "success" });
      handleClose();
    } catch {
      ShowNotification({
        message: "No se pudo copiar el enlace",
        type: "error",
      });
    }
  };

  return (
    <>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          handleOpen(e);
        }}
        sx={triggerSx}
      >
        <MoreVertIcon fontSize={iconFontSize} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            marginTop: 2,
            backgroundColor: "white",
            p: 1.5, // inner padding
            maxWidth: 320, // optional, for spacing
          },
        }}
      >
        <MenuItem
          onClick={(event: React.MouseEvent<HTMLLIElement>) => {
            event.stopPropagation();
            navigate(ROUTES.PRODUCT_EDIT.replace(":id", product.id + ""));
          }}
          sx={{ py: 4, borderRadius: 2 }}
        >
          <EditIcon fontSize="small" sx={{ mr: 4 }} />
          Editar
        </MenuItem>
        <MenuItem
          disabled={duplicateProduct.isPending}
          onClick={(event: React.MouseEvent<HTMLLIElement>) => {
            event.stopPropagation();
            // Menu stays open (not handleClose()) while the fetch is in
            // flight so the spinner below is visible; on success the
            // hook navigates away, on error the toast fires and the item
            // re-enables so the user can retry or dismiss the menu.
            duplicateProduct.mutate(Number(product.id));
          }}
          sx={{ py: 4, borderRadius: 2 }}
        >
          {duplicateProduct.isPending ? (
            <CircularProgress size={20} sx={{ mr: 4 }} />
          ) : (
            <FileCopyIcon fontSize="small" sx={{ mr: 4 }} />
          )}
          Duplicar
        </MenuItem>
        <MenuItem
          onClick={(event: React.MouseEvent<HTMLLIElement>) => {
            event.stopPropagation();
            onMoveClick?.(product, currentCategory);
            handleClose();
          }}
          sx={{ py: 4, borderRadius: 2 }}
        >
          <DriveFileMoveOutlinedIcon fontSize="small" sx={{ mr: 4 }} />
          Mover a categoría
        </MenuItem>
        <MenuItem
          onClick={(event: React.MouseEvent<HTMLLIElement>) => {
            event.stopPropagation();
            onPromotionClick?.(product);
            handleClose();
          }}
          sx={{ py: 4, borderRadius: 2 }}
        >
          <LocalOfferIcon fontSize="small" sx={{ mr: 4 }} />
          Producto en promoción
        </MenuItem>
        <MenuItem
          onClick={(event: React.MouseEvent<HTMLLIElement>) => {
            event.stopPropagation();
            handleCopyUrl();
          }}
          sx={{ py: 4, borderRadius: 2 }}
        >
          <ContentCopyIcon fontSize="small" sx={{ mr: 4 }} />
          Copiar URL
        </MenuItem>
        <MenuItem
          onClick={(event: React.MouseEvent<HTMLLIElement>) => {
            event.stopPropagation();
            onDeleteClick?.(product);
            handleClose();
          }}
          sx={{ color: "error.main", py: 4, borderRadius: 2 }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 4 }} />
          Eliminar
        </MenuItem>
        <Divider />
        <Box px={2} py={1}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isUnavailable}
                disabled={updateAvailability.isPending}
                onChange={async (e) => {
                  const checked = e.target.checked; // checked === true means "No disponible"
                  const previous = isUnavailable;

                  // optimistic update
                  setIsUnavailable(checked);

                  const id = product.id;
                  if (id) {
                    const fd = new FormData();
                    // persist only the is_available field on the backend
                    const newIsAvailable = !checked;
                    fd.append(
                      "is_available",
                      newIsAvailable ? "true" : "false",
                    );
                    try {
                      await updateAvailability.mutateAsync({
                        id: Number(id),
                        product: fd,
                      });
                      // close the dropdown menu after successful update
                      handleClose();
                    } catch (err) {
                      // revert optimistic update on error
                      setIsUnavailable(previous);
                    }
                  }
                }}
              />
            }
            label={
              <Box>
                <Typography>No disponible</Typography>
              </Box>
            }
          />
          <Box>
            <Typography variant="caption" color="textDisabled">
              Al marcar esta opción, el producto continuará mostrándose pero con
              el estado "No disponible"
            </Typography>
          </Box>
        </Box>
      </Menu>
    </>
  );
}

export default ProductActionsMenu;
