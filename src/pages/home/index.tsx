import { Box } from "@mui/material";
import { Formik } from "formik";
import { useState, useMemo, useRef, ChangeEvent } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ImageCropModal from "../../components/ImageCropModal";
import { useHomePageData } from "../../hooks/useHomePageData";
import { useBusinessAccountInfo } from "../../hooks/useBusinessAccountInfo";
import {
  useUpdateBusiness,
  useUpdateBusinessAccountInfo,
  useUpdateBusinessProfileImage,
} from "../../hooks/useBusinessMutations";
import { useImageCropper } from "../../hooks/useImageCropper";
import AttributesModal from "./components/AttributesModal";
import { BusinessInfo } from "./components/businessInfo";
import { ChannelWizardModal } from "./components/channels/ChannelWizardModal";
import { mapSocialLinksToChannels } from "../../mappers/channelMapper";
import { ChannelsByKey } from "../../types/channel";
import DescriptionModal from "./components/DescriptionModal";
import EditNameModal from "./components/EditNameModal";
import EditUsernameModal from "./components/EditUsernameModal";
import LocationsModal, {
  LocationEntryValue,
} from "./components/LocationsModal";
import { useUpdateBusinessLocations } from "../../hooks/useUpdateBusinessLocations";
import { Header } from "../../components/Header";
import PresentationModal from "./components/PresentationModal";
import { ProductGrid } from "./components/productGrid";

export interface Attribute {
  id: number;
  name: string;
}

const branchFormInitialValues = {
  business_name: "",
  category: "",
  socialMedia: {} as ChannelsByKey,
  description: "",
  attributes: [] as Attribute[],
  locations: [] as LocationEntryValue[],
  profilePhoto: "",
};

