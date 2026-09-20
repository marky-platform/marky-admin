import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CancelButton from "../../../components/CancelButton";
import CustomModal from "../../../components/Modal";
import CheckboxWithLabel from "../../../components/CheckboxWithLabel";
import useProductCategories from "../../../hooks/useProductCategories";
import LoadingSpinner from "../../../components/LoadingSpinner";

// Define un tipo para las categorías
export interface Category {
  id: number;
  name: string;
}

interface CategoryFilterModalProps {
  open: boolean;
  onClose: () => void;
  initialSelectedCategories: Category[];
  onSubmit: (selectedCategories: Category[]) => void;
  /** Injected category list (e.g. from the public catalog endpoint) instead
   * of fetching via the authenticated useProductCategories() hook. */
  categories?: Category[];
}

const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({
  open,
  onClose,
  initialSelectedCategories,
  onSubmit,
  categories: injectedCategories,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: categoriesData,
    isLoading,
    error,
  } = useProductCategories(
    {
      page_size: 100,
    },
    {
      enabled: open && !injectedCategories,
    }
  );

  const availableCategories: Category[] =
    injectedCategories ?? categoriesData?.results ?? [];

  // Filtra las categorías disponibles según el término de búsqueda
  const filteredCategories = availableCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={isMobile ? "Filtrar" : "Filtrar categorías"}
      onBack={onClose}
      showCloseButton
      fullScreenOnMobile
      hideFooter
      sx={{ width: { xs: "100%", md: 750 } }}
    >
      {/* CustomModal's content slot already applies p:4; cancel it here so
          the two-pane layout below can use the exact Figma paddings. */}
      <Box sx={{ m: -4 }}>
        <Formik
          initialValues={{
            selectedCategories: initialSelectedCategories,
          }}
          validationSchema={Yup.object({
            selectedCategories: Yup.array().required(
              "Debes seleccionar al menos una categoría"
            ),
          })}
          onSubmit={(values) => {
            onSubmit(values.selectedCategories);
            onClose();
          }}
        >
          {({ values, setFieldValue, isValid, dirty }) => (
            <Form>
              <Box
                display="flex"
                sx={{ flexDirection: { xs: "column", md: "row" } }}
              >
                {/* Columna Izquierda: Lista de categorías disponibles */}
                <Box flex={1} py={5.5} pl={5.5} pr={1}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar por categoría"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ paddingRight: { xs: 4, md: 2 } }}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Typography variant="h4" sx={{ mt: 4, mb: 3 }}>
                    Categorías
                  </Typography>
                  <Box
                    sx={{
                      minHeight: 300,
                      maxHeight: 360,
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {isLoading && !injectedCategories ? (
                      <LoadingSpinner />
                    ) : error ? (
                      <Typography>Error loading categories</Typography>
                    ) : (
                      filteredCategories.map((cat: Category) => {
                        const isChecked = values.selectedCategories.some(
                          (c: Category) => c.id === cat.id
                        );
                        return (
                          <CheckboxWithLabel
                            key={cat.id}
                            label={cat.name}
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFieldValue("selectedCategories", [
                                  ...values.selectedCategories,
                                  cat,
                                ]);
                              } else {
                                setFieldValue(
                                  "selectedCategories",
                                  values.selectedCategories.filter(
                                    (c: Category) => c.id !== cat.id
                                  )
                                );
                              }
                            }}
                          />
                        );
                      })
                    )}
                  </Box>
                </Box>

                {/* Columna Derecha: Lista de categorías seleccionadas */}
                <Box
                  flex={1}
                  py={5.5}
                  px={5.5}
                  sx={{
                    backgroundColor: "#F2F2F2",
                    display: { xs: "none", md: "block" },
                  }}
                >
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    Categorías seleccionadas
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 2, display: "block", color: "grey.500" }}
                  >
                    Puede eliminar o agregar categorías según el tipo de
                    búsqueda que desea visualizar.
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: 300,
                      overflowY: "auto",
                    }}
                  >
                    {values.selectedCategories.length > 0 ? (
                      values.selectedCategories.map(
                        (cat: Category, i: number) => (
                          <Box
                            key={cat.id}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{
                              mb: 1,
                              p: 1,
                              borderRadius: 1.5,
                            }}
                          >
                            <Typography variant="body2">
                              {cat.name}
                            </Typography>
                            <IconButton
                              onClick={() =>
                                setFieldValue(
                                  "selectedCategories",
                                  values.selectedCategories.filter(
                                    (c: Category) => c.id !== cat.id
                                  )
                                )
                              }
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )
                      )
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No hay categorías seleccionadas.
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  boxShadow: "0px -1px 0px 0px #E8E9EB",
                  display: "flex",
                  gap: 3,
                  padding: 5.25,
                }}
              >
                <CancelButton
                  sx={{ paddingX: 4, display: { xs: "none", md: "block" } }}
                  onClick={onClose}
                >
                  Cancelar
                </CancelButton>
                <Button
                  disabled={!isValid || !dirty}
                  sx={{
                    paddingX: 4,
                    boxShadow: 0,
                    width: { xs: "100%", md: "inherit" },
                    ml: { xs: 0, md: "auto" },
                  }}
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Aplicar
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </CustomModal>
  );
};

export default CategoryFilterModal;
