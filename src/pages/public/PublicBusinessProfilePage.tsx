import { Box } from "@mui/material";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import BusinessProfilePanel from "../../components/BusinessProfilePanel";
import usePublicBusinessProfile from "../../hooks/usePublicBusinessProfile";
import usePublicCategories from "../../hooks/usePublicCategories";
import { mapSocialLinksToChannels } from "../../mappers/channelMapper";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import ProfileActionsMenu from "../../components/ProfileActionsMenu";
import ThemeModeToggle from "../../components/ThemeModeToggle";
import useProfileShareActions from "../../hooks/useProfileShareActions";
import PublicProductGrid from "./components/PublicProductGrid";
import PublicNotFound from "./components/PublicNotFound";
import { analytics } from "../../analytics/client";
import { useCatalogVisit } from "../../analytics/hooks";
import type { AnalyticsActionType } from "../../analytics/types";

const ICON_BUTTON_PADDING = 4; // padding compacto de los botones en md+

// Public, unauthenticated business profile — marky.one/<businessId>. Mirrors
// pages/home/index.tsx's two-column shell (296px rail + flex-grow right
// pane) minus <Header/>, the Formik wrapper, and every admin modal.
const PublicBusinessProfilePage: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const { data: profile, isLoading, error } = usePublicBusinessProfile(businessId);
  const { data: categoriesData, isLoading: categoriesLoading } =
    usePublicCategories(businessId);
  const categories = useMemo(
    () => categoriesData?.results ?? [],
    [categoriesData],
  );

  const shareItems = useProfileShareActions({
    businessId,
    businessName: profile?.business_name,
  });

  // La fila de iconos de contacto está centrada, así que su borde derecho
  // depende de cuántos canales hay. Medimos el botón de ubicaciones (el último
  // de la fila) y alineamos a él el borde derecho del menú de acciones.
  const stickyBoxRef = useRef<HTMLDivElement>(null);
  const [actionsInset, setActionsInset] = useState(0);
  const hasProfile = Boolean(profile);
  useLayoutEffect(() => {
    const box = stickyBoxRef.current;
    if (!box) return;
    const measure = () => {
      const target = box.querySelector<HTMLElement>('[aria-label="Ubicaciones"]');
      if (!target) return setActionsInset(0);
      const inset = box.getBoundingClientRect().right - target.getBoundingClientRect().right;
      // Puede ser negativo: con muchos canales la fila desborda la columna.
      // El IconButton aporta padding entre su borde y el glifo.
      setActionsInset(Math.round(inset - ICON_BUTTON_PADDING));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [hasProfile, profile?.locations, profile?.social_links]);

  // Una visita por negocio/sesión, solo con un perfil válido (no durante la
  // carga, el error ni el 404).
  useCatalogVisit(businessId, hasProfile);

  const handleExternalAction = useCallback(
    (actionType: AnalyticsActionType) => {
      if (businessId) analytics.track("action_click", { businessId, actionType });
    },
    [businessId],
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
        data-testid="public-profile-page"
        sx={{
          flex: 1,
          px: { xs: 4, sm: 6, md: 0 },
          // En mobile se conserva el aire superior. En desktop el borde
          // divisorio debe comenzar arriba, por eso el espacio se aplica a
          // cada columna y no al contenedor que las envuelve.
          pt: { xs: 8, md: 0 },
          pb: 3,
        }}
      >
        <Box
          data-testid="public-profile-layout"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 3, md: 0 },
            // Crece con el catálogo (no alto fijo) para que el rail sticky
            // acompañe todo el scroll, no solo el primer viewport.
            height: "auto",
            minHeight: { md: "100vh" },
          }}
        >
          <Box
            data-testid="public-profile-column"
            sx={{
              boxSizing: "border-box",
              width: "100%",
              flexBasis: { xs: "100%", md: "296px" },
              maxWidth: { xs: "100%", md: "296px" },
              flexGrow: 0,
              flexShrink: 0,
              position: { md: "relative" },
              px: { xs: 0, md: 8 },
              pt: { md: 8 },
              borderRight: (theme) => ({
                xs: "none",
                md: `1px solid ${theme.palette.border.soft}`,
              }),
            }}
          >
            <Box
              ref={stickyBoxRef}
              data-testid="profile-sticky-box"
              sx={{
                position: { xs: "relative", md: "sticky" },
                top: { md: "1rem" },
                width: "100%",
                maxWidth: { md: "232px" },
                mx: { md: "auto" },
                boxSizing: "border-box",
              }}
            >
              {/* Sin header público, el switch de tema y el menú de acciones
                  (compartir / copiar / QR / reportar) viven juntos arriba a la
                  derecha. Dentro del contenedor sticky
                  (md+) para no salirse de vista al hacer scroll. */}
              <Box
                data-testid="profile-top-actions"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  // Esquina superior derecha en mobile y desktop, sin mover el
                  // resto del perfil. En desktop la columna es angosta, así que
                  // los botones se compactan para no tocar la foto, y el borde
                  // derecho se alinea al botón de ubicaciones. En mobile, -8px
                  // compensa el padding del IconButton para que el glifo quede
                  // al ras del contenido.
                  position: "absolute",
                  top: 0,
                  right: { xs: "-8px", md: `${actionsInset}px` },
                  "& .MuiIconButton-root": { p: { md: `${ICON_BUTTON_PADDING}px` } },
                  "& .MuiIconButton-root svg": { fontSize: { md: 20 } },
                }}
              >
                <ThemeModeToggle variant="icon" />
                <ProfileActionsMenu
                  placement="below-end"
                  items={[
                    ...shareItems,
                    {
                      icon: FlagOutlinedIcon,
                      text: "Reportar",
                      onClick: () => {},
                      destructive: true,
                    },
                  ]}
                />
              </Box>
              <BusinessProfilePanel
                name={profile.business_name}
                categoriesText={categoriesText}
                photo={profile.profile_image}
                description={profile.description || ""}
                attributes={profile.headquarter_attributes || []}
                socialMedia={socialMedia}
                locations={profile.locations || []}
                readOnly
                onExternalAction={handleExternalAction}
              />
            </Box>
          </Box>
          <Box
            data-testid="public-catalog-column"
            sx={{
              width: "100%",
              minWidth: 0,
              flexBasis: { xs: "100%", md: 0 },
              flexGrow: { xs: 0, md: 1 },
              maxWidth: { xs: "100%", md: "100%" },
              pt: { md: 8 },
            }}
          >
            {businessId && (
              <PublicProductGrid
                businessId={businessId}
                categories={categories}
                categoriesLoading={categoriesLoading}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PublicBusinessProfilePage;
