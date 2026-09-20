import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import SelectButtonField from "../../../components/SelectButtonField";
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
}> = ({ values, onFilterChange, setOpenCategoryModal, categories }) => {
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
    (values.categories?.length ?? 0) > 0 || Boolean(values.offer);

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
    // Mobile drops free-text search and the "En promoción" checkbox in favor
    // of a scrollable category chip row (per Figma's mobile frame — the
    // dropdown/checkbox filter UI is tablet+ only).
    return (
      <CategoryFilterChips
        values={values}
        onFilterChange={onFilterChange}
        categories={categories}
      />
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
            <FormControlLabel
              sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
              control={
                <Checkbox
                  checked={values.offer}
                  onChange={(e) => onFilterChange({ offer: e.target.checked })}
                  color="primary"
                />
              }
              label="En promoción"
            />
          </Box>
        )}
      </Box>
    );
  } else {
    return (
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={6}>
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
        </Grid>
        <Grid item xs={12} md={4}>
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
        </Grid>
        <Grid
          item
          xs={12}
          md={2}
          data-testid="promotion-filter-container"
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
          <FormControlLabel
            sx={{ whiteSpace: "nowrap" }}
            control={
              <Checkbox
                checked={values.offer}
                onChange={(e) => onFilterChange({ offer: e.target.checked })}
                color="primary"
              />
            }
            label="En promoción"
          />
        </Grid>
      </Grid>
    );
  }
};

export default FilterSection;
