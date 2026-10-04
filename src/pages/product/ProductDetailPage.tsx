import { Box, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import { Header } from "../../components/Header";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useBusinessAccountInfo } from "../../hooks/useBusinessAccountInfo";
import useProductDetail from "../../hooks/useProductDetail";
import ProductDetailContent, {
  PRODUCT_INFO_MAX_WIDTH,
  PRODUCT_PAGE_MAX_WIDTH,
} from "./components/ProductDetailContent";

export { PRODUCT_INFO_MAX_WIDTH, PRODUCT_PAGE_MAX_WIDTH };

const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const numericId = id ? Number(id) : undefined;
  const { data: product, isLoading, error } = useProductDetail(numericId);
  const { data: accountInfo } = useBusinessAccountInfo();

  // Navegar entre productos relacionados reutiliza esta página: volver arriba.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [numericId]);

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
          px: { xs: 4, md: "72px" },
          pb: "100px",
          mt: { xs: 2, md: 4 },
          mx: "auto",
          maxWidth: { xs: "none", md: PRODUCT_PAGE_MAX_WIDTH },
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
          <BackButton onClick={() => navigate(-1)} />
          <Typography variant="h4" fontWeight={500} color="text.primary">
            {accountInfo?.business_name
              ? `Volver a ${accountInfo.business_name}`
              : "Volver"}
          </Typography>
        </Box>
        <ProductDetailContent product={product} />
      </Box>
    </Box>
  );
};

export default ProductDetailPage;
