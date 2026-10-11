import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckIcon from "@mui/icons-material/Check";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { Box, Typography } from "@mui/material";
import { FormikErrors } from "formik";
import React from "react";
import { Product } from "../../../types/product";
import { getSectionDisplayName, getSectionNavState } from "./sectionNavState";

export interface CompleteYourProductItem {
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface CompleteYourProductListProps {
  sections: CompleteYourProductItem[];
  selectedSection: string;
  formikErrors: FormikErrors<Product>;
  activationFlags: Record<string, boolean>;
  hasAttemptedPublish: boolean;
  onSelect: (sectionName: string) => void;
}

const StatusDot = ({ state }: { state: ReturnType<typeof getSectionNavState> }) => {
  if (state === "green") {
    return (
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: "success.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <CheckIcon sx={{ fontSize: 14, color: "fixed.white" }} />
      </Box>
    );
  }
  if (state === "red") {
    return (
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: "error.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <PriorityHighIcon sx={{ fontSize: 14, color: "fixed.white" }} />
      </Box>
    );
  }
  return null;
};

const CompleteYourProductList: React.FC<CompleteYourProductListProps> = ({
  sections,
  selectedSection,
  formikErrors,
  activationFlags,
  hasAttemptedPublish,
  onSelect,
}) => {
  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Completa tu producto (Opcional)
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        {sections.map((section) => {
          const state = getSectionNavState(
            section.name,
            selectedSection,
            formikErrors,
            activationFlags[section.name],
            true,
            hasAttemptedPublish,
          );
          return (
            <Box
              key={section.name}
              onClick={() => onSelect(section.name)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 3,
                border: "1px solid",
                borderColor: "grey.600",
                borderRadius: 2,
                cursor: "pointer",
              }}
            >
              <Box sx={{ color: "text.primary", display: "flex" }}>{section.icon}</Box>
              <Box sx={{ flex: 1 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body1" fontWeight="bold">
                    {getSectionDisplayName(section.name)}
                  </Typography>
                  <StatusDot state={state} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {section.description}
                </Typography>
              </Box>
              <ChevronRightIcon color="action" />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default CompleteYourProductList;
