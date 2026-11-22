# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Admin/merchant dashboard for **Marky**, a gastronomy platform where businesses manage their products, promotions, categories, and business profile. Frontend only — the backend is Django REST Framework (consumed, never modified here). UI copy and most code comments are in Spanish.

Bootstrapped with Create React App. React 18 + TypeScript 4.9 (strict mode), MUI 6.

## Commands

```bash
npm start              # dev server on http://localhost:3000 (uses .env.development → API at localhost:8000/api/v1)
npm run build          # production build to build/
npm test               # interactive Jest watch mode (react-scripts test)
npm test -- App.test   # run a single test file by name pattern
npm test -- --watchAll=false   # run all tests once, non-interactive
```

`npm run lint` runs ESLint (`react-app` config, `--max-warnings 0`); `npx tsc --noEmit` typechecks. CI (`.github/workflows/ci.yml`, Node 24, on PRs and pushes to `develop`/`main`) runs `npm ci`, lint, tsc, `npm test -- --watchAll=false --runInBand`, build and a non-blocking `npm audit --audit-level=high`. Secret scan config: `.gitleaks.toml`.

## Architecture

Data flows in one direction: **service (axios) → mapper → query/mutation hook → page/component**. Keep this layering; don't call `api` directly from components.

- **`src/services/`** — one file per backend domain (`productService`, `authService`, `businessService`, …). Each exports plain async functions that hit DRF endpoints and return `response.data`. `axiosConfig.ts` exports the shared `api` instance: it injects the Bearer token from `sessionStore`, sets `Accept-Language: es`, and on a 401 transparently refreshes via `/users/token/refresh/` and retries once (clearing the session and redirecting to `/login` on failure). `errorMapper.ts` normalizes every DRF error into `{ message, status, success, errors }`.

- **`src/mappers/`** — convert snake_case DRF payloads into camelCase frontend types. Note: some mapping currently lives inline in services (e.g. `mapProductToCamelCase` in `productService.ts`) as well as in `mappers/`. Backend sends snake_case; some types deliberately carry both (e.g. `is_active` and `multibuyOption`) during transition.

- **`src/hooks/`** — TanStack Query wrappers, one concern per file (`useProductCategoriesWithProducts`, `useCreateProductCategory`, …). Queries use `useQuery` with array query keys like `["productCategoriesWithProducts", params]`. **All mutations go through `useApiMutation`** (`hooks/useApiMutation.ts`), which wraps `useMutation` to auto-fire success/error toasts (`ShowNotification`) and accepts `successMessage`/`errorMessage`/`showSuccessNotification`. After a mutation, invalidate the relevant query key (e.g. `["productCategoriesWithProducts"]`) in `onSuccess`. The global `QueryClient` sets `retry: false`.

- **`src/stores/`** — Zustand. Only `sessionStore.ts` exists: holds `accessToken`/`refreshToken`/`user`, persisted to `localStorage` under key `session-storage` via the `persist` middleware. `user.has_configuration` drives routing (see below).

- **`src/routes/`** — `paths.ts` is the single source of route strings (`ROUTES`). `publicRoutes.ts` / `protectedRoutes.ts` are arrays of `{ path, component }`. `App.tsx` maps over both: unauthenticated users hitting a protected route → `/login`; authenticated users without `has_configuration` are forced to `/configuration` (first-time business setup) before anything else.

- **`src/pages/`** — route-level screens. Larger features are folders with co-located `components/` (`pages/home/`, `pages/product/`, `pages/account/`). Smaller pages are flat `.tsx` files (`Login.tsx`, `Register.tsx`, …).

- **`src/components/`** — shared/reusable UI (`ProductCard`, `Modal`, `ConfirmationDialog`, custom MUI-wrapped form inputs like `Input`, `CustomSelect`, `FormikPhoneInput`). Check here before building a new generic component.

- **`src/themes/`** — `light.ts`/`dark.ts` MUI themes via `CustomThemeProvider` (`ThemeContext.tsx`), toggled with the `useTheme()` hook. Prefer theme tokens/overrides over inline styles.

- **`src/contexts/LoadingContext.tsx`** — global loading-spinner provider wrapping the app.

## Conventions

- Functional components + hooks only. PascalCase components; camelCase hooks/utils/vars. TypeScript types, **not** PropTypes.
- Forms use **Formik + Yup**. File/image uploads (products, business logos) send `multipart/form-data` — build the body with `utils/formData.ts` (`objectToFormData`); image cropping flows through `react-easy-crop` + `useImageCropper`/`ImageCropModal`.
- Drag-and-drop ordering (category/product reorder) uses `@dnd-kit`.
- Keep business logic out of UI components — put it in hooks, services, or utils. Favor reuse over duplication.
- The backend domain language is snake_case; the frontend prefers camelCase — mappers are the boundary. When adding a field, check whether the corresponding type/mapper needs updating.

## Environment

- `.env.development` / `.env.production` define `REACT_APP_API_URL` and `REACT_APP_ENV`. Dev points at `http://localhost:8000/api/v1`. A local DRF backend must be running for the app to function.
