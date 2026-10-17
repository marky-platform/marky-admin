import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Navigate, useParams } from "react-router-dom";
import usePublicProduct from "../../hooks/usePublicProduct";
import { getPublicProductPath } from "../../utils/publicUrls";
import { PublicProductDetailView } from "./PublicProductDetailPage";

// Enlace legado `/<businessId>/product/<id>`: resuelve el producto por id y
// reemplaza la URL por la canónica (sin dejar la legada en el historial). Si
// el producto aún no tiene slug, muestra el detalle con lo ya obtenido.
const LegacyPublicProductRedirect: React.FC = () => {
  const { businessId, id } = useParams<{ businessId: string; id: string }>();
  const queryClient = useQueryClient();
  const numericId = id ? Number(id) : undefined;
  const { data: product, isLoading, error } = usePublicProduct(
    businessId,
    numericId,
  );

  // Sin slug de producto o de categoría (filas de la ventana de deploy) la
  // ruta canónica no resolvería: se muestra el detalle sin redirigir.
  if (product?.slug && product.categorySlug && businessId) {
    // Precarga la consulta canónica para que la redirección no vuelva a
    // pedir el mismo producto (misma clave que usePublicProductBySlug).
    queryClient.setQueryData(
      ["public", "product", businessId, product.categorySlug, product.slug],
      product,
    );
    return (
      <Navigate
        replace
        to={getPublicProductPath({
          businessId,
          categorySlug: product.categorySlug,
          productSlug: product.slug,
          productId: product.id,
        })}
      />
    );
  }

  return (
    <PublicProductDetailView
      businessId={businessId}
      product={product}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default LegacyPublicProductRedirect;
