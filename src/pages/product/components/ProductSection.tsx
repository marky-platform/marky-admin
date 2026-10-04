import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Typography } from "@mui/material";
import { Field, FormikProps } from "formik";
import Input from "../../../components/Input";
import NumberInput from "../../../components/NumberInput";
import { useBusinessAccountInfo } from "../../../hooks/useBusinessAccountInfo";
import { Category } from "../../../types/category";
import { Product } from "../../../types/product";
import { defaultCeliacForm } from "../../../utils/productExtras";
import AllergensSection from "./AllergensSection";
import CategoryPills from "./CategoryPills";
import CeliacSection from "./CeliacSection";
import FeaturedIngredientsField from "./FeaturedIngredientsField";
import PresentationSection from "./PresentationSection";
import ProductImageGallery from "./ProductImageGallery"; // Import the new component

interface ProductSectionProps {
  formik: FormikProps<Product>;
  onCreateCategory: () => void;
  onSelectCategory: (category: Category | null) => void;
  selectedCategory: Category | null;
  uploadProgress?: number | null;
  isSaving?: boolean;
}

const ProductSection = ({
  formik,
  onCreateCategory,
  onSelectCategory,
  selectedCategory,
  uploadProgress,
  isSaving,
}: ProductSectionProps) => {
  const { values, errors, touched, handleChange, handleBlur } = formik;
  const { data: businessAccountInfo } = useBusinessAccountInfo();
  const currencyCode = businessAccountInfo?.primary_currency_code;
  return (
    <Box sx={{ width: "100%" }}>
      <ProductImageGallery uploadProgress={uploadProgress} isSaving={isSaving} />

      <Box
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          p: 5,
          mb: 3,
          mt: 5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <VisibilityIcon />
          <Typography variant="h6" fontWeight="bold">
            Información
          </Typography>
        </Box>
        <Input
          name="name"
          label="Nombre del producto"
          placeholder="Nombre del producto"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          sx={{ mt: 2 }}
          error={touched.name && Boolean(errors.name)}
          helperText={touched.name ? errors.name : undefined}
        />
        <Input
          name="description"
          label="Cuenta qué hace especial a este producto"
          placeholder="Ej. Galleta artesanal con chips de chocolate, textura suave y toque salado."
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
          multiline
          rows={4}
          required
          maxLength={300}
          counterFormat="fraction"
          sx={{ mt: 2 }}
          error={touched.description && Boolean(errors.description)}
          helperText={
            touched.description
              ? errors.description
              : "Describe el producto de forma clara. Máximo 300 caracteres."
          }
        />
        <Field
          name="price"
          component={NumberInput}
          label={currencyCode ? `Precio en ${currencyCode}` : "Precio"}
          required
          fullWidth
          margin="normal"
          sx={{ maxWidth: { xs: "100%", md: "238px" } }}
          error={touched.price && Boolean(errors.price)}
          helperText={touched.price && errors.price}
        />
        <FeaturedIngredientsField
          value={values.featuredIngredients ?? []}
          onChange={(next) => formik.setFieldValue("featuredIngredients", next)}
        />
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelect={onSelectCategory}
          onCreateCategory={onCreateCategory}
        />
      </Box>

      <PresentationSection formik={formik} />
      <AllergensSection
        value={values.allergens ?? []}
        onChange={(ids) => formik.setFieldValue("allergens", ids)}
      />
      <CeliacSection
        value={values.celiacForm ?? defaultCeliacForm()}
        onChange={(next) => formik.setFieldValue("celiacForm", next)}
      />
    </Box>
  );
};

export default ProductSection;
