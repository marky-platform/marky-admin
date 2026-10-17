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

// Enlace público del perfil de un negocio: `/<businessId>`. Única fuente para
// compartir, copiar enlace y generar el QR.
export const getPublicBusinessUrl = (businessId: string): string =>
  `${window.location.origin}/${encodeURIComponent(businessId)}`;
