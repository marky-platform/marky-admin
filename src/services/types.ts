// src/services/types.ts (por ejemplo)

export interface DRFErrorResponse {
  // Mensaje de error genérico
  error?: string;

  // DRF a veces usa "detail" en errores de autenticación u otros
  detail?: string;

  // Indica si la respuesta fue exitosa o no
  success?: boolean;
  message: string;

  // Estructura de errores más granular, si hay validación de campos
  errors?: Record<string, string[] | string> | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaginatedProductCategoriesResponse<T>
  extends PaginatedResponse<T> {
  products_count: number;
  /** Solo cuando se pide `include_counts=true`. */
  filter_counts?: { promotion: number; featured: number };
}

export interface PaginatedNotificationsResponse<T>
  extends PaginatedResponse<T> {
  unread_count: number;
}
