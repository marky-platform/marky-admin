import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useThemeAssets } from "../themes/useThemeAssets";

interface AuthAsideProps {
  title: string;
  highlight?: string;
  supportText: string;
  image?: React.ReactNode;
}

const AuthAside: React.FC<AuthAsideProps> = ({
  title,
  highlight,
  supportText,
  image,
}) => {
  const theme = useTheme();
  const { logoPng } = useThemeAssets();

  return (
    <Box
      component="aside"
      sx={{
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        alignItems: "center",
        flex: { md: "0 0 33.3333%" },
        backgroundColor: theme.palette.secondary.main,
      }}
    >
      <Box
        sx={{
          width: "100%",
          paddingX: { md: theme.spacing(15) },
          paddingTop: "50px",
          paddingBottom: "50px",
        }}
      >
        <img
          src={logoPng}
          alt="Marky"
          style={{ marginBottom: theme.spacing(6) }}
        />
        <Typography
          sx={{
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontSize: "28px",
            fontWeight: 700,
            lineHeight: "34px",
            letterSpacing: "-0.096px",
            color: theme.palette.text.primary,
            marginBottom: "14px",
          }}
        >
          {title}
          {highlight && (
            <>
              <br />
              <span style={{ color: theme.palette.primary.main }}>
                {highlight}
              </span>
            </>
          )}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "18px",
            letterSpacing: "-0.1px",
            color: theme.palette.text.primary,
          }}
        >
          {supportText}
        </Typography>
      </Box>
      {image && (
        <Box display="flex" justifyContent="center">
          {image}
        </Box>
      )}
    </Box>
  );
};

export default AuthAside;
