import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, InputAdornment, Typography } from "@mui/material";
import { Field, FormikProps } from "formik";
import Input from "../../../components/Input";
import NumberInput from "../../../components/NumberInput";
import { useBusinessAccountInfo } from "../../../hooks/useBusinessAccountInfo";
import { Category } from "../../../types/category";
import { Product } from "../../../types/product";
import CategorySelector from "./CategorySelector";
import ProductImageGallery from "./ProductImageGallery"; // Import the new component

interface ProductSectionProps {
  formik: FormikProps<Product>;
  onOpenModal: () => void;
  selectedCategory: Category | null;
  uploadProgress?: number | null;
  isSaving?: boolean;
}

const ProductSection = ({
  formik,
  onOpenModal,
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
          label="Descripción"
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
          label="Precio"
          required
          fullWidth
          margin="normal"
          sx={{ maxWidth: { xs: "100%", sm: "238px" } }}
          error={touched.price && Boolean(errors.price)}
          helperText={touched.price && errors.price}
          InputProps={{
            endAdornment: currencyCode ? (
              <InputAdornment position="end">
                <Typography variant="body2">{`[${currencyCode}]`}</Typography>
              </InputAdornment>
            ) : undefined,
          }}
        />
        <CategorySelector
          selectedCategory={selectedCategory}
          onOpenModal={onOpenModal}
        />
      </Box>
    </Box>
  );
};

export default ProductSection;
