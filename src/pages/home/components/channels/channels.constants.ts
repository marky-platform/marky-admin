import React from "react";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { ReactComponent as FacebookSvgIcon } from "../../../../assets/icons/facebook.svg";
import { ReactComponent as TiktokIcon } from "../../../../assets/icons/tiktok.svg";
import { ReactComponent as LinkIcon } from "../../../../assets/icons/link.svg";
import { ChannelKey } from "../../../../types/channel";
import { CHANNEL_URL_PREFIXES } from "../../../../mappers/channelMapper";

export const MAX_SELECTED_CHANNELS = 3;
export const LABEL_MAX_LENGTH = 22;

export interface ChannelMeta {
  /** Nombre del canal en selección/resumen, ej. "Instagram" */
  label: string;
  /** Título de la sub-pantalla de detalle, ej. "Enlaces externos" */
  detailTitle: string;
  /** Ícono a usar en botones/filas para este canal */
  icon: React.ElementType;
  /** Prefijo de URL fijo que el usuario no edita (RRSS con usuario) */
  urlPrefix?: string;
  /** Si admite varias entradas (WhatsApp, Enlaces) o solo una */
  multiEntry: boolean;
  /** Tope de entradas para este canal */
  maxEntries: number;
  /** Copy del botón "Añadir otro ..." (solo canales multiEntry) */
  addEntryLabel?: string;
  /** Copy de aviso al llegar al tope de entradas */
  limitCopy?: string;
  /** Sustantivo usado para armar "Nombre para {noun} N" en el campo de nombre */
  entryNoun?: string;
  /** Placeholder del campo de URL/usuario/teléfono */
  urlPlaceholder: string;
  /** Label del campo de URL/usuario/teléfono; por defecto usa `label` */
  urlFieldLabel?: string;
}

export const CHANNEL_META: Record<ChannelKey, ChannelMeta> = {
  instagram: {
    label: "Instagram",
    detailTitle: "Instagram",
    icon: InstagramIcon,
    urlPrefix: CHANNEL_URL_PREFIXES.instagram,
    multiEntry: false,
    maxEntries: 1,
    urlPlaceholder: "usuario",
  },
  facebook: {
    label: "Facebook",
    detailTitle: "Facebook",
    icon: FacebookSvgIcon,
    urlPrefix: CHANNEL_URL_PREFIXES.facebook,
    multiEntry: false,
    maxEntries: 1,
    urlPlaceholder: "usuario",
  },
  tiktok: {
    label: "TikTok",
    detailTitle: "TikTok",
    icon: TiktokIcon,
    urlPrefix: CHANNEL_URL_PREFIXES.tiktok,
    multiEntry: false,
    maxEntries: 1,
    urlPlaceholder: "usuario",
  },
  whatsapp: {
    label: "WhatsApp",
    detailTitle: "WhatsApp",
    icon: WhatsAppIcon,
    multiEntry: true,
    maxEntries: 3,
    addEntryLabel: "Añadir otro número",
    limitCopy: "Máximo 3 WhatsApps por perfil comercial",
    entryNoun: "número",
    urlPlaceholder: "Ingrese su número",
    urlFieldLabel: "Número de WhatsApp",
  },
  link: {
    label: "Enlaces",
    detailTitle: "Enlaces externos",
    icon: LinkIcon,
    multiEntry: true,
    maxEntries: 3,
    addEntryLabel: "Añadir otro enlace",
    limitCopy: "Máximo 3 enlaces por perfil comercial",
    entryNoun: "enlace",
    urlPlaceholder: "www.sitio.com",
    urlFieldLabel: "URL del enlace",
  },
};

export const ALL_CHANNEL_KEYS: ChannelKey[] = [
  "instagram",
  "facebook",
  "tiktok",
  "whatsapp",
  "link",
];
