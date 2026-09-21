# AR Furniture Studio — Full Project

A complete AR furniture shopping platform: a Flutter mobile app with
AR placement, a Node.js/Express/MongoDB backend, and a React admin
dashboard.

```
AR-Furniture-Studio/
├── backend/            # Node.js + Express + MongoDB Atlas REST API
├── admin-dashboard/    # React + Vite + MUI admin panel
└── mobile-app/         # Flutter app (iOS + Android, AR via ARCore/ARKit)
```

Each folder also has its own detailed README (tech stack, project
structure, full API docs for the backend, etc). This file covers how
to get all three running together, end to end.

---

## 0. Prerequisites

Install these once:

| Tool | Used for | Version |
|---|---|---|
| [Node.js](https://nodejs.org) | backend + admin dashboard | ≥ 18 |
| [npm](https://npmjs.com) | package manager | comes with Node |
| [Flutter SDK](https://flutter.dev) | mobile app | latest stable |
| A MongoDB Atlas cluster (or local MongoDB) | database | — |
| A [Cloudinary](https://cloudinary.com) account (free tier) | image/3D model storage | — |
| An SMTP account (e.g. Gmail App Password) | OTP emails | — |
| Xcode (macOS) and/or Android Studio | building the mobile app | — |
| A physical phone | testing AR (ARCore/ARKit rarely work in simulators) | — |

---

## 1. Run the backend first

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — any long random strings
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credentials for the seeded admin account
- (optional) `GEMINI_API_KEY` for AI recommendations

Then seed the database with a demo admin + sample furniture catalog, and
start the server:

```bash
npm run seed
npm run dev
```

The API is now running at `http://localhost:5000` — check
`http://localhost:5000/health` in a browser to confirm.

Run the backend's test suite any time with `npm test` (uses an in-memory
MongoDB, no live database needed).

---

## 2. Run the admin dashboard

```bash
cd admin-dashboard
npm install
cp .env.example .env
```

Set `VITE_API_BASE_URL=http://localhost:5000/api` in `.env` (adjust if
your backend runs elsewhere), then:

```bash
npm run dev
```

Open `http://localhost:5173` and log in with the `ADMIN_EMAIL` /
`ADMIN_PASSWORD` you set in the backend's `.env` (created by `npm run seed`).
From here you can add furniture (with images and `.glb`/`.usdz` 3D
models), manage categories, users, reviews, and broadcast notifications.

**Tip:** add a few furniture items with 3D models here before testing
the mobile app's AR view — the app has nothing to place in AR until
the catalog has at least one item with a `.glb`/`.usdz` model attached.

---

## 3. Run the mobile app

```bash
cd mobile-app
flutter pub get
cp .env.example .env
```

Edit `.env`:
- Android emulator → `API_BASE_URL=http://10.0.2.2:5000/api`
- Physical device → `API_BASE_URL=http://<your-computer's-LAN-IP>:5000/api`
  (phone and computer must be on the same network)
- iOS simulator → `API_BASE_URL=http://localhost:5000/api`

Then run:

```bash
flutter run
```

### AR-specific setup

- **Android:** needs Google Play Services for AR (ARCore) installed on
  the test device, `minSdkVersion 24+`, and the ARCore `<meta-data>` +
  camera permission entries in `android/app/src/main/AndroidManifest.xml`.
- **iOS:** needs iOS 12+ on an ARKit-capable device and the
  `NSCameraUsageDescription` key in `ios/Runner/Info.plist`.
- AR does **not** work reliably in most simulators/emulators — test on
  a real device.

### Push notifications (optional)

Add your own `google-services.json` (Android) and
`GoogleService-Info.plist` (iOS) from the Firebase console. The app
initializes Firebase defensively and simply skips push setup if these
files aren't present, so you can develop everything else without them.

---

## 4. Typical end-to-end test flow

1. Start the backend (`npm run dev` in `backend/`).
2. Start the admin dashboard, log in, add a category and a furniture
   item with images + a `.glb` model.
3. Run the mobile app on a real device, register a new user, verify
   the email OTP (check your configured inbox), log in.
4. Browse to the furniture item you added, tap **View in AR**, point
   the camera at a floor, tap to place it, move/rotate/scale it, and
   tap **Save Design**.
5. Back in the app, check **Saved Designs** to see it listed; check
   the admin dashboard's **Saved Designs** page to see it show up
   there too.

---

## 5. Deployment notes

- **Backend:** deploy to Render/Railway/Fly.io/EC2 etc. See
  `backend/README.md` → "Deployment Guide" for details (env vars,
  PM2, reverse proxy, health checks).
- **Admin dashboard:** `npm run build` in `admin-dashboard/` produces
  a static `dist/` folder — deploy it to Netlify/Vercel/S3/any static
  host, with `VITE_API_BASE_URL` pointing at your deployed backend.
- **Mobile app:** build release binaries with `flutter build apk` /
  `flutter build ios`, pointing `API_BASE_URL` at your deployed
  backend via `--dart-define=API_BASE_URL=https://your-api.com/api`.

---

## 6. A note on scope

This project was generated incrementally across a conversation, module
by module, so nothing was rushed or stubbed with placeholder code. That
said, it hasn't been compiled/run in this environment (no network or
Flutter SDK available here), so before shipping:

- Run `npm install && npm test` in `backend/`.
- Run `npm install && npm run build` in `admin-dashboard/`.
- Run `flutter pub get && flutter analyze` in `mobile-app/` — the AR
  plugin (`ar_flutter_plugin_flutterflow`) in particular is worth a
  close look, since third-party AR plugin APIs shift between versions
  and should be checked against whatever version `flutter pub get`
  resolves.
