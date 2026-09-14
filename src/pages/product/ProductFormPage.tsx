import { Box, useMediaQuery, useTheme } from "@mui/material";
import { AxiosProgressEvent } from "axios";
import {
  Form,
  Formik,
  FormikHelpers,
  FormikProps,
  setNestedObjectValues,
} from "formik";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
  useLocation,
  // unstable hook used to block in-app navigation when the form is dirty.
  // This exists in react-router v6 as an unstable API and is commonly
  // re-exported by react-router-dom. We cast to any where necessary to
  // avoid type issues.
} from "react-router-dom";
import * as Yup from "yup";
import { Header } from "../../components/Header";
import {
  useCreateProduct,
  useUpdateProduct,
} from "../../hooks/useProductMutations";
import { ROUTES } from "../../routes/paths";
import { getProductById } from "../../services/productService";
import { Category } from "../../types/category";
import { Product } from "../../types/product";
import { objectToFormData } from "../../utils/formData";
import { buildDuplicatedProduct } from "../../utils/buildDuplicatedProduct";
import {
  splitIsoDateTime,
  buildProductPromotionFields,
} from "../../utils/promotionForm";
import { ShowNotification } from "../../utils/utils";
import AssignCategoryModal from "./components/AssignCategoryModal";
import CompleteYourProductList from "./components/CompleteYourProductList";
import ExtrasSection from "./components/ExtrasSection";
import HighlightSection from "./components/HighlightSection";
import PreviewPanel from "./components/PreviewPanel";
import ProductFormHeader from "./components/ProductFormHeader";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import LoadingSpinner from "../../components/LoadingSpinner";
import SectionErrorBoundary from "../../components/SectionErrorBoundary";
import {
  getSectionDisplayName,
  sectionHasError,
} from "./components/sectionNavState";
import SectionsNav from "./components/SectionsNav";
import useDeleteProduct from "../../hooks/useDeleteProduct";
import ProductSection from "./components/ProductSection";
import SubmitSection from "./components/SubmitSection";
import VariationsSection from "./components/VariationsSection";
import { ReactComponent as ProductoMenuIcon } from "../../assets/icons/product-form/producto-menu.svg";
import { ReactComponent as VariacionesMenuIcon } from "../../assets/icons/product-form/variaciones-menu.svg";
import { ReactComponent as AdicionalesProductoMenuIcon } from "../../assets/icons/product-form/adicionales-menu.svg";
import { ReactComponent as DestacarMenuIcon } from "../../assets/icons/product-form/destacar-menu.svg";

// unstable_useBlocker is exported from react-router (not react-router-dom) in
// some versions. Import it dynamically and cast to any to avoid type errors
// when typings are not present.
// NOTE: We intentionally avoid react-router's unstable useBlocker here
// because it's not available in all versions and caused runtime errors.
// We'll implement a local navigation guard (pendingNavigationRef +
// document click / popstate interception) instead.

const variantItemSchema = Yup.object().shape({
  name: Yup.string()
    .max(32, "El nombre de la presentación no puede superar los 32 caracteres")
    .required("El nombre de la presentación es requerido"),
  description: Yup.string()
    .max(32, "La descripción no puede superar los 32 caracteres")
    .required("La descripción de la presentación es requerida"),
  image: Yup.mixed().required("La imagen de la presentación es requerida"),
  price: Yup.number()
    .required("El precio es requerido")
    .positive("El precio debe ser un número positivo"),
});

const addonItemSchema = Yup.object().shape({
  name: Yup.string().required("El nombre del adicional es requerido"),
  price: Yup.number()
    .required("El precio es requerido")
    .positive("El precio debe ser un número positivo"),
});

