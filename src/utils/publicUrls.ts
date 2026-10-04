import { ROUTES } from "../routes/paths";

// Enlace público (sin sesión) de un producto: `/<businessId>/product/<id>`.
// Usa el origen actual para que el enlace funcione en cualquier entorno
// (local, staging, producción) donde se sirve esta misma app.
export const getPublicProductUrl = (
  businessId: string,
  productId: string | number,
): string =>
  `${window.location.origin}${ROUTES.PUBLIC_PRODUCT_DETAIL.replace(
    ":businessId",
    businessId,
  ).replace(":id", String(productId))}`;
