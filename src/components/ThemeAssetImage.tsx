import { Box, BoxProps } from "@mui/material";
import React from "react";
import type { ThemeAssets } from "../themes/assets";
import { useThemeAssets } from "../themes/useThemeAssets";

type AssetKey = {
  [K in keyof ThemeAssets]: ThemeAssets[K] extends string ? K : never;
}[keyof ThemeAssets];

interface ThemeAssetImageProps extends Omit<BoxProps<"img">, "component"> {
  /** Key of the per-scheme asset map (src/themes/assets.ts). */
  asset: AssetKey;
}

// `<img>` whose file depends on the active color scheme (SVGs used through
// `<img src>` can't be recolored with CSS).
const ThemeAssetImage: React.FC<ThemeAssetImageProps> = ({
  asset,
  ...props
}) => {
  const assets = useThemeAssets();
  return <Box component="img" src={assets[asset]} {...props} />;
};

export default ThemeAssetImage;
