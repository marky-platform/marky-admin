import api from "./axiosConfig";
import { debouncePromise } from "../utils/debouncePromise";

const baseURL = `${process.env.REACT_APP_API_URL}/business`;

export interface BusinessProfile {
  business_id: string;
  categories: number[];
  city: number | null;
  primary_currency: number;
  secondary_currency?: number | null;
  exchange_rate: string;
  is_primary_to_secondary?: boolean;
  // management_methods?: any;
  // display_methods?: any;
}

// POST: Crear un BusinessProfile
export async function createBusinessProfile(
  data: BusinessProfile,
): Promise<BusinessProfile> {
  const response = await api.post(`${baseURL}/business_profile/`, data);
  return response.data;
}

// GET: Obtener un BusinessProfile por ID
export async function getBusinessProfile(
  id: number | string,
): Promise<BusinessProfile> {
  const response = await api.get(`${baseURL}/business_profile/${id}/`);
  return response.data;
}

// PUT: Actualizar un BusinessProfile (sustituye todos los campos)
export async function updateBusinessProfile(
  id: number | string,
  data: BusinessProfile,
): Promise<BusinessProfile> {
  const response = await api.put(`${baseURL}/business_profile/${id}/`, data);
  return response.data;
}

// PATCH: Actualizar parcialmente un BusinessProfile
export async function patchBusinessProfile(
  id: number | string,
  data: Partial<BusinessProfile>,
): Promise<BusinessProfile> {
  const response = await api.patch(`${baseURL}/business_profile/${id}/`, data);
  return response.data;
}

export const validateBusinessName = async (business_id: string) => {
  try {
    const response = await api.get(`${baseURL}/validate-name/`, {
      params: { business_id },
    });
    return response.data; // { is_taken: true/false }
  } catch (error) {
    console.error("Error al intentar validar id de negocio", error);
    throw error;
  }
};

// Misma validación, pero agrupando ráfagas de llamadas (ej. cada tecla
// mientras el usuario escribe) en una sola request tras 500ms de pausa.
export const validateBusinessNameDebounced = debouncePromise(
  validateBusinessName,
  500,
);

// Interface for a single business channel destination (Instagram, Facebook,
// TikTok, WhatsApp, Enlaces). WhatsApp/Enlaces can have up to 3 per business.
export interface SocialLink {
  id: number;
  platform: "instagram" | "facebook" | "tiktok" | "whatsapp" | "link";
  platform_display: string;
  label: string;
  url: string;
  order: number;
}

export interface SocialMediaLinksReplacePayload {
  channels: { platform: SocialLink["platform"]; label?: string; url: string }[];
}

export interface SocialMediaLinksReplaceResponse {
  social_links: SocialLink[];
}

// POST: Replace the full set of social/contact channels for the business.
export async function updateSocialMediaLinks(
  data: SocialMediaLinksReplacePayload,
): Promise<SocialMediaLinksReplaceResponse> {
  const response = await api.post(
    `${baseURL}/social-media-links/bulk-update/`,
    data,
  );
  return response.data;
}

// Interface for category
export interface Category {
  id: number;
  name: string;
}

// Interface for a single named business address/location ("Ubicaciones").
export interface BusinessLocation {
  id: number;
  name: string;
  address: string;
}

export interface BusinessLocationsReplacePayload {
  locations: { id?: number; name: string; address: string }[];
}

export interface BusinessLocationsReplaceResponse {
  locations: BusinessLocation[];
}

// POST: Replace the full set of locations/addresses for the business.
export async function updateBusinessLocations(
  data: BusinessLocationsReplacePayload,
): Promise<BusinessLocationsReplaceResponse> {
  const response = await api.post(`${baseURL}/locations/bulk-update/`, data);
  return response.data;
}

// Interface for home page data
export interface HomePageData {
  business_name: string;
  social_links: SocialLink[];
  description: string | null;
  categories: Category[];
  profile_image: string;
  headquarter_attributes: { id: number; name: string }[] | null;
  locations: BusinessLocation[];
}

// GET: Fetch home page data
export async function getHomePageData(): Promise<HomePageData> {
  const response = await api.get(`${baseURL}/home-page/`);
  return response.data;
}

// Interface for business account info categories (re-uses Category shape)
export interface BusinessCategory {
  id: number;
  name: string;
}

// Interface for the account info endpoint response
export interface BusinessAccountInfo {
  business_name: string;
  email: string;
  phone_number: string;
  business_id: string;
  business_type: string;
  exchange_rate: string;
  is_primary_to_secondary?: boolean;
  city_id: number | null;
  city_name: string | null;
  country_id: number | null;
  country_name: string | null;
  primary_currency_id: number | null;
  primary_currency_name: string | null;
  primary_currency_code: string | null;
  secondary_currency_id: number | null;
  secondary_currency_name: string | null;
  secondary_currency_code: string | null;
  categories: BusinessCategory[];
}

// GET: Fetch business account info
export async function getBusinessAccountInfo(): Promise<BusinessAccountInfo> {
  const response = await api.get(`${baseURL}/account-info/`);
  return response.data;
}

// Payload type for updating account info (PATCH)
export interface BusinessAccountInfoUpdatePayload {
  business_name?: string;
  email?: string;
  phone_number?: string;
  business_id?: string;
  business_type?: string;
  exchange_rate?: string | null;
  is_primary_to_secondary?: boolean;
  categories?: number[];
  city?: number;
  primary_currency?: number;
  secondary_currency?: number | null;
}

// PATCH: Update business account info
export async function patchBusinessAccountInfo(
  data: BusinessAccountInfoUpdatePayload,
): Promise<BusinessAccountInfo> {
  const response = await api.patch(`${baseURL}/account-info/`, data);
  return response.data;
}

// Interface for business data to be updated
export interface BusinessData {
  description?: string;
  profile_image?: string;
  headquarter_attributes?: number[];
}

// PATCH: Update business data
export const updateBusiness = async (
  data: Partial<BusinessData>,
): Promise<BusinessData> => {
  const response = await api.patch(`${baseURL}/update/`, data);
  return response.data;
};

export const updateProfileImage = async (
  image: FormData,
): Promise<{ profile_image: string }> => {
  const response = await api.patch(`${baseURL}/profile-image/`, image, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
