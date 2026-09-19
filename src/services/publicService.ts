import publicApi from "./publicAxios";
import { PaginatedProductCategoriesResponse, PaginatedResponse } from "./types";
import { SocialLink, BusinessLocation } from "./businessService";
import { ProductCategory } from "./productService";
import { CategoryWithProducts } from "../types/categoryWithProducts";
import { Product } from "../types/product";
import { mapCategoryWithProducts, mapProduct } from "../mappers/productMapper";

const baseURL = `${process.env.REACT_APP_API_URL}/public/business`;

export interface PublicBusinessProfile {
  business_id: string;
  business_name: string;
  social_links: SocialLink[];
  description: string | null;
  categories: { id: number; name: string }[];
  profile_image: string | null;
  headquarter_attributes: { id: number; name: string }[] | null;
  locations: BusinessLocation[];
}

export async function getPublicBusinessProfile(
  businessId: string,
): Promise<PublicBusinessProfile> {
  const response = await publicApi.get(`${baseURL}/${businessId}/`);
  return response.data;
}

export async function getPublicCatalog(
  businessId: string,
  params?: any,
): Promise<PaginatedProductCategoriesResponse<CategoryWithProducts>> {
  const response = await publicApi.get(`${baseURL}/${businessId}/catalog/`, {
    params,
  });
  const data = response.data as PaginatedProductCategoriesResponse<any>;
  const mappedResults = Array.isArray(data.results)
    ? data.results.map((cat) => mapCategoryWithProducts(cat))
    : [];

  return {
    ...data,
    results: mappedResults,
  } as PaginatedProductCategoriesResponse<CategoryWithProducts>;
}

export async function getPublicCategories(
  businessId: string,
): Promise<PaginatedResponse<ProductCategory>> {
  const response = await publicApi.get(
    `${baseURL}/${businessId}/categories/`,
    { params: { page_size: 100 } },
  );
  return response.data;
}

export async function getPublicProduct(
  businessId: string,
  productId: number,
): Promise<Product> {
  const response = await publicApi.get(
    `${baseURL}/${businessId}/products/${productId}/`,
  );
  return mapProduct(response.data);
}