// variants/addons are only validated when their section is toggled on.
// Built as a function (instead of a static schema) so the "Variaciones"/
// "Adicionales o extras" sub-schemas can be swapped in/out based on the
// multiPresentation/showExtras toggles — which live in plain component
// state, not as Formik fields — without leftover/invalid rows in a
// disabled section blocking publish or flagging that section as incomplete.
const buildValidationSchema = (
  multiPresentation: boolean,
  showExtras: boolean,
) =>
  Yup.object().shape({
    name: Yup.string().required("El nombre del producto es requerido"),
    description: Yup.string()
      .max(300, "La descripción no puede superar los 300 caracteres")
      .required("La descripción es requerida"),
    price: Yup.number()
      .required("El precio es requerido")
      .positive("El precio debe ser un número positivo"),
    // Category is optional: the backend allows products without a category
    // (ForeignKey is null=True/blank=True), so requiring it here used to
    // block saving a brand-new product before the user had a chance to
    // assign one from the "Producto" tab.
    category: Yup.number().nullable(),
    // Rows soft-deleted via the section's Delete button (see
    // VariationsSection/ExtrasSection) are skipped: they no longer need to
    // satisfy the item schema (e.g. a row the user blanked out before
    // deleting it), since they're removed rather than saved.
    variants: multiPresentation
      ? Yup.array().of(
          Yup.lazy((v: any) => (v?._delete ? Yup.object() : variantItemSchema)),
        )
      : Yup.array(),
    addons: showExtras
      ? Yup.array().of(
          Yup.lazy((a: any) => (a?._delete ? Yup.object() : addonItemSchema)),
        )
      : Yup.array(),
    stopper: Yup.string(),
    isPromotionActive: Yup.boolean(),
    promotionOption: Yup.string().when("isPromotionActive", {
      is: true,
      then: (schema) => schema.required("Debes seleccionar Descuento u Oferta"),
      otherwise: (schema) => schema.notRequired(),
    }),
    discountPercentage: Yup.number()
      .min(0)
      .max(100)
      // Gated on isPromotionActive too (not just promotionOption):
      // otherwise a stale "descuento" left over from before the switch was
      // turned off keeps this required forever, even though the field is
      // hidden and the switch being off should lift the requirement.
      .when(["isPromotionActive", "promotionOption"], {
        is: (isPromotionActive: boolean, promotionOption: string) =>
          isPromotionActive && promotionOption === "descuento",
        then: (schema) => schema.required("Debe ingresar un porcentaje"),
        otherwise: (schema) => schema.notRequired(),
      }),
    multibuyOption: Yup.string()
      .nullable()
      .when(["isPromotionActive", "promotionOption"], {
        is: (isPromotionActive: boolean, promotionOption: string) =>
          isPromotionActive && promotionOption === "oferta",
        then: (schema) =>
          schema.required("Debe seleccionar una opción de oferta"),
        otherwise: (schema) => schema.notRequired(),
      }),
    countdownActive: Yup.boolean(),
    promotionStartDate: Yup.string().when("countdownActive", {
      is: true,
      then: (schema) => schema.required("La fecha de inicio es requerida"),
      otherwise: (schema) => schema.nullable(),
    }),
    promotionStartTime: Yup.string().when("countdownActive", {
      is: true,
      then: (schema) => schema.required("La hora de inicio es requerida"),
      otherwise: (schema) => schema.nullable(),
    }),
    promotionEndDate: Yup.string().when("countdownActive", {
      is: true,
      then: (schema) => schema.required("La fecha de fin es requerida"),
      otherwise: (schema) => schema.nullable(),
    }),
    promotionEndTime: Yup.string().when("countdownActive", {
      is: true,
      then: (schema) => schema.required("La hora de fin es requerida"),
      otherwise: (schema) => schema.nullable(),
    }),
  });

const parseDateTime = splitIsoDateTime;

// Turns a Formik row list (variants or addons) into the nested payload the
// backend's ProductInputSerializer expects: rows soft-deleted via the
// section's Delete button become a { id, _delete: true } tombstone (dropped
// entirely if never persisted, since there's nothing on the server to
// delete); everything else is sent as-is minus the internal `_delete` flag.
// `mapRow` lets callers post-process a kept row (e.g. the variant image
// special-casing).
const buildNestedItemsPayload = (
  rows: any[] | undefined,
  mapRow: (row: any) => any = (row) => row,
) =>
  (rows ?? []).reduce((acc: any[], row: any) => {
    if (row?._delete) {
      if (row.id) acc.push({ id: row.id, _delete: true });
      return acc;
    }
    const { _delete, ...rest } = row ?? {};
    acc.push(mapRow(rest));
    return acc;
  }, []);

