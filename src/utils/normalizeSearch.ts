// Normaliza texto para búsquedas insensibles a mayúsculas y acentos.
export const normalizeSearch = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
