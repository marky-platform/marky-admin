import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import CatalogFilterPills from "../../../components/CatalogFilterPills";
import CatalogViewToggle from "../../../components/CatalogViewToggle";
import SelectButtonField from "../../../components/SelectButtonField";
import { CatalogViewMode } from "../../../hooks/useCatalogViewMode";
import useDebounce from "../../../hooks/useDebounce";
import CategoryFilterChips from "./CategoryFilterChips";
import { Category } from "./CategoryFilterModal";

// Achata los campos de filtro (búsqueda y categorías) al alto pedido por diseño.
const filterFieldSx = { "& .MuiInputBase-input": { height: "1em" } };

// Create a separate component for the filters section
const FilterSection: React.FC<{
  values: any;
  onFilterChange: (newFilters: any) => void;
  setOpenCategoryModal: () => void;
  /** Injected category list (public catalog page); forwarded to
   * CategoryFilterChips on mobile instead of it fetching its own. */
  categories?: Category[];
  /** Selector mosaico/lista. Sin estos props no se muestra. */
  viewMode?: CatalogViewMode;
  onViewModeChange?: (mode: CatalogViewMode) => void;
  /** En mobile el selector vive en la barra de acciones del admin; la vista
   * pública (sin esa barra) lo muestra junto a las píldoras. */
  showViewToggleOnMobile?: boolean;
  /** Totales de Promociones/Destacados para las píldoras. */
  filterCounts?: { promotion?: number; featured?: number };
}> = ({
  values,
  onFilterChange,
  setOpenCategoryModal,
  categories,
  viewMode,
  onViewModeChange,
  showViewToggleOnMobile = false,
  filterCounts,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keep the raw keystrokes local to this component instead of pushing them
  // straight into the parent's (ProductGrid) state on every character. The
  // parent holds the full product/category list, so updating it on every
  // keystroke forced the whole grid to re-render each time the user typed,
  // which is what made the search field feel slow/janky. Only the debounced
  // value is propagated up, so the heavy grid re-renders once per pause in
  // typing instead of once per keystroke.
  const [searchTerm, setSearchTerm] = useState<string>(values.search ?? "");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters =
    (values.categories?.length ?? 0) > 0 ||
    Boolean(values.offer) ||
    Boolean(values.featured);

  const pills = (
    <CatalogFilterPills
      offer={Boolean(values.offer)}
      featured={Boolean(values.featured)}
      counts={filterCounts}
      onChange={onFilterChange}
    />
  );
  const viewToggle =
    viewMode && onViewModeChange ? (
      <CatalogViewToggle value={viewMode} onChange={onViewModeChange} />
    ) : null;

  // Keep local state in sync if the parent resets filters externally
  // (e.g. a "clear filters" action elsewhere).
  useEffect(() => {
    setSearchTerm(values.search ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.search]);

  useEffect(() => {
    if (debouncedSearchTerm !== values.search) {
      onFilterChange({ search: debouncedSearchTerm });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [values.search]);

  if (isMobile) {
    // Mobile drops free-text search and the category dropdown in favor of a
    // scrollable category chip row (per Figma's mobile frame). The
    // Todos/Promociones/Destacados pills sit in their own row below it.
    return (
      <Box>
        <CategoryFilterChips
          values={values}
          onFilterChange={onFilterChange}
          categories={categories}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            pt: 1,
            pb: 2,
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {pills}
          {showViewToggleOnMobile && viewToggle}
        </Box>
      </Box>
    );
  } else if (!isDesktop) {
    // Tablet (sm–md): search + a filter-toggle icon on one row (per Figma);
    // the icon shows/hides the category select + "En promoción" checkbox row
    // below it, and turns blue whenever a filter is actually applied so it
    // still reads as "on" when the row is collapsed.
    return (
      <Box display="flex" flexDirection="column" gap={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            inputRef={searchInputRef}
            placeholder="Buscar por texto o SKU del producto"
            name="search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            sx={filterFieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { paddingY: 1.5 },
            }}
          />
          <IconButton
            onClick={() => setShowFilters((prev) => !prev)}
            aria-label="Mostrar filtros"
            aria-pressed={showFilters}
            sx={{
              backgroundColor: hasActiveFilters ? "secondary.main" : "#EDEDED",
              color: hasActiveFilters ? "primary.main" : "action.active",
              borderRadius: 1,
              p: 3,
              flexShrink: 0,
            }}
          >
            <FilterListIcon />
          </IconButton>
          {viewToggle}
        </Box>
        {showFilters && (
          <Box display="flex" alignItems="center" gap={6}>
            <SelectButtonField
              placeholder="Categorías: Todas"
              displayText={
                values.categories?.length > 0
                  ? `Categorías: ${values.categories?.length} seleccionadas`
                  : undefined
              }
              onClick={setOpenCategoryModal}
              sx={{ flex: 1, ...filterFieldSx }}
            />
            {pills}
          </Box>
        )}
      </Box>
    );
  } else {
    // Una sola fila que envuelve (flex-wrap) si el ancho no alcanza, así
    // las píldoras y el selector nunca provocan scroll horizontal.
    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Box sx={{ flex: "2 1 220px", minWidth: 0 }}>
          <TextField
            inputRef={searchInputRef}
            placeholder="Buscar por nombre del producto"
            name="search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            sx={filterFieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { paddingY: 2 },
            }}
          />
        </Box>
        <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
          <SelectButtonField
            placeholder="Categorías: Todas"
            displayText={
              values.categories?.length > 0
                ? `Categorías: ${values.categories?.length} seleccionadas`
                : undefined
            }
            onClick={setOpenCategoryModal}
            sx={filterFieldSx}
          />
        </Box>
        <Box
          data-testid="promotion-filter-container"
          sx={{ display: "flex", alignItems: "center", gap: 4, ml: "auto" }}
        >
          {pills}
          {viewToggle}
        </Box>
      </Box>
    );
  }
};

export default FilterSection;
