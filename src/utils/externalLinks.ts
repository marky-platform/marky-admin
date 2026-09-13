// Abre una URL externa en una pestaña nueva. Único punto de la app que
// invoca window.open — reutilizado por canales multi-entrada y ubicaciones,
// para no olvidar los flags de seguridad en ninguno de esos sitios.
export const openExternalUrl = (url: string): void => {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
};

// Arma un enlace de búsqueda de Google Maps a partir de una dirección libre
// (esta feature no maneja lat/lng, solo texto).
export const buildLocationMapsUrl = (address: string): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
