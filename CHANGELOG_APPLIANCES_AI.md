# Changelog — AI Interior Design + US Home Appliances (TV, AC)

## Fixed
- **Dependency conflict**: `backend/package.json` pinned `cloudinary@^2.4.0`, which conflicts with
  `multer-storage-cloudinary`'s peer dependency on cloudinary v1 — `npm install` failed outright.
  Pinned to `cloudinary@^1.41.3` (its `.v2` export is identical, so no code changes were needed).

## Added — Backend
- `Furniture` model: `itemType` ('furniture' | 'appliance', defaults to 'furniture' — backward compatible),
  flexible `specifications` key/value array, and US-appliance fields: `voltage` ('120V'/'240V'),
  `powerConsumptionWatts`, `energyRating` ('Energy Star Certified'/'Standard').
- `Category` model: `productType` ('furniture' | 'appliance') for grouping categories in the UI.
- `POST /api/ai/interior-design` — upload a room photo; Gemini vision analyzes room type, style, color
  palette, and layout tips, and suggests an appropriately-sized TV (inches) and/or AC (BTU) for the room.
  Cross-references your actual catalog (both furniture and appliances) for matching recommendations.
  Falls back gracefully with a clear message if `GEMINI_API_KEY` isn't configured.
- `GET /api/furniture?itemType=appliance` and `GET /api/categories?productType=appliance` filters.
- Seed data: "Televisions" and "Air Conditioners" categories, plus 3 sample appliances (55" 4K TV,
  12,000 BTU split AC, 8,000 BTU window AC) with realistic US specs.
- New test file `tests/appliances-and-ai.test.js` (schema validation, filter endpoints, AI endpoint
  guard clauses).

## Added — Mobile App (Flutter)
- `FurnitureModel`/`CategoryModel` extended with the new fields.
- New `features/ai_design/` module: room-photo capture (camera/gallery), AI analysis display (style,
  color swatches, layout tips, TV/AC sizing chips), and recommended-items carousels.
- Home screen: new "AI Interior Design" entry card; appliance category icons (TV, AC).
- Furniture details screen: Specifications section + voltage/energy-rating chips for appliances.
- Wired into `app_router.dart` at `/ai-interior-design`.

## Added — Admin Dashboard (React)
- `CategoriesPage.jsx`: `productType` selector, badge on category cards.
- `FurnitureFormPage.jsx`: Furniture/Appliance toggle, category dropdown filtered by item type,
  appliance-only fields (voltage, power consumption, energy rating), and a repeatable
  specifications key/value editor.

## Verification performed
- Backend: full syntax check on every file, full Express app boot with all 50 routes registered
  (including the new `/interior-design` route), direct Mongoose schema validation (appliance
  documents, defaults, invalid-voltage rejection) since the sandbox couldn't download the MongoDB
  test binary for the full Jest suite.
- Mobile: brace-balance check across all 43 Dart files, import-resolution check, provider-wiring
  check — all clean. Caught and fixed two real null-safety bugs (public nullable fields passed to
  non-nullable `Text()` without the `!` operator).
- Admin dashboard: real `vite build` (production compile of all 1,558 modules) and `eslint src` —
  both clean, zero errors/warnings.

---

# Changelog — AI Visual Search, AI Assistant, 360° View, New Logo

## Added — Backend
- `AIChat` model — one document per user holding a rolling chat history (capped at 20 messages)
  with the AI Shopping Assistant.
