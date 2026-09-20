import { Box, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import LoadingSpinner from "../../components/LoadingSpinner";
import usePublicProduct from "../../hooks/usePublicProduct";
import usePublicBusinessProfile from "../../hooks/usePublicBusinessProfile";
import ProductDetailContent, {
  PRODUCT_PAGE_MAX_WIDTH,
} from "../product/components/ProductDetailContent";
import PublicNotFound from "./components/PublicNotFound";

// Public, unauthenticated product detail — marky.one/<businessId>/product/<id>.
// The back row always returns to the business's public page (not
// navigate(-1)), so a deep link still lands somewhere sensible.
const PublicProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessId, id } = useParams<{ businessId: string; id: string }>();
  const numericId = id ? Number(id) : undefined;
  const { data: product, isLoading, error } = usePublicProduct(
    businessId,
    numericId,
  );
  const { data: profile } = usePublicBusinessProfile(businessId);

  useEffect(() => {
    if (product?.name) {
      document.title = profile?.business_name
        ? `${product.name} · ${profile.business_name}`
        : product.name;
    }
  }, [product?.name, profile?.business_name]);

  if (isLoading) {
    return (
      <Box
        sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}
      >
        <LoadingSpinner message="Cargando producto..." size={50} />
      </Box>
    );
  }

  const status = (error as any)?.response?.status;
  if (error || !product) {
    if (status === 404) {
      return <PublicNotFound message="No encontramos este producto." />;
    }
    return <PublicNotFound message="Ocurrió un error al cargar el producto." />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box
        sx={{
          flex: 1,
          px: { xs: 4, md: 8 },
          pb: "100px",
          pt: 8,
          mx: "auto",
          maxWidth: { xs: "none", md: PRODUCT_PAGE_MAX_WIDTH },
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
          <BackButton onClick={() => navigate(`/${businessId}`)} />
          <Typography variant="h4" fontWeight={500} color="text.primary">
            Volver
          </Typography>
        </Box>
        <ProductDetailContent product={product} readOnly />
      </Box>
    </Box>
  );
};

export default PublicProductDetailPage;
