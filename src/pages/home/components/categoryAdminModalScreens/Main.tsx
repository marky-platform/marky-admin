import {
  Box,
  TextField,
  InputAdornment,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import ConfirmationDialog from "../../../../components/ConfirmationDialog";
import categoryIcons from "../../../../assets/icons/category/categoryIcons";
import SearchIcon from "@mui/icons-material/Search";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import { ReactComponent as CrownIcon } from "../../../../assets/icons/crown.svg";
import DeleteCategoryWarningImage from "../../../../assets/images/delete-category-warning.png";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Category } from "../../../../types/category";
import { useState } from "react";
import MobileOptionsMenu from "./components/MobileOptionsMenu";
import useDeleteProductCategory from "../../../../hooks/useDeleteProductCategory";

interface CategoryItemProps {
  cat: Category;
  setCategoryForm: (cat: Category) => void;
  setActiveScreen: (screen: ActiveScreen) => void;
  setOpenDeleteCategoryDialog: (open: boolean) => void;
  setSelectedCategoryDelete: (cat: Category) => void;
  isSortable?: boolean;
  isEditable?: boolean;
  setSelectedPromotionCategory: (cat: Category) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  cat,
  setCategoryForm,
  setActiveScreen,
  setOpenDeleteCategoryDialog,
  setSelectedCategoryDelete,
  isSortable = false,
  isEditable = true,
  setSelectedPromotionCategory,
}) => {
  const IconComponent =
    cat.icon && categoryIcons[cat.icon] ? categoryIcons[cat.icon] : null;
  const hasPromo = !!(cat.multibuyOption || (cat.discountPercentage || 0) > 0);

  return (
    <Box
      key={cat.id}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      height={56}
      pl={1.5}
      pr={1}
      sx={{
        boxShadow: (theme) => `0px 1px 0px ${theme.palette.border.layout}`,
        width: "100%",
      }}
    >
      <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0}>
        {isSortable && (
          <Typography variant="body2" sx={{ cursor: "grab" }}>
            <ImportExportIcon fontSize="small" />
          </Typography>
        )}
        <Box
          sx={{
            backgroundColor: "grey.400",
            width: 44,
            height: 44,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {IconComponent ? (
            <IconComponent width={36} height={36} />
          ) : (
            <CrownIcon width={20} height={20} />
          )}
        </Box>
        <Typography
          sx={{
            cursor: "pointer",
            fontSize: 12,
            color: "text.body",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          onClick={() => {
            setCategoryForm(cat);
            setActiveScreen("createEdit");
          }}
        >
          {cat.label}
        </Typography>
      </Box>

      {isEditable && (
        <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
          {hasPromo && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <LocalOfferIcon fontSize="small" color="error" />
              <Typography variant="body2" color="error" fontSize={12}>
                Activa
              </Typography>
            </Box>
          )}
          <MobileOptionsMenu
            onPromo={() => {
              setActiveScreen("promotion");
              setSelectedPromotionCategory(cat);
            }}
            onDelete={() => {
              setOpenDeleteCategoryDialog(true);
              setSelectedCategoryDelete(cat);
            }}
          />
        </Box>
      )}
    </Box>
  );
};

type ActiveScreen = "welcome" | "main" | "sort" | "createEdit" | "promotion";

interface MainProps {
  categories: Category[];
  isLoading: boolean;
  setActiveScreen: (screen: ActiveScreen) => void;
  setCategoryForm: (cat: Category | null) => void;
  onDeleteCategory: (cat: Category) => void;
  setSelectedPromotionCategory: (cat: Category) => void;
  onSelectCategory?: (category: Category) => void;
}

export const Main: React.FC<MainProps> = ({
  categories,
  isLoading,
  setActiveScreen,
  setCategoryForm,
  onDeleteCategory,
  setSelectedPromotionCategory,
  onSelectCategory,
}) => {
  const deleteProductCategory = useDeleteProductCategory();
  const [openDeleteCategoryDialog, setOpenDeleteCategoryDialog] =
    useState(false);
  const [selectedCategoryDelete, setSelectedCategoryDelete] =
    useState<Category>();

  return (
    <Box sx={{ marginBottom: 4 }}>
      {/* Filtros y botón para crear categoría */}
      <Box display="flex" alignItems="stretch" gap={4} mb={4}>
        <TextField
          sx={{
            flex: 3,
            "& .MuiOutlinedInput-root": {
              height: "100%",
              "& fieldset": { borderColor: "border.field" },
            },
            "& .MuiInputBase-input::placeholder": {
              color: "grey.900",
              opacity: 1,
            },
          }}
          placeholder="Buscar categoría"
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.strong" }} />
              </InputAdornment>
            ),
          }}
          // Aquí podrías manejar el onChange para filtrar la lista
        />
        <Button
          sx={{ flex: 1, boxShadow: 0, whiteSpace: "nowrap" }}
          variant="contained"
          color="primary"
          onClick={() => {
            setActiveScreen("createEdit");
            setCategoryForm(null);
          }}
        >
          Crear categoría
        </Button>
      </Box>
      {/* Encabezado del listado + acceso a Ordenar categorías */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="subtitle2" sx={{ color: "text.strong" }}>
          Categorías creadas ({categories.length})
        </Typography>
        <Button
          startIcon={<ImportExportIcon fontSize="small" />}
          onClick={() => setActiveScreen("sort")}
          sx={{ color: "primary.main", fontSize: 14 }}
        >
          Ordenar categorías
        </Button>
      </Box>
      {/* Lista de categorías creadas */}
      <Box
        sx={{
          maxHeight: 300,
          overflowY: "auto",
          border: 1,
          borderColor: "border.field",
          borderRadius: 1.5,
          py: 0.25,
        }}
      >
        {isLoading ? (
          <CircularProgress />
        ) : categories && categories.length > 0 ? (
          categories.map((cat: Category) => (
            <Box
              key={cat.id}
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              <CategoryItem
                cat={cat}
                setCategoryForm={setCategoryForm}
                setActiveScreen={setActiveScreen}
                setOpenDeleteCategoryDialog={setOpenDeleteCategoryDialog}
                setSelectedCategoryDelete={setSelectedCategoryDelete}
                setSelectedPromotionCategory={setSelectedPromotionCategory}
              />
              {onSelectCategory && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onSelectCategory(cat)}
                >
                  Seleccionar
                </Button>
              )}
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No hay categorías creadas.
          </Typography>
        )}
      </Box>
      {/* modal de confirmacion de borrar categoria */}
      <ConfirmationDialog
        onConfirm={() => {
          if (selectedCategoryDelete) {
            deleteProductCategory.mutate(selectedCategoryDelete.id as number, {
              onSuccess: () => {
                setOpenDeleteCategoryDialog(false);
                setSelectedCategoryDelete(undefined);
              },
            });
          }
        }}
        title="¿Estás seguro de eliminar esta categoría?"
        content="Esta acción también eliminará permanentemente los productos vinculados."
        image={DeleteCategoryWarningImage}
        confirmationCheckboxLabel="Confirmo que deseo eliminar la categoría"
        confirmColor="error"
        confirmText="Eliminar"
        open={openDeleteCategoryDialog}
        onClose={() => setOpenDeleteCategoryDialog(false)}
        isLoading={deleteProductCategory.isPending}
      />
    </Box>
  );
};