// Maps a `?section=` deep-link query value (used by notification links) to
// the side-nav section name it should preselect.
const SECTION_SLUGS: Record<string, string> = {
  destacar: "Destacar producto",
};

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedSection, setSelectedSection] = useState("Producto");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const deleteMutation = useDeleteProduct();
  const isDeleting = deleteMutation.isPending;

  // True while we're fetching an existing product's data for the edit flow.
  // Keeps the page from rendering the blank/"create new product" Formik
  // state for a split second before the real data arrives.
  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(!!id);

  // "Activar multi presentaciones" / "Activar productos adicionales" toggles.
  // These live here (instead of as local useState inside VariationsSection /
  // ExtrasSection) so they survive tab switches: switching tabs unmounts the
  // previously selected section component, which would otherwise reset any
  // local state back to its default value on every remount.
  const [multiPresentation, setMultiPresentation] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  // Only decorate the side-nav with red error indicators after the user has
  // tried to publish at least once — otherwise a brand-new, untouched form
  // would show every required section as "incomplete" on first render.
  const [hasAttemptedPublish, setHasAttemptedPublish] = useState(false);

  // Rebuilt only when multiPresentation/showExtras actually change, so
  // Formik's validationSchema prop keeps a stable identity across renders
  // that don't affect validation (e.g. typing in an unrelated field).
  const validationSchema = useMemo(
    () => buildValidationSchema(multiPresentation, showExtras),
    [multiPresentation, showExtras],
  );

  const isSaving =
    createProductMutation.isPending || updateProductMutation.isPending;
  // Percentage of the create/update request's body uploaded so far (mostly
  // meaningful when the product carries a video). null = no upload in flight.
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const handleUploadProgress = (progressEvent: AxiosProgressEvent) => {
    if (progressEvent.total) {
      setUploadProgress(
        Math.round((progressEvent.loaded * 100) / progressEvent.total),
      );
    }
  };

  const [initialValues, setInitialValues] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    category: null,
    is_active: true,
    is_available: true,
    variants: [],
    addons: [],
    stopper: "",
    isPromotionActive: false,
    promotionOption: "",
    discountPercentage: 0,
    multibuyOption: "",
    countdownActive: false,
    promotionStartDate: "",
    promotionStartTime: "",
    promotionEndDate: "",
    promotionEndTime: "",
    media: [],
  });

  const formikRef = useRef<FormikProps<Product>>(null);
  const location = useLocation();
  // track a lightweight "dirty" flag for the page. We'll set this to true
  // whenever the form DOM changes (via <Form onChange>), and reset on
  // successful submit. This is intentionally simple and covers the common
  // cases (input changes, selects, file inputs triggering change events).
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Dialog state for the "leave with unsaved changes" confirmation.
  const [openExitDialog, setOpenExitDialog] = useState(false);

  // pendingNavigationRef holds a function that, when executed, performs the
  // navigation the user attempted (clicking a link, navigating programmatically,
  // or using the back button). We set it when we intercept a navigation and
  // call it if the user confirms they want to leave.
  const pendingNavigationRef = useRef<(() => void) | null>(null);

  // Attempt a navigation action; if the form is dirty, store the action and
  // show the confirmation dialog. Otherwise execute immediately.
  const attemptNavigate = (action: () => void) => {
    if (isFormDirty) {
      pendingNavigationRef.current = action;
      setOpenExitDialog(true);
    } else {
      action();
    }
  };

  // Preselect a side-nav section when arriving via a deep link (e.g. from a
  // notification pointing at "?section=destacar"). Runs once on mount.
  useEffect(() => {
    const sectionSlug = new URLSearchParams(location.search).get("section");
    const sectionName = sectionSlug ? SECTION_SLUGS[sectionSlug] : undefined;
    if (sectionName) {
      setSelectedSection(sectionName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (id) {
      setIsLoadingProduct(true);
      const fetchProduct = async () => {
        try {
          const product = await getProductById(Number(id));
          const {
            promotionStartDate: promotionStartsAt,
            promotionEndDate: promotionEndsAt,
            multibuyOption,
            discountPercentage,
            promotionStatus,
          } = product;

          const { date: promotionStartDate, time: promotionStartTime } =
            parseDateTime(promotionStartsAt);
          const { date: promotionEndDate, time: promotionEndTime } =
            parseDateTime(promotionEndsAt);

          // Keep the switch ON whenever a promo is configured, even if it
          // has already expired (kept as history — see the "ya finalizó"
          // notice below) — otherwise it silently flips off and misleadingly
          // reads as "nothing configured". promotionStatus (derived
          // server-side) is the reliable source; fall back to the raw
          // fields only if it's missing (e.g. stale cached data).
          const isPromotionActive = promotionStatus
            ? promotionStatus !== "inactive"
            : !!multibuyOption ||
              (!!discountPercentage && Number(discountPercentage) > 0);
          const promotionOption = multibuyOption
            ? "oferta"
            : discountPercentage
              ? "descuento"
              : "";
          const { category, ...productTemp } = product;
          //
          const mappedMedia =
            product.media?.map((m: any) => ({
              id: m.id,
              file: m.file, // keep URL string, not File
              originalFile: m.file,
              media_type: m.media_type,
              product: m.product,
              order: m.order,
              _delete: false,
            })) ?? [];

          const mappedVariants =
            product.variants?.map((v: any) => ({
              id: v.id,
              name: v.name,
              price: Number(v.price),
              description: v.description,
              image: v.image, // URL string for existing
            })) ?? [];
          const mappedAddons =
            product.addons?.map((a: any) => ({
              id: a.id,
              name: a.name,
              price: Number(a.price),
            })) ?? [];
          //
          const initialValues: Product = {
            ...productTemp,
            // map backend availability to both fields for compatibility
            is_available:
              (product as any).is_available ?? productTemp.is_active,
            //
            media: mappedMedia,
            variants: mappedVariants,
            addons: mappedAddons,
            //
            // Yup's `stopper`/`discountPercentage` schemas aren't `.nullable()`
            // (mirrors every other "no value" field in this form using ""/0
            // as its empty sentinel, e.g. promotionOption/multibuyOption) —
            // the backend can send either field as a literal `null` when
            // unset, which Yup then rejects with "cannot be null" and blocks
            // Publish even though nothing on the form actually changed.
            stopper: productTemp.stopper ?? "",
            isPromotionActive,
            promotionOption,
            multibuyOption: multibuyOption,
            discountPercentage: discountPercentage ?? 0,
            countdownActive: !!promotionStartsAt,
            promotionStartDate,
            promotionStartTime,
            promotionEndDate,
            promotionEndTime,
            //@ts-ignore
            category: product.category?.id,
          };
          setInitialValues(initialValues);
          setMultiPresentation(mappedVariants.length > 0);
          setShowExtras(mappedAddons.length > 0);
          if (product.category) {
            setSelectedCategory({
              id: product.category.id,
              label: product.category.name,
              name: product.category.name,
              order: 0,
            });
          }
        } catch (error) {
          console.error("Failed to fetch product", error);
        } finally {
          setIsLoadingProduct(false);
        }
      };
      fetchProduct();
    }
    // if there's a duplicated product passed via navigation state (create from duplicate)
    if (!id && (location.state as any)?.duplicatedProduct) {
      const dp = (location.state as any).duplicatedProduct as Product;
      setInitialValues(dp);
      setMultiPresentation((dp.variants?.length ?? 0) > 0);
      setShowExtras((dp.addons?.length ?? 0) > 0);
      if (dp.category) {
        // dp.category may be a number or an object; normalize to id
        const categoryId =
          typeof dp.category === "object"
            ? (dp.category as any).id
            : (dp.category as unknown as number);
        if (categoryId) {
          setSelectedCategory({
            id: categoryId,
            label: "",
            name: "",
            order: 0,
          });
        }
      }
    }
    // if a category was passed via navigation state (create from a category's
    // "Añadir producto" action on Home), preselect it in the form
    if (!id && (location.state as any)?.preselectedCategory) {
      const cat = (location.state as any).preselectedCategory as {
        id: number;
        name: string;
      };
      setSelectedCategory({
        id: cat.id,
        label: cat.name,
        name: cat.name,
        order: 0,
      });
      setInitialValues((prev) => {
        const updated: Product = {
          ...prev,
          //@ts-ignore
          category: cat.id,
        };
        return updated;
      });
    }
    // location.state is intentionally omitted: this effect must only run when
    // `id` changes. The duplicate-product/preselected-category state is read
    // once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Reset dirty state when initial values are loaded/changed (e.g. after
  // fetching existing product or duplicating). This prevents showing the
  // prompt immediately after the form is initialized.
  useEffect(() => {
    setIsFormDirty(false);
  }, [initialValues]);

  // We handle in-app navigation prompts by using attemptNavigate helper
  // below which sets pendingNavigationRef and opens the dialog when the
  // form is dirty. No unstable react-router hooks required.

  // Browser-level refresh / tab close: show native confirmation when dirty.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isFormDirty) return;
      // Standard way to trigger browser confirmation dialog
      e.preventDefault();
      // Some browsers require setting returnValue to a non-empty string
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isFormDirty]);

  const handleSectionSelect = (sectionName: string) => {
    setSelectedSection(sectionName);
  };

  const sections = [
    {
      name: "Producto",
      icon: <ProductoMenuIcon />,
      component: (props: any) => (
        <ProductSection
          formik={props}
          onOpenModal={() => setIsModalOpen(true)}
          selectedCategory={selectedCategory}
          uploadProgress={uploadProgress}
          isSaving={isSaving}
        />
      ),
    },
    {
      name: "Variaciones",
      icon: <VariacionesMenuIcon />,
      component: (props: any) => (
        <VariationsSection
          {...props}
          multiPresentation={multiPresentation}
          onMultiPresentationChange={setMultiPresentation}
        />
      ),
    },
    {
      name: "Adicionales o extras",
      icon: <AdicionalesProductoMenuIcon />,
      component: (props: any) => (
        <ExtrasSection
          {...props}
          showExtras={showExtras}
          onShowExtrasChange={setShowExtras}
        />
      ),
    },
    {
      name: "Destacar producto",
      icon: <DestacarMenuIcon />,
      component: (props: any) => <HighlightSection {...props} />,
    },
  ];

  const selectedComponent = sections.find(
    (section) => section.name === selectedSection,
  )?.component;

  // Validates every section (without submitting) so we can block "Publicar"
  // and point the user at exactly which sections are incomplete, instead of
  // relying on Formik's default submit-then-block behavior which has no
  // concept of the side-nav sections.
  const handlePublishClick = () => {
    const formik = formikRef.current;
    if (!formik) return;

    formik.validateForm().then((errors) => {
      setHasAttemptedPublish(true);
      const hasErrors = Object.keys(errors).length > 0;

      if (hasErrors) {
        // Mark every field touched (the same thing Formik's own submit flow
        // does internally) so field-level red states show immediately once
        // the user lands on an errored section, without requiring them to
        // blur each field first.
        formik.setTouched(setNestedObjectValues(formik.values, true));
        ShowNotification({
          message:
            "Completa los campos obligatorios pendientes para poder publicar el producto",
          type: "error",
        });
        const firstErroredSection = sections.find((section) =>
          sectionHasError(section.name, errors),
        );
        if (firstErroredSection) {
          handleSectionSelect(firstErroredSection.name);
        }
      } else {
        formik.submitForm();
      }
    });
  };

  // While we're fetching an existing product (edit flow), avoid rendering
  // the Formik form with its blank/"create new product" defaults — that
  // briefly flashes an empty form before the real data replaces it. Show a
  // loading state instead until the fetch finishes.
  if (isLoadingProduct) {
    return (
      <>
        <Header />
        <LoadingSpinner fullScreen message="Cargando producto..." />
      </>
    );
  }

  return (
    <Formik
      innerRef={formikRef}
      initialValues={initialValues}
      enableReinitialize
      validateOnMount
      validationSchema={validationSchema}
      onSubmit={async (
        values: Product,
        { setSubmitting }: FormikHelpers<Product>,
      ) => {
        // Guard against duplicate submissions: the "Publicar" button click
        // doesn't disable instantly, so a user impatiently double/triple
        // clicking while waiting for the request to resolve could otherwise
        // fire this handler (and the create/update mutation) more than
        // once, creating duplicate products.
        if (isSaving) {
          setSubmitting(false);
          return;
        }
        console.log("submitting.....", values);

        // 1) Basic cleaned copy (map category to id if object)
        const submissionValues: any = {
          ...values,
          media: values.media?.map((item: any) => {
            if (item.isNew) {
              const { id, ...rest } = item; // remove temporary id for new files
              return rest;
            }
            return item; // existing items keep id
          }),
          category:
            values.category && typeof values.category === "object"
              ? ((values.category as any).id ?? null)
              : (values.category ?? null),
        };

        // Only touch promo fields when the "Destacar producto" section was
        // actually edited (see buildProductPromotionFields). Editing is
        // only meaningful once a product exists (id) — for a brand-new
        // product there's no prior promo to preserve, so always include
        // them. Without this gate, saving an unrelated field (e.g. price)
        // would unconditionally overwrite any promo configured via the
        // quick modal with these defaults.
        Object.assign(
          submissionValues,
          buildProductPromotionFields(values, initialValues, !!id),
        );

        // 2) Prevent duplicate camelCase + snake_case fields being sent:
        //    remove camelCase variants so objectToFormData only sees snake_case keys.
        delete submissionValues.multibuyOption;
        delete submissionValues.discountPercentage;
        delete submissionValues.promotionStartDate;
        delete submissionValues.promotionEndDate;
        delete submissionValues.promotionStartTime;
        delete submissionValues.promotionEndTime;
        delete submissionValues.isPromotionActive;
        delete submissionValues.promotionOption;
        delete submissionValues.countdownActive;
        delete submissionValues.promotionStatus;

        // 4) Variants/addons: rows soft-deleted in the section UI (see
        //    VariationsSection/ExtrasSection) become a { id, _delete: true }
        //    tombstone so the backend actually removes them — a persisted
        //    row that's just missing from the array is otherwise left
        //    untouched by the backend's nested-write logic. Rows that were
        //    never saved are dropped outright instead of being sent as a
        //    tombstone (there's nothing on the server to delete). Skipped
        //    entirely when the section is toggled off — that case is fully
        //    handled below (every persisted row gets tombstoned instead).
        if (multiPresentation && Array.isArray(submissionValues.variants)) {
          submissionValues.variants = buildNestedItemsPayload(
            submissionValues.variants,
            (v: any) => {
              // only include `image` if it's an actual File/Blob; if it's a
              // URL string (existing image, unchanged), drop it so the
              // backend doesn't try to re-save a string into an ImageField.
              const { image, ...rest } = v;
              if (image instanceof File || image instanceof Blob) {
                return { ...rest, image };
              }
              return rest;
            },
          );
        }
        if (showExtras && Array.isArray(submissionValues.addons)) {
          submissionValues.addons = buildNestedItemsPayload(
            submissionValues.addons,
          );
        }

        // Variaciones/Adicionales toggled off = every persisted row in that
        // section gets tombstoned (a fresh product, or one where the section
        // was never turned on, has no ids and this is a no-op). Without
        // this, a variant/addon row left over from before the user disabled
        // the toggle (which the UI no longer renders, so the user has no
        // way to fix it) would keep living on the product untouched.
        if (!multiPresentation) {
          submissionValues.variants = (values.variants ?? [])
            .filter((v: any) => v.id)
            .map((v: any) => ({ id: v.id, _delete: true }));
        }
        if (!showExtras) {
          submissionValues.addons = (values.addons ?? [])
            .filter((a: any) => a.id)
            .map((a: any) => ({ id: a.id, _delete: true }));
        }

        // 5) Media: keep objects but allow _delete, keep id for existing, send file for File objects
        if (Array.isArray(submissionValues.media)) {
          submissionValues.media = submissionValues.media
            .map((m: any) => {
              // if marked for deletion and has id, keep { id, _delete: true }
              if (m && m._delete && m.id) {
                return { id: m.id, _delete: true };
              }
              // if File => send it (optionally keep id to indicate replacement)
              if (m && (m.file instanceof File || m.file instanceof Blob)) {
                return {
                  ...(m.id ? { id: m.id } : {}),
                  file: m.file,
                  media_type: m.media_type,
                  order: typeof m.order !== "undefined" ? m.order : null,
                };
              }
              // if existing media (url + id) and not deleted, send only id to be explicit
              if (m && m.id) {
                return {
                  id: m.id,
                  media_type: m.media_type,
                  order: m.order ?? null,
                };
              }
              // otherwise ignore
              return null;
            })
            .filter(Boolean);
        }

        console.log("submissionValues (clean):", submissionValues);

        // 6) build FormData using the improved helper
        const formData = objectToFormData(submissionValues);

        // debug helper: iterate and show formData entries in console
        // (use only in dev)
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-restricted-syntax
          for (const pair of (formData as any).entries()) {
            console.log("FormData entry:", pair[0], pair[1]);
          }
        }

        // 7) submit using your existing mutations
        const handleSuccess = () => {
          setSubmitting(false);
          setUploadProgress(null);
          // clear dirty flag after successful submit
          setIsFormDirty(false);
          navigate(ROUTES.HOME);
        };
        const handleError = () => {
          setSubmitting(false);
          setUploadProgress(null);
        };

        setUploadProgress(0);
        if (id) {
          updateProductMutation.mutate(
            {
              id: Number(id),
              product: formData,
              onUploadProgress: handleUploadProgress,
            },
            { onSuccess: handleSuccess, onError: handleError },
          );
        } else {
          createProductMutation.mutate(
            { formData, onUploadProgress: handleUploadProgress },
            { onSuccess: handleSuccess, onError: handleError },
          );
        }
      }}
    >
      {(formikProps: FormikProps<Product>) => {
        console.log("Formik values:", formikProps.values);
        console.log("Formik errors:", formikProps.errors);
        // Whether each section currently has active content — drives the
        // Secciones nav's green/empty distinction (see sectionNavState.ts).
        // "Producto" is always mandatory so its flag is unused by the state
        // function but included for a complete map.
        const activationFlags: Record<string, boolean> = {
          Producto: true,
          Variaciones: multiPresentation,
          "Adicionales o extras": showExtras,
          "Destacar producto":
            !!formikProps.values.stopper ||
            !!formikProps.values.isPromotionActive ||
            !!formikProps.values.countdownActive,
        };
        // On mobile, viewing a non-"Producto" section replaces the whole
        // body with just that section, full-screen; its own back caret
        // returns to "Producto" instead of exiting the form.
        const isMobileSectionScreen =
          isMobile && selectedSection !== "Producto";
        return (
          <>
            <Header />
            <Form
              // Capture DOM change events to set the dirty flag. This is a
              // simple heuristic that works for most input types. We also
              // mark the form pristine when Formik reports not dirty.
              onChange={() => {
                // If Formik says the form is dirty, trust it; otherwise set
                // based on DOM changes.
                if (!formikProps.dirty) {
                  setIsFormDirty(true);
                }
              }}
            >
              <AssignCategoryModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedCategory={selectedCategory}
                onSelectCategory={(category: Category | null) => {
                  // Update local selected category and formik field only when
                  // the user confirms the selection via the modal button.
                  setSelectedCategory(category);
                  formikProps.setFieldValue(
                    "category",
                    category ? category.id : null,
                  );
                  setIsModalOpen(false);
                }}
              />
              {/* Exit confirmation dialog (unsaved changes) */}
              <ConfirmationDialog
                open={Boolean(openExitDialog)}
                title={"Salir sin guardar"}
                content={
                  "Tienes cambios sin guardar. ¿Estás seguro que quieres salir y perder los cambios?"
                }
                onClose={() => {
                  setOpenExitDialog(false);
                  pendingNavigationRef.current = null;
                }}
                onConfirm={() => {
                  setOpenExitDialog(false);
                  setIsFormDirty(false);
                  const next = pendingNavigationRef.current;
                  pendingNavigationRef.current = null;
                  try {
                    if (next) next();
                  } catch (e) {
                    // as a last resort try history.back()
                    try {
                      window.history.back();
                    } catch (_e) {
                      // ignore
                    }
                  }
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <ProductFormHeader
                  formik={formikProps}
                  title={
                    isMobile
                      ? getSectionDisplayName(selectedSection)
                      : undefined
                  }
                  onDeleteClick={() => setOpenDeleteDialog(true)}
                  onDuplicateClick={() => {
                    const duplicated = buildDuplicatedProduct(
                      formikProps.values as Product,
                    );

                    attemptNavigate(() =>
                      navigate(ROUTES.PRODUCT_CREATE, {
                        state: { duplicatedProduct: duplicated },
                      }),
                    );
                  }}
                  onBack={
                    isMobileSectionScreen
                      ? () => setSelectedSection("Producto")
                      : () => attemptNavigate(() => navigate(-1))
                  }
                />
                {/*  */}
                <Box sx={{ display: "flex" }}>
                  {!isMobile && (
                    <SectionsNav
                      sections={sections}
                      selectedSection={selectedSection}
                      formikErrors={formikProps.errors}
                      activationFlags={activationFlags}
                      hasAttemptedPublish={hasAttemptedPublish}
                      onSelect={handleSectionSelect}
                    />
                  )}
                  <Box
                    component="main"
                    sx={{
                      p: 3,
                      width: { xs: "100%", md: "auto" },
                      flex: { md: 1 },
                      minWidth: 0,
                      pb: 12, // Add padding to the bottom to avoid overlap with the submit section
                      mb: 12,
                    }}
                  >
                    <SectionErrorBoundary resetKey={selectedSection}>
                      {selectedComponent && selectedComponent(formikProps)}
                    </SectionErrorBoundary>
                    {isMobile && selectedSection === "Producto" && (
                      <CompleteYourProductList
                        sections={[
                          {
                            name: "Variaciones",
                            icon: <VariacionesMenuIcon />,
                            description:
                              "Agrega tamaños, sabores o presentaciones.",
                          },
                          {
                            name: "Adicionales o extras",
                            icon: <AdicionalesProductoMenuIcon />,
                            description:
                              "Extras que tus clientes pueden elegir.",
                          },
                          {
                            name: "Destacar producto",
                            icon: <DestacarMenuIcon />,
                            description:
                              "Marca este producto como favorito, recomendado o promoción.",
                          },
                        ]}
                        selectedSection={selectedSection}
                        formikErrors={formikProps.errors}
                        activationFlags={activationFlags}
                        hasAttemptedPublish={hasAttemptedPublish}
                        onSelect={handleSectionSelect}
                      />
                    )}
                  </Box>
                  {!isMobile && (
                    <PreviewPanel
                      section={selectedSection}
                      values={formikProps.values}
                      selectedCategory={selectedCategory}
                    />
                  )}
                  <SubmitSection
                    onPublish={handlePublishClick}
                    onCancel={() => attemptNavigate(() => navigate(-1))}
                    isSubmitting={isSaving}
                    uploadProgress={uploadProgress}
                    isDirty={formikProps.dirty}
                    isEditMode={!!id}
                    isMobile={isMobile}
                  />
                </Box>
              </Box>

              {/* confirmation dialog for deleting product */}
              <ConfirmationDialog
                open={Boolean(openDeleteDialog)}
                title="¿Estás seguro de eliminar este producto?"
                content="Esta acción eliminará permanentemente el producto."
                image={
                  formikProps.values.media?.find(
                    (m) => m.media_type === "image" && typeof m.file === "string",
                  )?.file as string | undefined
                }
                imageOverlay={
                  <ReportProblemIcon color="error" sx={{ fontSize: 28 }} />
                }
                confirmationCheckboxLabel="Confirmo que deseo eliminar el producto"
                confirmColor="error"
                confirmText="Eliminar"
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={() => {
                  if (id) {
                    deleteMutation.mutate(Number(id), {
                      onSuccess: () => setOpenDeleteDialog(false),
                      onError: () => setOpenDeleteDialog(false),
                    });
                    // keep dialog open while deleting; ConfirmationDialog will be disabled via isLoading
                  }
                }}
                isLoading={isDeleting}
              />
            </Form>
          </>
        );
      }}
    </Formik>
  );
};

export default ProductFormPage;
