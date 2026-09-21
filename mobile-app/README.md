# AR Furniture Studio — Flutter App

Mobile app for virtually placing furniture in your room using Augmented
Reality, built with Flutter, Riverpod, Go Router, Material 3, and Hive.

## Tech Stack

- **Framework:** Flutter (stable channel)
- **State management:** Riverpod (`flutter_riverpod`)
- **Routing:** `go_router` with a persistent bottom-nav shell
- **UI:** Material 3, light/dark theming, Google Fonts, Lottie
- **Local storage:** Hive (cache/preferences) + `flutter_secure_storage` (tokens)
- **Networking:** Dio with auth-token + auto-refresh interceptors
- **AR:** `ar_flutter_plugin_flutterflow` (wraps ARCore on Android / ARKit on iOS)

## Project Structure

```
lib/
├── core/
│   ├── constants/        # API endpoints, app-wide constants
│   ├── network/          # Dio client + interceptors
│   ├── router/           # go_router configuration
│   ├── storage/          # Hive + secure storage wrapper
│   ├── theme/            # Material 3 light/dark theme
│   └── widgets/          # Shared widgets (bottom-nav shell, etc.)
├── features/
│   ├── auth/              # Splash, onboarding, login, register, OTP, password reset
│   ├── home/               # Home feed, categories, search & filters
│   ├── furniture_details/  # Product detail screen
│   ├── ar/                  # AR placement screen + scene state
│   ├── favorites/           # Wishlist
│   ├── saved_designs/       # Save / rename / delete / share AR layouts
│   ├── notifications/       # Push notification inbox
│   ├── profile/             # Profile view + edit
│   └── settings/            # Dark mode, language, legal links
└── main.dart
```

## Installation Guide

### Prerequisites
- Flutter SDK (latest stable)
- Xcode (for iOS/ARKit) and/or Android Studio (for Android/ARCore)
- A physical device is strongly recommended for testing AR — most
  simulators/emulators do not support ARCore/ARKit.
- The backend API running (see the backend project's README)

### Steps

```bash
flutter pub get

cp .env.example .env
# edit .env -> API_BASE_URL should point at your running backend,
# e.g. http://10.0.2.2:5000/api for the Android emulator, or your
# machine's LAN IP for a physical device.

# Run on a connected device/emulator
flutter run
```

### Firebase (push notifications)

Add your own `google-services.json` (Android) and `GoogleService-Info.plist`
(iOS) from the Firebase console; `firebase_core` initialization is already
wired up in `main.dart` and fails gracefully if the config files are absent.

### AR platform setup

- **Android:** requires `minSdkVersion 24+` and Google Play Services for AR
  (ARCore) installed on the test device. Add the ARCore `<meta-data>` and
  camera permission entries to `AndroidManifest.xml`.
- **iOS:** requires iOS 12+ on an ARKit-capable device and the
  `NSCameraUsageDescription` key in `Info.plist`.

### Tests

```bash
flutter test
```

## Key Features Implemented

- Splash → onboarding → auth (register/login/OTP/forgot-reset password) with
  JWT access + refresh tokens stored securely and auto-refreshed on 401.
- Home feed: categories, trending, recommended, search with price/room-type
  filters.
- Furniture details: image gallery, ratings, dimensions, colors, "View in AR".
- AR placement: horizontal plane detection, tap-to-place, move/rotate via
  built-in gestures, scale buttons, duplicate, delete, reset scene, screenshot,
  and save the full layout as a named design.
- Favorites, saved designs (rename/delete/share), notifications inbox,
  profile editing, and settings (dark mode, language, legal links).

## Notes on the AR Module

`ar_flutter_plugin_flutterflow` exposes session/object/anchor managers used
in `lib/features/ar/screens/ar_view_screen.dart`. Because Claude generated
this code without access to a Flutter build toolchain, **build the project
and run `flutter pub get` / `flutter analyze` before shipping** — AR plugin
APIs occasionally shift between versions, so double-check method signatures
against the installed package version and adjust if needed.
