import { Box } from "@mui/material";
import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import BusinessProfilePanel from "../../components/BusinessProfilePanel";
import usePublicBusinessProfile from "../../hooks/usePublicBusinessProfile";
import usePublicCategories from "../../hooks/usePublicCategories";
import { mapSocialLinksToChannels } from "../../mappers/channelMapper";
import PublicProductGrid from "./components/PublicProductGrid";
import PublicNotFound from "./components/PublicNotFound";

// Public, unauthenticated business profile — marky.one/<businessId>. Mirrors
// pages/home/index.tsx's two-column shell (296px rail + flex-grow right
// pane) minus <Header/>, the Formik wrapper, and every admin modal.
const PublicBusinessProfilePage: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const { data: profile, isLoading, error } = usePublicBusinessProfile(businessId);
  const { data: categoriesData } = usePublicCategories(businessId);
  const categories = useMemo(
    () => categoriesData?.results ?? [],
    [categoriesData],
  );

  useEffect(() => {
    if (profile?.business_name) {
      document.title = profile.business_name;
    }
  }, [profile?.business_name]);

  if (isLoading) {
    return (
      <Box
        sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}
      >
        <LoadingSpinner message="Cargando negocio..." size={50} />
      </Box>
    );
  }

  const status = (error as any)?.response?.status;
  if (error || !profile) {
    if (status === 404) {
      return <PublicNotFound message="No encontramos este negocio." />;
    }
    return <PublicNotFound message="Ocurrió un error al cargar el negocio." />;
  }

  const socialMedia = mapSocialLinksToChannels(profile.social_links);
  const categoriesText = profile.categories?.length
    ? profile.categories.map((cat) => cat.name).join(" | ")
    : "";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box
        sx={{
          flex: 1,
          px: { xs: 4, sm: 6, md: 0 },
          pt: { xs: 3, md: 8 },
          pb: 3,
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 3, md: 0 },
            height: { xs: "auto", md: "100vh" },
          }}
        >
          <Box
            sx={{
              boxSizing: "border-box",
              width: "100%",
              flexBasis: { xs: "100%", md: "296px" },
              maxWidth: { xs: "100%", md: "296px" },
              flexGrow: 0,
              flexShrink: 0,
              px: { xs: 0, md: 8 },
              borderRight: (theme) => ({
                xs: "none",
                md: `1px solid ${theme.palette.grey[600]}`,
              }),
            }}
          >
            <Box
              sx={{
                position: { xs: "static", md: "sticky" },
                top: { md: "1rem" },
                width: "100%",
                maxWidth: { md: "232px" },
                mx: { md: "auto" },
                boxSizing: "border-box",
              }}
            >
              <BusinessProfilePanel
                name={profile.business_name}
                categoriesText={categoriesText}
                photo={profile.profile_image}
                description={profile.description || ""}
                attributes={profile.headquarter_attributes || []}
                socialMedia={socialMedia}
                locations={profile.locations || []}
                readOnly
              />
            </Box>
          </Box>
          <Box
            sx={{
              width: "100%",
              minWidth: 0,
              flexBasis: { xs: "100%", md: 0 },
              flexGrow: { xs: 0, md: 1 },
              maxWidth: { xs: "100%", md: "100%" },
            }}
          >
            {businessId && (
              <PublicProductGrid businessId={businessId} categories={categories} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PublicBusinessProfilePage;
