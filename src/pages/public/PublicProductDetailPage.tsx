import { Box, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import LoadingSpinner from "../../components/LoadingSpinner";
import usePublicProductBySlug from "../../hooks/usePublicProductBySlug";
import { Product } from "../../types/product";
import usePublicBusinessProfile from "../../hooks/usePublicBusinessProfile";
import ProductDetailContent, {
  PRODUCT_PAGE_MAX_WIDTH,
} from "../product/components/ProductDetailContent";
import PublicNotFound from "./components/PublicNotFound";

interface PublicProductDetailViewProps {
  businessId?: string;
  product?: Product;
  isLoading: boolean;
  error: unknown;
}

// Public, unauthenticated product detail view. The back row always returns to
// the business's public page (not navigate(-1)), so a deep link still lands
// somewhere sensible.
export const PublicProductDetailView: React.FC<PublicProductDetailViewProps> = ({
  businessId,
  product,
  isLoading,
  error,
}) => {
  const navigate = useNavigate();
  const { data: profile } = usePublicBusinessProfile(businessId);

  // Navegar entre productos relacionados reutiliza esta página: volver arriba.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product?.id]);

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
          px: { xs: 4, md: "72px" },
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
            {profile?.business_name
              ? `Volver a ${profile.business_name}`
              : "Volver"}
          </Typography>
        </Box>
        <ProductDetailContent
          product={product}
          readOnly
          businessId={businessId}
          galleryStickyTop={24}
        />
      </Box>
    </Box>
  );
};

// Canonical public detail — marky.one/<businessId>/<categorySlug>/<productSlug>.
const PublicProductDetailPage: React.FC = () => {
  const { businessId, categorySlug, productSlug } = useParams<{
    businessId: string;
    categorySlug: string;
    productSlug: string;
  }>();
  const { data: product, isLoading, error } = usePublicProductBySlug(
    businessId,
    categorySlug,
    productSlug,
  );
  return (
    <PublicProductDetailView
      businessId={businessId}
      product={product}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default PublicProductDetailPage;
