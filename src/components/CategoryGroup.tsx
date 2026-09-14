import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import categoryIcons from "../assets/icons/category/categoryIcons";
import { ReactComponent as CrownIcon } from "../assets/icons/crown.svg";
import AddProductTileIcon from "../assets/icons/add-product-tile-icon.svg";
import { ROUTES } from "../routes/paths";
import { CategoryWithProducts } from "../types/categoryWithProducts";
import { usePromotionCountdown } from "../hooks/usePromotionCountdown";
import ProductCard from "./ProductCard";

interface CategoryGroupProps {
  category: CategoryWithProducts;
  onPromotionClick?: (category: CategoryWithProducts) => void;
  onDeleteCategory?: () => void;
  onToggleAvailability?: (checked: boolean) => void;
  onProductPromotionClick?: (product: any) => void;
  onProductDeleteClick?: (product: any) => void;
  onProductMoveClick?: (
    product: any,
    currentCategory: { id: number | null; name: string },
  ) => void;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({
  category,
  onPromotionClick,
  onDeleteCategory,
  onToggleAvailability,
  onProductPromotionClick,
  onProductDeleteClick,
  onProductMoveClick,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // no local-only state: rely on query cache optimistic updates
  const isUnavailable = !category.is_available;
  const navigate = useNavigate();

  const promotionCountdown = usePromotionCountdown({
    status: category.promotion_status,
    startsAt: category.promotion_starts_at,
    endsAt: category.promotion_ends_at,
  });

  const renderPromotionBadge = () => {
    if (!promotionCountdown) return null;

    // The countdown badge always uses a fixed urgency color keyed to the
    // phase (amber while scheduled, red while actively counting down). It
    // must never depend on discount, multibuy, price, or any other
    // category/product attribute.
    return (
      <Box
        sx={{
          backgroundColor:
            promotionCountdown.phase === "starts"
              ? "warning.main"
              : "error.main",
          color: "white",
          px: 2,
          py: 0.5,
          borderRadius: 1,
          fontSize: 14,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          ml: 2,
        }}
      >
        {promotionCountdown.label}
      </Box>
    );
  };

  const renderAvailabilityBadge = () => {
    if (category.is_available) return null;
    return (
      <Box
        sx={{
          backgroundColor: "#BDBDBD",
          color: "white",
          px: 2,
          py: 1,
          borderRadius: 1,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          ml: 2,
        }}
      >
        <Typography color="white" fontWeight={500}>
          No disponible
        </Typography>
      </Box>
    );
  };

  const open = Boolean(anchorEl);
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const getIconComponent = (cat: CategoryWithProducts) => {
    const IconComponent =
      cat.icon && categoryIcons[cat.icon] ? categoryIcons[cat.icon] : null;

    return (
      <Box
        sx={{
          backgroundColor: "grey.200",
          borderRadius: 2,
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {IconComponent ? (
          <IconComponent fontSize="small" />
        ) : (
          <CrownIcon fontSize="small" />
        )}
      </Box>
    );
  };

  return (
    <Box mb={6}>
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        mb={2}
        sx={{
          position: "sticky",
          // Debe coincidir exactamente con la altura fija del AppBar
          // (Header.tsx, Toolbar minHeight/maxHeight: 55) para que el
          // encabezado de categoría quede pegado justo debajo, sin dejar un
          // hueco donde se filtre el contenido que sigue haciendo scroll.
          top: "55px",
          // Above every card-level element (badges, hover, action button —
          // the highest of which is zIndex 2) so products always scroll
          // underneath the category header instead of bleeding over it.
          zIndex: 20,
          backgroundColor: "white",
          borderBottom: "1px solid #E5E7EB",
          py: 2,
        }}
      >
        <Box display="flex" alignItems="center" gap={3}>
          {getIconComponent(category)}
          <Typography variant="subtitle1" fontWeight="bold">
            {category.name}
          </Typography>
        </Box>
        {renderPromotionBadge()}
        {renderAvailabilityBadge()}
        <Tooltip title="Más acciones">
          <IconButton
            onClick={handleOpen}
            sx={{
              borderRadius: 2,
              p: 2,
              backgroundColor: "grey.50",
              "&:hover, &:focus-visible": { backgroundColor: "grey.200" },
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
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
            onClick={() => {
              navigate(ROUTES.PRODUCT_CREATE, {
                state: {
                  preselectedCategory: { id: category.id, name: category.name },
                },
              });
              handleClose();
            }}
            sx={{
              borderRadius: 2,
              p: 3,
              display: "flex",
              gap: 4,
            }}
          >
            <AddIcon fontSize="medium" />
            <Typography>Añadir producto</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => {
              onPromotionClick?.(category);
              handleClose();
            }}
            sx={{
              borderRadius: 2,
              p: 3,
              display: "flex",
              gap: 4,
            }}
          >
            <LocalOfferIcon fontSize="medium" />
            <Typography>Categoría en promoción</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => {
              onDeleteCategory?.();
              handleClose();
            }}
            sx={{
              borderRadius: 2,
              p: 3,
              display: "flex",
              gap: 4,
            }}
          >
            <DeleteIcon fontSize="medium" />
            <Typography color="error">Eliminar categoría</Typography>
          </MenuItem>
          <Divider />
          <Box px={2} py={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isUnavailable}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onToggleAvailability?.(checked);
                  }}
                />
              }
              label={<Typography variant="body2">No disponible</Typography>}
              sx={{
                "& .MuiSvgIcon-root": {
                  fontSize: 28, // Bigger checkbox
                  borderRadius: 6, // Rounded corners (not fully circular)
                },
              }}
            />
            <Box>
              <Typography variant="caption" color="textDisabled">
                Al marcar esta opción, todos los productos continuarán
                mostrándose pero con el estado "No disponible"
              </Typography>
            </Box>
          </Box>
        </Menu>
      </Box>

      {/* Grid of products */}
      <Box
        display={"grid"}
        gridTemplateColumns={{
          xs: "repeat(3, 1fr)", // 3 columns on phones
          sm: "repeat(3, 1fr)", // 3 on tablets
          md: "repeat(4, 1fr)", // 4 on medium
          lg: "repeat(5, 1fr)", // ✅ 5 columns on large screens
        }}
        gap={{ xs: 4, sm: 4, lg: 6 }}
      >
        {category.products.length === 0 ? (
          <Box
            onClick={() =>
              navigate(ROUTES.PRODUCT_CREATE, {
                state: {
                  preselectedCategory: { id: category.id, name: category.name },
                },
              })
            }
            sx={{
              aspectRatio: "1 / 1",
              minWidth: 97,
              minHeight: 97,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              border: "2px dashed",
              borderColor: "primary.main",
              borderRadius: "16px",
              backgroundColor: "white",
              cursor: "pointer",
            }}
          >
            <Box
              component="img"
              src={AddProductTileIcon}
              alt=""
              sx={{ width: 34, height: 34 }}
            />
            <Typography
              sx={{
                color: "primary.main",
                fontWeight: 700,
                fontSize: 14,
                lineHeight: "16px",
                textAlign: "center",
                px: 3,
              }}
            >
              Añade tu producto
            </Typography>
          </Box>
        ) : (
          category.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currentCategory={{ id: category.id, name: category.name }}
              onClick={() => {
                navigate(
                  ROUTES.PRODUCT_DETAIL.replace(":id", product.id + ""),
                );
              }}
              onPromotionClick={onProductPromotionClick}
              onDeleteClick={onProductDeleteClick}
              onMoveClick={(prod, currentCategory) =>
                onProductMoveClick?.(
                  prod,
                  currentCategory ?? { id: category.id, name: category.name },
                )
              }
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default CategoryGroup;
