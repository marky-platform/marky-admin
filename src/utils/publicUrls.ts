export const UNCATEGORIZED_SLUG = "sin-categoria";

interface PublicProductPathParams {
  businessId: string;
  categorySlug?: string | null;
  productSlug?: string | null;
  productId?: string | number | null;
}

// Ruta pública canónica de un producto: `/<businessId>/<categorySlug>/<productSlug>`
// (`sin-categoria` si no tiene categoría; lo resuelve el mapper). Si falta
// algún slug (filas creadas durante un deploy) cae a la ruta legada
// `/<businessId>/product/<id>`, que sigue siendo válida.
export const getPublicProductPath = ({
  businessId,
  categorySlug,
  productSlug,
  productId,
}: PublicProductPathParams): string => {
  const business = encodeURIComponent(businessId);
  if (!productSlug || !categorySlug) {
    return `/${business}/product/${encodeURIComponent(String(productId ?? ""))}`;
  }
  return `/${business}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(
    productSlug,
  )}`;
};

// Enlace público (sin sesión) de un producto. Usa el origen actual para que
// el enlace funcione en cualquier entorno (local, staging, producción) donde
// se sirve esta misma app.
export const getPublicProductUrl = (params: PublicProductPathParams): string =>
  `${window.location.origin}${getPublicProductPath(params)}`;

// Enlace público de un producto solo si se puede abrir: hay negocio y el
// producto no está inactivo (la ruta pública de uno inactivo da 404).
export const getProductPublicUrlIfActive = (
  product: {
    is_active?: boolean;
    categorySlug?: string | null;
    slug?: string | null;
    id?: string | number | null;
  },
  businessId?: string | null,
): string | undefined =>
  !businessId || product.is_active === false
    ? undefined
    : getPublicProductUrl({
        businessId,
        categorySlug: product.categorySlug,
        productSlug: product.slug,
        productId: product.id,
      });

// Enlace público del perfil de un negocio: `/<businessId>`. Única fuente para
// compartir, copiar enlace y generar el QR.
export const getPublicBusinessUrl = (businessId: string): string =>
  `${window.location.origin}/${encodeURIComponent(businessId)}`;

// Parámetro que abre el detalle público directamente en el ítem 3D de la
// galería (lo usa el QR de "Ver en tu celular").
export const VIEW_3D_PARAM = "view";
export const VIEW_3D_VALUE = "3d";

export const withModel3dView = (url: string): string => {
  const parsed = new URL(url);
  parsed.searchParams.set(VIEW_3D_PARAM, VIEW_3D_VALUE);
  return parsed.toString();
};
