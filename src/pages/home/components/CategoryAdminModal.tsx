import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import XButton from "../../../components/XButton";
import useProductCategories from "../../../hooks/useProductCategories";
import useUpdateProductCategoryOrder from "../../../hooks/useUpdateProductCategoryOrder";
import { ProductCategory } from "../../../services/productService";
import { Category } from "../../../types/category";
import { CreateEdit } from "./categoryAdminModalScreens/CreateEdit";
import { Main } from "./categoryAdminModalScreens/Main";
import { Promotion } from "./categoryAdminModalScreens/Promotion";
import { Welcome } from "./categoryAdminModalScreens/Welcome";
import SortableCategoryList from "./SortableCategoryList";

type ActiveScreen = "welcome" | "main" | "sort" | "createEdit" | "promotion";

interface CategoryAdminModalProps {
  open: boolean;
  onClose: (orderChanged: boolean) => void;
  /** Abre directamente la pantalla de creación (p. ej. desde el formulario de producto). */
  initialScreen?: "createEdit";
  /**
   * Si se pasa, al crear una categoría nueva el modal se cierra y se avisa
   * con la categoría creada en lugar de volver al listado. Sin esta prop el
   * comportamiento es el de siempre (Home).
   */
  onCategoryCreated?: (category: Category) => void;
}

