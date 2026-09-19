// AttributesInfo.tsx
import React from "react";
import { Box, Typography } from "@mui/material";
import { Attribute } from "..";
import { BUSINESS_ATTRIBUTE_ICON_MAP } from "../../../utils/businessAttributeIcons";

interface AttributesInfoProps {
  attributes: Attribute[];
  onOpen: () => void;
}

const AttributesInfo: React.FC<AttributesInfoProps> = ({
  attributes,
  onOpen,
}) => {
  const isEmpty = !attributes || Object.keys(attributes).length === 0;
  return (
    <Box
      onClick={onOpen}
      sx={{
        border: isEmpty ? "1px dashed #B8CDF5" : "none",
        backgroundColor: isEmpty ? "#FAFCFF" : "transparent",
        borderRadius: isEmpty ? "6px" : 0,
        py: isEmpty ? 4 : 0,
        px: isEmpty ? 3 : 0,
        cursor: "pointer",
        textAlign: isEmpty ? "center" : "left",
      }}
    >
      {isEmpty ? (
        <Typography
          sx={{
            color: "#2563EB",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "22px",
          }}
        >
          Agrega tus atributos
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: 6,
            rowGap: 2,
          }}
        >
          {attributes.map((attr: any) => {
            const Icon = BUSINESS_ATTRIBUTE_ICON_MAP[attr.name];
            return (
              <Box
                key={attr.id}
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ flexShrink: 0 }}
              >
                {Icon && (
                  <Icon sx={{ fontSize: 18, color: "#4F4F4F", flexShrink: 0 }} />
                )}
                <Typography
                  sx={{
                    fontSize: 12,
                    lineHeight: "16px",
                    color: "#4F4F4F",
                    whiteSpace: "nowrap",
                    fontWeight: 400,
                  }}
                >
                  {attr.name}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default AttributesInfo;
