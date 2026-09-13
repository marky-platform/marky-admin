import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import { Header } from "../../components/Header";
import LoadingSpinner from "../../components/LoadingSpinner";
import useProductDetail from "../../hooks/useProductDetail";
import ProductAddonsList from "./components/ProductAddonsList";
import ProductDetailGallery from "./components/ProductDetailGallery";
import ProductDetailInfo from "./components/ProductDetailInfo";
import ProductDetailPricing from "./components/ProductDetailPricing";
import ProductVariantsList from "./components/ProductVariantsList";

export const PRODUCT_INFO_MAX_WIDTH = 600;

const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const numericId = id ? Number(id) : undefined;
  const { data: product, isLoading, error } = useProductDetail(numericId);

  if (isLoading) {
    return <LoadingSpinner message="Cargando producto..." />;
  }

  if (error || !product) {
    return (
      <Box p={3}>
        <p>Error al cargar el producto.</p>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Header />
      <Box
        sx={{
          flex: 1,
          px: { xs: 4, md: 8 },
          pb: "100px",
          mt: 8,
          mx: "auto",
          minWidth: "85%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
          <BackButton onClick={() => navigate(-1)} />
          <Typography variant="h4" fontWeight={500} color="text.primary">
            Volver
          </Typography>
        </Box>
        <Grid container spacing={8}>
          {/* COLUMN 1 */}
          <Grid
            item
            xs={12}
            md={4}
            lg={5}
            sx={{ display: "flex", alignItems: "flex-start" }}
          >
            <ProductDetailGallery product={product} />
          </Grid>
          {/* COLUMN 2 */}
          <Grid item xs={12} md={8} lg={7}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxWidth: PRODUCT_INFO_MAX_WIDTH,
              }}
            >
              <Box>
                <ProductDetailInfo product={product} />

                <ProductDetailPricing product={product} />
              </Box>

              {product.variants.length > 0 && (
                <ProductVariantsList variants={product.variants} />
              )}
              {product.addons.length > 0 && (
                <ProductAddonsList addons={product.addons} />
              )}
            </Box>

            {/* Related products / category list placeholder */}
            {/* <Box sx={{ mt: 6 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                {product.category?.name ?? "Nombre de categoría"}
              </Typography> */}
            {/* TODO: reuse ProductCard carousel or grid here when data available */}
            {/* </Box> */}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProductDetailPage;
