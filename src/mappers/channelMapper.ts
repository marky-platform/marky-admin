import { SocialLink, SocialMediaLinksReplacePayload } from "../services/businessService";
import { ChannelEntry, ChannelKey, ChannelsByKey } from "../types/channel";
import { normalizeWebsiteUrl } from "../utils/websiteUrl";

// Prefijo de URL bloqueado por RRSS: el usuario solo escribe su usuario.
export const CHANNEL_URL_PREFIXES: Partial<Record<ChannelKey, string>> = {
  instagram: "https://www.instagram.com/",
  facebook: "https://www.facebook.com/",
  tiktok: "https://www.tiktok.com/@",
};

const stripChannelPrefix = (chan: ChannelKey, value: string): string => {
  if (!value) return value;
  if (chan === "link") {
    // buildChannelValue always stores enlaces with a scheme; strip it back
    // off so the field round-trips to the bare-domain format shown by its
    // placeholder.
    return value.replace(/^https?:\/\//i, "");
  }
  const prefix = CHANNEL_URL_PREFIXES[chan];
  if (!prefix) return value;
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
};

const buildChannelValue = (chan: ChannelKey, value: string): string => {
  const prefix = CHANNEL_URL_PREFIXES[chan];
  if (prefix && value) {
    return value.startsWith(prefix) ? value : `${prefix}${value}`;
  }
  if (chan === "link" && value) {
    return normalizeWebsiteUrl(value);
  }
  return value;
};

// Agrupa la lista plana de SocialLink que devuelve el backend por canal,
// ordenados por `order`, con las URLs listas para mostrarse en un campo de
// edición (sin el prefijo/esquema que el propio canal vuelve a anteponer).
export const mapSocialLinksToChannels = (links: SocialLink[] = []): ChannelsByKey => {
  const byChannel: ChannelsByKey = {};
  [...links]
    .sort((a, b) => a.order - b.order)
    .forEach((link) => {
      const key = link.platform;
      const entry: ChannelEntry = {
        id: link.id,
        label: link.label ?? "",
        url: stripChannelPrefix(key, link.url),
      };
      if (!byChannel[key]) byChannel[key] = [];
      byChannel[key]!.push(entry);
    });
  return byChannel;
};

// Resuelve la entrada de un canal a la URL externa que debe abrirse en una
// pestaña nueva. Para whatsapp arma un enlace wa.me a partir del número
// (guardado como dígitos crudos, sin prefijo); para el resto reutiliza la
// misma lógica de armado de URL que usa el payload de guardado.
export const buildChannelExternalUrl = (chan: ChannelKey, entry: ChannelEntry): string => {
  if (chan === "whatsapp") {
    const digits = entry.url.replace(/\D/g, "");
    return `https://wa.me/${digits}`;
  }
  return buildChannelValue(chan, entry.url);
};

// Reconstruye el payload que espera el bulk-update: reagrega los prefijos de
// canal y normaliza enlaces, descartando entradas sin URL.
export const mapChannelsToPayload = (
  channels: ChannelsByKey,
): SocialMediaLinksReplacePayload => {
  const payload: SocialMediaLinksReplacePayload["channels"] = [];

  (Object.keys(channels) as ChannelKey[]).forEach((platform) => {
    (channels[platform] || []).forEach((entry) => {
      const url = entry.url?.trim();
      if (!url) return;
      payload.push({
        platform,
        label: entry.label?.trim() || "",
        url: buildChannelValue(platform, url),
      });
    });
  });

  return { channels: payload };
};
