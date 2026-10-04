import { AxiosProgressEvent } from "axios";
import { CategoryWithProducts } from "../types/categoryWithProducts";
import { Product } from "../types/product";
import api from "./axiosConfig";
import { PaginatedProductCategoriesResponse, PaginatedResponse } from "./types";
import { mapCategoryWithProducts, mapProduct } from "../mappers/productMapper";

// Product create/update requests can carry a video file (up to 80MB), so they
// need a much longer timeout than the default 30s used for regular requests.
const PRODUCT_SAVE_TIMEOUT_MS = 240_000;

export interface ProductCategory {
  id: number;
  name: string;
  icon: string;
  discount_percentage: string;
  multibuy_option?: string;
  promotion_starts_at: string | null;
  promotion_ends_at: string | null;
  is_available: boolean;
}

const categoryBaseURL = `${process.env.REACT_APP_API_URL}/products/product-categories`;
const productBaseURL = `${process.env.REACT_APP_API_URL}/products/products`;

export const getProductCategories = async (
  params?: any,
): Promise<PaginatedResponse<ProductCategory>> => {
  const response = await api.get(`${categoryBaseURL}/`, { params });
  return response.data;
};

export const getProductCategoriesWithProducts = async (
  params?: any,
): Promise<PaginatedProductCategoriesResponse<CategoryWithProducts>> => {
  const response = await api.get(`${categoryBaseURL}/with_products/`, {
    params,
  });
  // Map products inside each category to frontend-friendly shape
  const data = response.data as PaginatedProductCategoriesResponse<any>;
  const mappedResults = Array.isArray(data.results)
    ? data.results.map((cat) => mapCategoryWithProducts(cat))
    : [];

  return {
    ...data,
    results: mappedResults,
  } as PaginatedProductCategoriesResponse<CategoryWithProducts>;
};

export interface ProductCategoryPayload {
  name?: string;
  icon?: string;
  is_available?: boolean;
}

export const createProductCategory = async (
  category: ProductCategoryPayload,
): Promise<ProductCategory> => {
  const response = await api.post(`${categoryBaseURL}/`, category);
  return response.data;
};

export const updateProductCategory = async (
  id: number,
  category: ProductCategoryPayload,
): Promise<ProductCategory> => {
  const response = await api.patch(`${categoryBaseURL}/${id}/`, category);
  return response.data;
};

export const updateProductCategoryAvailability = async (
  id: number,
  payload: { is_available: boolean },
): Promise<ProductCategory> => {
  const response = await api.patch(`${categoryBaseURL}/${id}/`, payload);
  return response.data;
};

export const deleteProductCategory = async (id: number): Promise<void> => {
  await api.delete(`${categoryBaseURL}/${id}/`);
};

export const addPromotionToProductCategory = async (
  id: number,
  promotion: {
    has_offer: boolean;
    discount_percentage: string;
    multibuy_option?: string;
    promotion_starts_at: string;
    promotion_ends_at: string;
  },
): Promise<ProductCategory> => {
  const response = await api.post(
    `${categoryBaseURL}/${id}/add_promotion/`,
    promotion,
  );
  return response.data;
};

export const updateProductCategoryOrder = async (
  categories: { id: number; order: number }[],
): Promise<void> => {
  await api.post(`${categoryBaseURL}/update_order/`, { categories });
};

export const updateProductCategoryProductsOrder = async (
  categoryId: number,
  productIds: number[],
): Promise<void> => {
  await api.post(`${categoryBaseURL}/${categoryId}/update_products_order/`, {
    product_ids: productIds,
  });
};

export const createProduct = async (
  formData: FormData,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<Product> => {
  const response = await api.post(`${productBaseURL}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: PRODUCT_SAVE_TIMEOUT_MS,
    onUploadProgress,
  });
  return response.data;
};

export const updateProduct = async (
  id: number,
  formData: FormData,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<Product> => {
  const response = await api.patch(`${productBaseURL}/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    // Only the full product-form save passes onUploadProgress and can carry
    // a large video, so only that call gets the longer timeout. Lightweight
    // callers (availability toggle, promotion fields) fall back to the
    // axios instance's default 30s instead of waiting up to 4 minutes on a
    // genuinely hung request.
    timeout: onUploadProgress ? PRODUCT_SAVE_TIMEOUT_MS : undefined,
    onUploadProgress,
  });
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await api.get(`${productBaseURL}/${id}/`);
  return mapProduct(response.data);
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`${productBaseURL}/${id}/`);
};