- `POST /api/ai/visual-search` (multipart: `photo`) — upload a photo of any single furniture/appliance
  item (spotted in a magazine, a friend's home, anywhere) and Gemini vision identifies its type, style,
  materials, and colors, then matches against the catalog via text search with a filtered-browse
  fallback. Distinct from `/interior-design`, which analyzes a whole room rather than one product.
- `POST /api/ai/chat` (`{ message }`) — conversational shopping assistant with short rolling history
  for context; replies in structured JSON and optionally surfaces matching catalog items when the
  user's message calls for recommendations. `GET /api/ai/chat/history` and `DELETE /api/ai/chat/history`
  round out the feature. Degrades to a clear fallback message if `GEMINI_API_KEY` isn't configured.
- New `visualSearchStorage` Cloudinary config + `uploadVisualSearchPhoto` middleware.
- New tests in `tests/appliances-and-ai.test.js` covering guard clauses for both new endpoints and a
  full offline round-trip of the chat endpoint (send → history → clear).

## Added — Mobile App (Flutter)
- **New app logo**: a sofa silhouette framed by AR viewfinder corner brackets, in the app's existing
  sage-green/oak palette (formalizes the existing brand colors rather than introducing new ones).
  Added as `assets/icon/app_icon.png` (+ a transparent-background `app_icon_foreground.png` for Android
  adaptive icons) and wired into `flutter_launcher_icons` config in `pubspec.yaml` — run
  `dart run flutter_launcher_icons` after `flutter pub get` (and after `flutter create .` if the
  `android`/`ios` platform folders don't exist yet in this checkout) to generate real launcher icons.
  New `AppLogo` widget (`core/widgets/app_logo.dart`) with white/sage variants; splash screen now uses
  it in place of the old placeholder `Icons.chair_alt_rounded`.
- **New `features/ai_visual_search/` module** — snap or upload a photo of any item, see the AI's
  read on its type/style/colors, and browse similar catalog matches. Wired at `/ai-visual-search`.
- **New `features/ai_chat/` module** — chat-bubble UI for the AI Shopping Assistant, with persisted
  history and inline product-suggestion carousels. Wired at `/ai-chat`.
- **New `features/product_360/` module** — a fast, camera-permission-free 360° turntable preview of a
  product's 3D model (`model_viewer_plus`, auto-rotate + drag + pinch-zoom), separate from the full-room
  AR placement flow. Reachable via a new icon button on the furniture details screen, wired at
  `/product-360`.
- **AR placement 360° discoverability**: the existing live-camera AR view already supported free
  rotation (`handleRotation: true`) but didn't surface it — added a "Twist with two fingers to rotate
  360°" hint chip that appears once an item is selected.
- Home screen: two new compact "AI hub" cards (Visual Search, AI Assistant) alongside the existing
  AI Interior Design hero card.
- New design tokens (`core/theme/app_tokens.dart` — `AppSpacing`, `AppRadii`) formalizing the spacing/
  radius values already in use across the app; adopted in the new screens and the home screen's new
  AI cards as a pattern for screens going forward.
- `pubspec.yaml`: added `model_viewer_plus` and `flutter_launcher_icons` dependencies.

## Verification performed
- Backend: full syntax check on every file (`node --check`); new endpoints follow the exact
  controller/route/middleware pattern of the existing `/interior-design` feature.
- Mobile: brace-balance + relative-import-resolution check across all 53 Dart files — all clean.
  Confirmed `DioClient`/`ApiConstants` usage matches existing provider conventions exactly, and that
  no router paths collide with existing routes.
- Logo: rendered from hand-authored SVG at 1024px + common icon sizes; previewed composited on the
  actual sage brand color to confirm contrast/legibility before adding to the project.

---

# Changelog — Real App Icons, Pricing Removed, OTP Fix, Admin Dashboard Fix

## Fixed
- **Logo, actually installed this time.** The `android`/`ios` platform folders now exist in this
  checkout, so the app icon (sofa + AR-viewfinder mark, same one from the previous round) was
  regenerated and written directly into every required slot: all 5 Android `mipmap-*` densities and
  all 15 iOS `AppIcon.appiconset` sizes (including the 1024px App Store icon). Android gets the
  rounded-square version; iOS gets a full-bleed square version (no baked-in corner radius) since iOS
  masks the icon itself. Verified visually at both densities.
- **Password reset via OTP was broken end-to-end.** `verifyOtp()` in the mobile app discarded the
  `resetToken` the backend returns after a successful `password_reset` OTP verification (the code
  even had a comment admitting it), so `ResetPasswordScreen` always received an empty token and the
  reset call would fail. Fixed by threading the token through `AuthState` → `OtpScreen` →
  `/reset-password`. Also added a `POST /api/auth/resend-otp` endpoint (handles both
  `email_verification` and `password_reset`) and a "Resend code" button with a 30s cooldown on the
  OTP screen, since there was previously no way to recover from an expired/lost code.
- **Admin dashboard: added a real fix for "blank screen after login."** Reviewed the entire render
  path (routing, `ProtectedRoute`, `AuthContext`, layout, Sidebar, Topbar, `DashboardPage`, the axios
  interceptors, CORS, JWT signing/verification) — all correct, and a real production build couldn't be
  run in this sandbox (missing native `@rollup/rollup-linux-x64-gnu` binary, no network to fetch it;
  this is a sandbox/environment limitation, not a code issue — `npm install` in a normal environment
  should not hit this). Since no single root cause could be confirmed, shipped the two concrete fixes
  that address this whole class of bug: (1) a proper `ErrorBoundary` — there wasn't one anywhere in
  this app, so *any* uncaught render error currently unmounts the whole tree and leaves a blank white
  screen with nothing in the UI to explain why; now it shows a message and a reload button instead;
  (2) the 401 interceptor now dispatches an `auth:session-expired` event instead of directly mutating
  `localStorage` and hard-redirecting, so `AuthContext`'s in-memory state and `localStorage` can never
  fall out of sync, and a guard flag prevents duplicate redirects if several requests 401 at once.
- Fixed one real ESLint error (`MenuItem` imported but unused in `CategoriesPage.jsx`). The admin
  dashboard is now fully ESLint-clean (`eslint src` — zero errors, zero warnings).

## Removed — Pricing
Removed price/discount display and all "buy for X" functionality across the whole stack, per request:
- **Backend**: `price`/`discountPrice` removed from the `Furniture` model (fields, validation, index),
  `furnitureController` (create/update allow-list, min/max-price query filtering), `furnitureRoutes`
  (validator), the AI recommendation/interior-design prompts and filters (budget-based filtering
  dropped along with it), `savedDesignController`'s populate field-selects, `seedData.js`, and the
  appliance/AI test fixtures.
- **Admin dashboard**: removed the Price column from the furniture data grid, and the Price/Discount
  Price fields (plus their validation) from the furniture create/edit form.
- **Mobile app**: removed `price`/`discountPrice` from `FurnitureModel`, the price line from
  `FurnitureCard` (replaced with category name + rating, so the card isn't empty) and from the
  furniture details screen, the price-range slider from the search filter sheet (and `minPrice`/
  `maxPrice` from `FurnitureFilter`), and the dead `Add to Cart` stub button (there was no cart/order
  system behind it — it did nothing) in favor of a full-width "View in AR" action.

## Added — Extra polish
- Admin dashboard now has a real favicon + apple-touch-icon (previously the bare Vite default/none),
  and the new logo mark now appears next to the "AR Furniture Studio" wordmark in the sidebar header —
  extends the logo change to the admin product surface, not just mobile.

## Verification performed
- Backend: `node --check` on every file — clean.
- Mobile: brace-balance + relative-import-resolution check across all 53 Dart files — clean.
- Admin dashboard: `eslint src --ext .js,.jsx` — zero errors, zero warnings (was 1 error before this
  round). A real `vite build` was attempted but blocked by a sandbox-only missing native binary
  (documented above) — not a code defect.
