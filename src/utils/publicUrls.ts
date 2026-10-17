export const UNCATEGORIZED_SLUG = "sin-categoria";

interface PublicProductPathParams {
  businessId: string;
  categorySlug?: string | null;
  productSlug?: string | null;
  productId?: string | number | null;
}

// Ruta pública canónica de un producto: `/<businessId>/<categorySlug>/<productSlug>`
// (`sin-categoria` si no tiene categoría). Si el producto aún no tiene slug
// (filas creadas durante un deploy) cae a la ruta legada
// `/<businessId>/product/<id>`, que sigue siendo válida.
export const getPublicProductPath = ({
  businessId,
  categorySlug,
  productSlug,
  productId,
}: PublicProductPathParams): string => {
  const business = encodeURIComponent(businessId);
  if (!productSlug) {
    return `/${business}/product/${encodeURIComponent(String(productId ?? ""))}`;
  }
  return `/${business}/${encodeURIComponent(
    categorySlug || UNCATEGORIZED_SLUG,
  )}/${encodeURIComponent(productSlug)}`;
};

// Enlace público (sin sesión) de un producto. Usa el origen actual para que
// el enlace funcione en cualquier entorno (local, staging, producción) donde
// se sirve esta misma app.
export const getPublicProductUrl = (params: PublicProductPathParams): string =>
  `${window.location.origin}${getPublicProductPath(params)}`;

// Enlace público del perfil de un negocio: `/<businessId>`. Única fuente para
// compartir, copiar enlace y generar el QR.
export const getPublicBusinessUrl = (businessId: string): string =>
  `${window.location.origin}/${encodeURIComponent(businessId)}`;
