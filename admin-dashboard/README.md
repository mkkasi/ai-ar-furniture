# AR Furniture Studio — Admin Dashboard

React + Vite admin panel for managing furniture, categories, users, reviews,
saved AR designs, and notifications.

## Tech Stack

- React 18, Vite
- Material UI (MUI) v6 + `@mui/x-data-grid`
- Axios for API calls
- Chart.js (`react-chartjs-2`) for analytics
- React Router v6

## Project Structure

```
src/
├── api/            # Axios client + one module per resource
├── components/      # Sidebar, Topbar, layout, ProtectedRoute, StatsCard
├── context/          # AuthContext (admin session)
├── pages/            # Login, Dashboard, Furniture (list/form), Categories,
│                      # Users, Reviews, Saved Designs, Notifications
├── theme/            # MUI theme
├── App.jsx
└── main.jsx
```

## Installation & Running

```bash
npm install
cp .env.example .env
# edit .env -> VITE_API_BASE_URL should point at your backend, e.g.
# http://localhost:5000/api

npm run dev
# Admin dashboard runs at http://localhost:5173
```

Log in with the admin account created by the backend's `npm run seed`
script (`ADMIN_EMAIL` / `ADMIN_PASSWORD` from its `.env`).

## Build for production

```bash
npm run build
npm run preview   # serve the production build locally to sanity-check
```

Deploy the `dist/` folder to any static host (Netlify, Vercel, S3+CloudFront,
Nginx). Set `VITE_API_BASE_URL` to your deployed backend's URL at build time.

## Features

- **Auth:** admin-only login (rejects non-admin accounts client-side; the
  backend also enforces this on every `/admin/*` route).
- **Dashboard:** total users/furniture/categories/reviews, a 30-day signup
  line chart, top-rated furniture, and newest users.
- **Furniture:** DataGrid listing with add/edit form (images + `.glb`/`.usdz`
  3D model upload, dimensions, materials, colors, room types, feature/trending
  toggles) and delete.
- **Categories:** card grid with create/edit dialog (image upload) and delete
  (blocked server-side if furniture still references the category).
- **Users:** searchable table with an enable/disable toggle per user.
- **Reviews:** moderation table with delete.
- **Saved Designs:** read-only gallery of all users' saved AR room layouts.
- **Notifications:** broadcast a push/in-app notification to all users.
