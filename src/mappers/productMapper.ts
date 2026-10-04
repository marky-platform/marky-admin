import { Product, ProductGridItem } from "../types/product";
import { parseAllergenIds, parseCsvList } from "../utils/productExtras";

export const mapProductGridItem = (productData: any): ProductGridItem => {
  return {
    id: productData.id,
    name: productData.name,
    description: productData.description,
    image: productData.image ?? undefined,
    views: productData.views ?? undefined,
    price: productData.price ?? 0,
    priceAlt: productData.priceAlt ?? undefined,
    // accept already formatted price labels from backend (snake_case) or camelCase
    // (defined here once; avoid duplicate keys)
    primaryPrice: productData.primary_price ?? productData.primaryPrice,
    secondaryPrice: productData.secondary_price ?? productData.secondaryPrice,
    primaryPriceWithDiscount:
      productData.primary_price_with_discount ??
      productData.primaryPriceWithDiscount,
    secondaryPriceWithDiscount:
      productData.secondary_price_with_discount ??
      productData.secondaryPriceWithDiscount,
    isRecommended: productData.is_recommended ?? productData.isRecommended,
    isFavorite: productData.is_favorite ?? productData.isFavorite,
    promotionStartsAt: productData.promotion_starts_at ?? productData.promotionStartsAt,
    promotionEndsAt: productData.promotion_ends_at ?? productData.promotionEndsAt,
    promotionStatus: productData.promotion_status ?? productData.promotionStatus,
    // Map discount_percentage (could be string or number) to a number
    discountPercent:
      productData.discount_percentage !== undefined &&
      productData.discount_percentage !== null
        ? Number(productData.discount_percentage)
        : (productData.discountPercent ?? undefined),
    // (no-op: primary/secondary already mapped above)
    // Map multibuy option
    multibuyOption:
      productData.multibuy_option !== undefined
        ? productData.multibuy_option
        : (productData.multibuyOption ?? undefined),
    // forward availability from backend (fall back to is_active for legacy)
    is_available:
      productData.is_available !== undefined
        ? productData.is_available
        : productData.is_active !== undefined
          ? productData.is_active
          : true,
    is_active: productData.is_active,
  } as ProductGridItem;
};

export const mapProduct = (productData: any): Product => {
  return {
    ...productData,
    is_active: productData.is_active,
    featuredIngredients: parseCsvList(productData.featured_ingredients),
    allergens: parseAllergenIds(productData.allergens),
    presentation: productData.presentation ?? null,
    celiacInfo: productData.celiac_info ?? null,
    multibuyOption: productData.multibuy_option,
    discountPercentage: productData.discount_percentage,
    promotionStartDate: productData.promotion_starts_at,
    promotionEndDate: productData.promotion_ends_at,
    promotionStatus: productData.promotion_status ?? productData.promotionStatus,
    primaryPrice: productData.primary_price ?? productData.primaryPrice,
    secondaryPrice: productData.secondary_price ?? productData.secondaryPrice,
    primaryPriceWithDiscount:
      productData.primary_price_with_discount ??
      productData.primaryPriceWithDiscount,
    secondaryPriceWithDiscount:
      productData.secondary_price_with_discount ??
      productData.secondaryPriceWithDiscount,
    variants: Array.isArray(productData.variants)
      ? productData.variants.map((v: any) => ({
          ...v,
          primaryPrice: v.primary_price ?? v.primaryPrice,
          secondaryPrice: v.secondary_price ?? v.secondaryPrice,
        }))
      : [],
    addons: Array.isArray(productData.addons) ? productData.addons : [],
  };
};

export const mapCategoryWithProducts = (cat: any) => {
  return {
    ...cat,
    // forward is_available, fall back to is_active if backend uses legacy field
    is_available:
      cat.is_available !== undefined
        ? cat.is_available
        : cat.is_active !== undefined
          ? cat.is_active
          : true,
    products: Array.isArray(cat.products)
      ? cat.products.map(mapProductGridItem)
      : [],
  };
};
