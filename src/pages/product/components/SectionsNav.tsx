import CheckIcon from "@mui/icons-material/Check";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Box, Typography } from "@mui/material";
import { FormikErrors } from "formik";
import React from "react";
import { Product } from "../../../types/product";
import { getSectionDisplayName, getSectionNavState } from "./sectionNavState";

export interface SectionsNavItem {
  name: string;
  icon: React.ReactNode;
}

interface SectionsNavProps {
  sections: SectionsNavItem[];
  selectedSection: string;
  formikErrors: FormikErrors<Product>;
  activationFlags: Record<string, boolean>;
  hasAttemptedPublish: boolean;
  onSelect: (sectionName: string) => void;
}

const StatusIcon = ({ state }: { state: ReturnType<typeof getSectionNavState> }) => {
  if (state === "green") {
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: "success.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <CheckIcon sx={{ fontSize: 16, color: "fixed.white" }} />
      </Box>
    );
  }
  if (state === "red") {
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: "error.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <PriorityHighIcon sx={{ fontSize: 16, color: "fixed.white" }} />
      </Box>
    );
  }
  if (state === "blue") {
    return (
      <RadioButtonCheckedIcon sx={{ fontSize: 24, color: "primary.main", flexShrink: 0 }} />
    );
  }
  return (
    <RadioButtonUncheckedIcon sx={{ fontSize: 24, color: "grey.800", flexShrink: 0 }} />
  );
};

const SectionsNav: React.FC<SectionsNavProps> = ({
  sections,
  selectedSection,
  formikErrors,
  activationFlags,
  hasAttemptedPublish,
  onSelect,
}) => {
  return (
    <Box sx={{ width: 280, flexShrink: 0, pl: 10, mr: 10 }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
        Secciones
      </Typography>
      <Box display="flex" flexDirection="column">
        {sections.map((section, index) => {
          const state = getSectionNavState(
            section.name,
            selectedSection,
            formikErrors,
            activationFlags[section.name],
            section.name !== "Producto",
            hasAttemptedPublish,
          );
          // Driven independently from `state`: an errored section must
          // always show the red icon (see getSectionNavState), but should
          // still read as "the tab you're on" via the pill background/text
          // when it's also the selected one.
          const isSelected = section.name === selectedSection;
          const isLast = index === sections.length - 1;
          return (
            <Box key={section.name}>
              <Box
                onClick={() => onSelect(section.name)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "33px",
                  p: "10px",
                  borderRadius: "56px",
                  cursor: "pointer",
                  backgroundColor: isSelected ? "secondary.main" : "grey.50",
                }}
              >
                <StatusIcon state={state} />
                <Typography
                  variant="body2"
                  fontWeight={isSelected ? "bold" : "normal"}
                  color={isSelected ? "primary.main" : "text.primary"}
                >
                  {getSectionDisplayName(section.name)}
                </Typography>
              </Box>
              {!isLast && (
                <Box display="flex" justifyContent="center" sx={{ py: "4px" }}>
                  <Box
                    sx={{
                      width: 0,
                      borderLeft: "3px dashed",
                      borderColor: "grey.600",
                      height: 12,
                      ml: "20px",
                    }}
                  />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default SectionsNav;
