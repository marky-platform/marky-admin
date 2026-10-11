# Code review follow-ups — 2026-10-11

Source: `/code-review medium` run on branch `updates-11-10-26` (whole branch vs `main`, not just the dark-mode commits). None of these are dark-mode related. The findings are the reviewer's claims; **none were verified by hand yet**, so reproduce each before fixing.

## Already fixed (commit "fix(product): stop logging tokens, leave editor on failed load, guard setFieldValue edits")
- `src/pages/Login.tsx:37` — `console.log` of the login response printed the access and refresh tokens. Removed.
- `src/pages/product/ProductFormPage.tsx` — debug `console.log` of form values/FormData on every render and submit. Removed.
- `src/pages/product/ProductFormPage.tsx:~489` — a failed `getProductById` rendered a blank form bound to the real product id (Publicar would PATCH empty values). Now toasts and redirects to `/home`.
- `src/pages/product/ProductFormPage.tsx:~307` — unsaved-changes guard only tracked DOM `change` events. Now also uses Formik `dirty`. (Positive case, a `setFieldValue` edit then back arrow, still to be tried by hand.)

## Open

### 1. Category promotion dates shift on every edit (timezone)
- Files: `src/components/CategoryPromotionModal.tsx:~163`, `src/pages/home/components/categoryAdminModalScreens/Promotion.tsx:~174-177, ~221`
- Problem: the UTC ISO string from the backend is split on `T` and submitted back as a timezone-less local string, so the stored instant moves by the UTC offset on each save.
- Scenario: backend returns `promotion_starts_at='2026-10-12T03:00:00Z'`. In UTC-3 the modal shows 03:00 instead of 00:00. Saving unchanged sends `'2026-10-12T03:00'`, which the server interprets in its own timezone.
- Fix idea: reuse `splitIsoDateTime` / `toIsoDateTime` from `src/utils/promotionForm.ts` (its header comment documents this exact bug), as the product forms already do.

### 2. `toIsoDateTime` throws on an invalid date
- File: `src/utils/promotionForm.ts:~34`
- Problem: `new Date(...).toISOString()` throws `RangeError` for an Invalid Date; the non-empty check does not guard it.
- Scenario: a partially typed or mangled date/time (year `0002`, malformed manual input) when pressing Publicar throws inside Formik `onSubmit`, no toast, `setSubmitting(false)` never runs, form stuck submitting.
- Fix idea: validate `isNaN(date.getTime())` and return `""`/surface a field error.

### 3. Any refresh failure logs the user out; stale `user` snapshot written back
- File: `src/services/axiosConfig.ts:~122` (`refreshAccessToken`)
- Problem: a network drop, timeout or 5xx on the refresh call goes through `clearSession()` and shows "Tu sesión expiró", not only an invalid/expired refresh token. It also writes back a `user` snapshot taken before the `await`.
- Scenarios: (a) access token expires during a connection blip: valid refresh token, user logged out and query cache wiped. (b) `updateUserConfiguration` or another `setSession` runs during the in-flight refresh and the stale `user` restores e.g. `has_configuration=false`. (c) refresh completes after a manual logout and silently re-authenticates the tab.
- Fix idea: only clear on 400/401 from the refresh endpoint; re-read the store after the await; drop the result if the session was cleared meanwhile.

### 4. Session-expired toast never re-arms; 401s on mutations are silent
- File: `src/services/axiosConfig.ts:~49` (`sessionExpiredNotified`), `src/hooks/useApiMutation.ts` (`error?.status !== 401`)
- Problem: the flag is reset only in `Logout.tsx`. After expiry the user logs in again via Login (not /logout), so the flag stays true and later expirations show nothing. `useApiMutation` also suppresses its toast on 401, so those failures give no feedback. A 401 on an already-retried request (`_retry`) reaches the mapper with no notification either.
- Fix idea: reset the flag on successful login/`setSession`; show a toast for a 401 that was not already notified.

### 5. Non-JSON error bodies shown verbatim as the toast
- File: `src/services/errorMapper.ts:~55` (`extractFirstNestedError`)
- Problem: returns any top-level string, so an HTML 413/502/504 page from nginx/a proxy becomes the toast message and goes into `errors`.
- Scenario: a large video upload hits the proxy body limit; user sees raw markup instead of "Ha ocurrido un error".
- Fix idea: if `typeof data === "string"` and it looks like HTML (or is longer than a sane limit), use the fallback message.

### 6. Promotion countdown coalescing guard drops boundaries
- File: `src/hooks/usePromotionCountdown.ts:~56`
- Problem: the module-level 2s coalescing guard skips invalidations for distinct boundaries, yet `firedBoundaryRef` is set true even when the call was skipped or the refetch still returned the old status.
- Scenario: product A's promo ends 12:00:00, B's at 12:00:01. B's invalidation is skipped but marked fired; B's card stays "active" with the discounted price and a null countdown until a manual refresh. Same under client clock skew when the server still says "active" after the refetch.
- Fix idea: set the fired flag only when the invalidation really ran; schedule a trailing invalidation instead of dropping.

### 7. Mutations bypass `useApiMutation` (project convention)
- Files: `src/hooks/useUpdateProductPromotion.ts:~17`, `useDeleteProduct`, `useDuplicateProduct`, `useUpdateProductCategoryOrder`, and others (grep `useMutation(` outside `useApiMutation.ts`)
- Problem: `CLAUDE.md` says all mutations go through `useApiMutation`. These re-implement toasts by hand.
- Effects: `useUpdateProductCategoryOrder` has no error toast (failed reorder is silent); `useUpdateProductPromotion` and `useDeleteProduct` add a generic error toast on top of the session-expired one; `useDeleteProduct` never invalidates `productCategoriesWithProducts` after success (cache purely optimistic).
- Fix idea: migrate each to `useApiMutation` with `successMessage`/`errorMessage` and add the missing invalidations.

## Suggested order
1 (data correctness) → 3 and 4 (auth UX, fix together) → 2 → 7 → 5 → 6.