const Home = () => {
  const [showBackButtonInModals, setShowBackButtonInModals] = useState(false);
  const [openSocialMediaModal, setOpenSocialMediaModal] = useState(false);
  const [openDescriptionModal, setOpenDescriptionModal] = useState(false);
  const [openAttributesModal, setOpenAttributesModal] = useState(false);
  const [openPresentationModal, setOpenPresentationModal] = useState(false);
  const [openEditNameModal, setOpenEditNameModal] = useState(false);
  const [openEditUsernameModal, setOpenEditUsernameModal] = useState(false);
  const [openLocationsModal, setOpenLocationsModal] = useState(false);

  const { mutate: updateBusinessMutation } = useUpdateBusiness();
  const { mutate: updateBusinessAccountInfoMutation } =
    useUpdateBusinessAccountInfo();
  const { mutate: updateBusinessLocationsMutation } =
    useUpdateBusinessLocations();

  // Fetch home page data
  const { data: homePageData, isLoading, error } = useHomePageData();
  const { data: businessAccountInfo } = useBusinessAccountInfo();

  // Foto de perfil: se comparte entre el avatar de BusinessInfo y el botón
  // "Cambiar foto" de PresentationModal, así ambos disparan la misma acción.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: updateProfileImage } = useUpdateBusinessProfileImage();
  const setFieldValueRef = useRef<(field: string, value: any) => void>(
    () => {},
  );

  const {
    crop,
    zoom,
    croppingMedia,
    imageUrl,
    setCrop,
    setZoom,
    handleCropComplete,
    handleOpenCropModal,
    handleCloseCropModal,
    handleApplyCrop,
    handleZoomChange,
  } = useImageCropper((croppedImage) => {
    if (croppedImage) {
      setFieldValueRef.current("profilePhoto", croppedImage);
      const formData = new FormData();
      formData.append("profile_image", croppedImage);
      updateProfileImage(formData);
    }
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleOpenCropModal(file);
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleOpenPhotoPicker = () => {
    fileInputRef.current?.click();
  };

  // Transform API data to form format
  const formInitialValues = useMemo(() => {
    if (!homePageData) return branchFormInitialValues;

    // Agrupa los social_links del backend por canal (varias entradas por
    // WhatsApp/Enlaces posibles, a diferencia de un simple aplanado).
    const socialMedia = mapSocialLinksToChannels(homePageData.social_links);

    // Transform categories to category string
    const categoryNames = homePageData.categories
      .map((cat) => cat.name)
      .join(" | ");

    // Transform headquarter_attributes to attributes array
    const attributes: Attribute[] = homePageData.headquarter_attributes || [];

    return {
      business_name: homePageData.business_name,
      category: categoryNames,
      socialMedia,
      description: homePageData.description || "",
      attributes,
      locations: homePageData.locations || [],
      profilePhoto: homePageData.profile_image,
    };
  }, [homePageData]);

  // Formik aquí solo mantiene el estado local del formulario; cada campo se
  // guarda mediante las mutaciones de los modales hijos (ver más abajo), por
  // lo que este formulario nunca se envía directamente.
  const handleSubmit = () => {};

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LoadingSpinner message="Cargando datos del negocio..." size={50} />
        </Box>
      </Box>
    );
  }

  // Show error state if data fetch failed
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />
        <Box sx={{ flex: 1, p: 3 }}>
          <Box textAlign="center" py={4}>
            <p>
              Error al cargar los datos del negocio. Por favor, intenta de
              nuevo.
            </p>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Header />
      <Box
        sx={{
          flex: 1,
          px: { xs: 4, sm: 6, md: 0 },
          pt: { xs: 3, md: 0 },
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
              pt: { xs: 0, md: 8 },
              borderRight: (theme) => ({
                xs: "none",
                md: `1px solid ${theme.palette.grey[600]}`,
              }),
            }}
          >
            <Formik
              initialValues={formInitialValues}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue }) => {
                setFieldValueRef.current = setFieldValue;

                return (
                  <>
                    <ImageCropModal
                      open={!!croppingMedia}
                      onClose={handleCloseCropModal}
                      onApply={handleApplyCrop}
                      image={imageUrl}
                      crop={crop}
                      zoom={zoom}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={handleCropComplete}
                      handleZoomChange={handleZoomChange}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      accept="image/*"
                    />
                    <Box
                      sx={{
                        position: { xs: "static", md: "sticky" },
                        top: { md: "4.7rem" },
                        width: "100%",
                        maxWidth: { md: "232px" },
                        mx: { md: "auto" },
                        boxSizing: "border-box",
                      }}
                    >
                      <BusinessInfo
                        values={values}
                        homePageData={homePageData}
                        setFieldValue={setFieldValue}
                        locations={values.locations}
                        onOpenPhotoPicker={handleOpenPhotoPicker}
                        onOpenEditProfile={() =>
                          setOpenPresentationModal(true)
                        }
                        openDescriptionModal={() =>
                          setOpenDescriptionModal(true)
                        }
                        openAttributesModal={() => setOpenAttributesModal(true)}
                        onSettings={() => {
                          console.log("Abrir configuración");
                        }}
                      />
                    </Box>

                    <ChannelWizardModal
                      onBack={
                        showBackButtonInModals
                          ? () => {
                              setOpenPresentationModal(true);
                              setOpenSocialMediaModal(false);
                            }
                          : undefined
                      }
                      open={openSocialMediaModal}
                      onClose={() => {
                        setOpenSocialMediaModal(false);
                        setShowBackButtonInModals(false);
                      }}
                      initialData={values.socialMedia}
                      onSubmit={(channels) => {
                        setFieldValue("socialMedia", channels);
                      }}
                    />

                    <DescriptionModal
                      onBack={
                        showBackButtonInModals
                          ? () => {
                              setOpenPresentationModal(true);
                              setOpenDescriptionModal(false);
                            }
                          : undefined
                      }
                      open={openDescriptionModal}
                      onClose={() => {
                        setOpenDescriptionModal(false);
                        setShowBackButtonInModals(false);
                      }}
                      initialDescription={values.description}
                      onSubmit={(description) => {
                        updateBusinessMutation({ description });
                        setFieldValue("description", description);
                      }}
                    />

                    <AttributesModal
                      onBack={
                        showBackButtonInModals
                          ? () => {
                              setOpenPresentationModal(true);
                              setOpenAttributesModal(false);
                            }
                          : undefined
                      }
                      open={openAttributesModal}
                      onClose={() => {
                        setOpenAttributesModal(false);
                        setShowBackButtonInModals(false);
                      }}
                      initialAttributes={values.attributes}
                      onSubmit={(attributes) => {
                        const attributeIds = attributes.map((attr) => attr.id);
                        updateBusinessMutation({
                          headquarter_attributes: attributeIds,
                        });
                        setFieldValue("attributes", attributes);
                      }}
                    />

                    <EditNameModal
                      onBack={
                        showBackButtonInModals
                          ? () => {
                              setOpenPresentationModal(true);
                              setOpenEditNameModal(false);
                            }
                          : undefined
                      }
                      open={openEditNameModal}
                      onClose={() => {
                        setOpenEditNameModal(false);
                        setShowBackButtonInModals(false);
                      }}
                      initialName={values.business_name}
                      onSubmit={(business_name) => {
                        updateBusinessAccountInfoMutation({ business_name });
                        setFieldValue("business_name", business_name);
                      }}
                    />

                    <EditUsernameModal
                      onBack={
                        showBackButtonInModals
                          ? () => {
                              setOpenPresentationModal(true);
                              setOpenEditUsernameModal(false);
                            }
                          : undefined
                      }
                      open={openEditUsernameModal}
                      onClose={() => {
                        setOpenEditUsernameModal(false);
                        setShowBackButtonInModals(false);
                      }}
                      initialUsername={businessAccountInfo?.business_id || ""}
                      onSubmit={(business_id) => {
                        updateBusinessAccountInfoMutation({ business_id });
                      }}
                    />

                    <LocationsModal
                      onBack={
                        showBackButtonInModals
                          ? () => {
                              setOpenPresentationModal(true);
                              setOpenLocationsModal(false);
                            }
                          : undefined
                      }
                      open={openLocationsModal}
                      onClose={() => {
                        setOpenLocationsModal(false);
                        setShowBackButtonInModals(false);
                      }}
                      initialLocations={values.locations}
                      onSubmit={(locations) => {
                        updateBusinessLocationsMutation({ locations });
                        setFieldValue("locations", locations);
                      }}
                    />

                    <PresentationModal
                      open={openPresentationModal}
                      onClose={() => {
                        setOpenPresentationModal(false);
                        setShowBackButtonInModals(false);
                      }}
                      onEditPhoto={handleOpenPhotoPicker}
                      onEditName={() => {
                        setOpenEditNameModal(true);
                        setOpenPresentationModal(false);
                        setShowBackButtonInModals(true);
                      }}
                      onEditUsername={() => {
                        setOpenEditUsernameModal(true);
                        setOpenPresentationModal(false);
                        setShowBackButtonInModals(true);
                      }}
                      onEditChannels={() => {
                        setOpenSocialMediaModal(true);
                        setOpenPresentationModal(false);
                        setShowBackButtonInModals(true);
                      }}
                      onEditDescription={() => {
                        setOpenDescriptionModal(true);
                        setOpenPresentationModal(false);
                        setShowBackButtonInModals(true);
                      }}
                      onEditLocations={() => {
                        setOpenLocationsModal(true);
                        setOpenPresentationModal(false);
                        setShowBackButtonInModals(true);
                      }}
                      onEditAttributes={() => {
                        setOpenAttributesModal(true);
                        setOpenPresentationModal(false);
                        setShowBackButtonInModals(true);
                      }}
                      values={values}
                      profilePhoto={values.profilePhoto}
                      businessId={businessAccountInfo?.business_id}
                    />
                  </>
                );
              }}
            </Formik>
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
            <ProductGrid />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default Home;