export const CategoryAdminModal: React.FC<CategoryAdminModalProps> = ({
  open,
  onClose,
  initialScreen,
  onCategoryCreated,
}) => {
  const { data: categoriesData, isLoading } = useProductCategories(
    {
      include_products: false,
    },
    { enabled: open },
  );
  const updateProductCategoryOrder = useUpdateProductCategoryOrder();
  const [categories, setCategories] = useState<Category[]>([]);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>(
    initialScreen ?? "main",
  );
  const [categoryForm, setCategoryForm] = useState<Category | null>(null);
  const [selectedPromotionCategory, setSelectedPromotionCategory] =
    useState<Category>();
  const restingScreen: ActiveScreen = initialScreen ?? "main";

  const handleModalClose = () => {
    onClose(hasOrderChanged);
    setActiveScreen(restingScreen);
    setCategoryForm(null);
    setHasOrderChanged(false);
  };

  // Con `initialScreen` no hay listado al que volver: "atrás" cierra el modal.
  const goBack = () =>
    initialScreen ? handleModalClose() : setActiveScreen("main");

  const handleCreateEditSubmit = (
    cat: Partial<Category>,
    backScreen: boolean = true,
  ) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === cat.id);

      if (exists) {
        // Editar categoría existente
        return prev.map((c) => (c.id === cat.id ? { ...c, ...cat } : c));
      } else {
        // Agregar nueva categoría
        return [...prev, cat as Category];
      }
    });

    // Alta desde otro contexto (formulario de producto): se cierra el modal y
    // se notifica la categoría creada. La edición mantiene el flujo normal.
    if (onCategoryCreated && !categoryForm?.id) {
      onCategoryCreated(cat as Category);
      handleModalClose();
      return;
    }

    setCategoryForm(null);

    if (backScreen) {
      // Tanto al crear como al editar, vuelve al listado dentro del modal
      // para que el usuario tenga confirmación visual de que la categoría
      // (nueva o editada) quedó guardada.
      setActiveScreen("main");
    }
  };

  const onDeleteCategory = (cat: any) => {
    // This is now handled by react-query optimistic updates
  };

  // Al abrirse con `initialScreen` siempre arranca en esa pantalla, sin
  // pasar por "welcome"/"main" (que dependen de cuántas categorías existan).
  useEffect(() => {
    if (open && initialScreen) setActiveScreen(initialScreen);
  }, [open, initialScreen]);

  useEffect(() => {
    if (categoriesData) {
      const mappedCategories = categoriesData.results.map(
        (cat: ProductCategory) => ({
          id: cat.id,
          label: cat.name,
          icon: cat.icon,
          order: 0, // Default value
          hasOffer: !!cat.multibuy_option,
          multibuyOption: cat.multibuy_option ?? undefined,
          discountPercentage: parseFloat(cat.discount_percentage),
          promotionStartsAt: cat.promotion_starts_at ?? undefined,
          promotionEndsAt: cat.promotion_ends_at ?? undefined,
        }),
      );
      setCategories(mappedCategories);
    }
  }, [categoriesData]);

  useEffect(() => {
    if (initialScreen) return;
    if (
      open &&
      activeScreen === "main" &&
      !isLoading &&
      categories.length < 1
    ) {
      setActiveScreen("welcome");
    } else if (
      open &&
      activeScreen === "welcome" &&
      !isLoading &&
      categories.length > 0
    ) {
      setActiveScreen("main");
    }
  }, [categories, activeScreen, isLoading, open, initialScreen]);

  return (
    <Dialog open={open} onClose={handleModalClose} fullWidth maxWidth="md">
      <>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            boxShadow: "0px 1px 0px #E8E9EB",
            p: 3,
          }}
        >
          <Box display={"flex"} alignItems={"center"}>
            {["createEdit", "sort", "promotion"].includes(activeScreen) && (
              <IconButton onClick={goBack} sx={{ mr: 1 }}>
                <ArrowBackIcon sx={{ color: "#333", fontSize: 18 }} />
              </IconButton>
            )}
            <DialogTitle
              sx={{ p: 0, fontSize: 16, fontWeight: 500, color: "#292929" }}
            >
              {["main", "welcome"].includes(activeScreen) &&
                "Administrar categorías"}
              {activeScreen === "sort" && "Ordenar categorías"}
              {activeScreen === "createEdit" &&
                `${categoryForm?.id ? "Editar" : "Nueva"} Categoría`}
              {activeScreen === "promotion" && "Categoría en promoción"}
            </DialogTitle>
          </Box>
          <XButton
            aria-label="Cerrar"
            onClick={handleModalClose}
            sx={{ bgcolor: "grey.400", borderRadius: 1.5 }}
          />
        </Box>
        {/* ========== MODAL CONTENT ========== */}
        <DialogContent>
          {/* WELCOME ========== */}
          {activeScreen === "welcome" && (
            <Welcome setActiveScreen={setActiveScreen} />
          )}
          {/* MAIN LIST ========== */}
          {activeScreen === "main" && (
            <Main
              categories={categories}
              isLoading={isLoading}
              setActiveScreen={setActiveScreen}
              setCategoryForm={setCategoryForm}
              onDeleteCategory={onDeleteCategory}
              setSelectedPromotionCategory={setSelectedPromotionCategory}
            />
          )}
          {/* ========== SORTABLE LIST ========== */}
          {activeScreen === "sort" && (
            <SortableCategoryList
              categories={categories}
              // setFieldValue={setFieldValue}
              setActiveScreen={setActiveScreen}
              // setOpenDeleteCategoryDialog={setOpenDeleteCategoryDialog}
              // setSelectedCategoryDelete={setSelectedCategoryDelete}
              isSortable={true}
              isEditable={false}
              onOrderChange={(orderedCategories) => {
                // Ensure `order` is always a number when sending to the API.
                // `Category.order` is optional in the type definitions, so
                // fall back to the current index if it's undefined.
                const payload = orderedCategories.map((cat, index) => ({
                  id: cat.id as number,
                  order: (cat.order ?? index) as number,
                }));

                updateProductCategoryOrder.mutate(payload, {
                  onSuccess: () => {
                    setCategories(orderedCategories);
                    setHasOrderChanged(true);
                    setActiveScreen("main");
                  },
                });
              }}
            />
          )}
          {/* ========== CREATE/EDIT FORM ========== */}
          {activeScreen === "createEdit" && (
            <CreateEdit
              key={categoryForm?.id ?? "new"}
              initialCategory={categoryForm}
              onSubmit={handleCreateEditSubmit}
              hideCreateAnother={Boolean(onCategoryCreated)}
            />
          )}
          {/* TODO: make this work ========== CATEGORY PROMOTION ========== */}
          {activeScreen === "promotion" && (
            <Promotion
              category={selectedPromotionCategory}
              onSubmit={(updatedCategory) => {
                setCategories((prev) =>
                  prev.map((c) =>
                    c.id === updatedCategory.id ? updatedCategory : c,
                  ),
                );
                setActiveScreen("main");
              }}
            />
          )}
        </DialogContent>
      </>
    </Dialog>
  );
};

export default CategoryAdminModal;
