# AR Furniture Studio — Backend API

Node.js / Express / MongoDB Atlas REST API powering the AR Furniture Studio
mobile app (Flutter) and the React admin dashboard.

## Tech Stack

- **Runtime:** Node.js 18+, Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Auth:** JWT (access + refresh tokens), bcrypt password hashing
- **Media:** Cloudinary (images + `.glb`/`.usdz` 3D models), Multer
- **Email:** Nodemailer (OTP delivery)
- **AI:** Gemini API (optional recommendation module)
- **Security:** Helmet, CORS, express-rate-limit, mongo-sanitize, xss-clean
- **Testing:** Jest + Supertest + mongodb-memory-server

## Project Structure

```
ar-furniture-studio-backend/
├── config/
│   ├── db.js                 # MongoDB Atlas connection
│   └── cloudinary.js         # Cloudinary + multer storage engines
├── controllers/
│   ├── authController.js
│   ├── furnitureController.js
│   ├── categoryController.js
│   ├── favoriteController.js
│   ├── reviewController.js
│   ├── savedDesignController.js
│   ├── notificationController.js
│   ├── adminController.js
│   └── aiController.js
├── middleware/
│   ├── authMiddleware.js      # protect / adminOnly / optionalAuth
│   ├── errorMiddleware.js     # centralized error handler
│   ├── validateMiddleware.js  # express-validator wrapper
│   └── uploadMiddleware.js    # multer + Cloudinary upload configs
├── models/
│   ├── User.js
│   ├── Furniture.js
│   ├── Category.js
│   ├── Favorite.js
│   ├── Review.js
│   ├── SavedDesign.js
│   ├── Notification.js
│   └── RecentlyViewed.js
├── routes/
│   ├── authRoutes.js
│   ├── furnitureRoutes.js
│   ├── categoryRoutes.js
│   ├── favoriteRoutes.js
│   ├── reviewRoutes.js
│   ├── savedDesignRoutes.js
│   ├── notificationRoutes.js
│   ├── adminRoutes.js
│   └── aiRoutes.js
├── utils/
│   ├── generateToken.js
│   ├── otpGenerator.js
│   ├── sendEmail.js
│   ├── apiResponse.js
│   └── seedData.js
├── tests/
│   └── auth.test.js
├── uploads/                   # local scratch dir (Cloudinary is source of truth)
├── app.js                     # Express app + middleware wiring
├── server.js                  # entry point
├── .env.example
└── package.json
```

## Installation Guide

### Prerequisites
- Node.js ≥ 18
- A MongoDB Atlas cluster (or local MongoDB for dev)
- A Cloudinary account (free tier is fine)
- An SMTP account for sending OTP emails (Gmail App Password works)
- (Optional) A Gemini API key for AI recommendations

### Steps

```bash
# 1. Install dependencies
cd ar-furniture-studio-backend
npm install

# 2. Configure environment variables
cp .env.example .env
# then edit .env with your MongoDB URI, Cloudinary keys, SMTP creds, JWT secrets

# 3. Seed the database with a demo admin + sample catalog
npm run seed

# 4. Start in development (auto-reload)
npm run dev

# Or start in production mode
npm start
```

The API will be available at `http://localhost:5000`. Health check:
`GET http://localhost:5000/health`.

### Running tests

```bash
npm test
```

Tests spin up an in-memory MongoDB instance (`mongodb-memory-server`), so no
real database connection is required.

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Access token signing |
| `JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRES_IN` | Refresh token signing |
| `CLOUDINARY_*` | Media storage for images and 3D models |
| `SMTP_*`, `EMAIL_FROM` | OTP / transactional email delivery |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used by `npm run seed` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Optional AI recommendation module |

## API Documentation

All responses follow this envelope:

```json
{ "success": true, "message": "...", "data": { }, "meta": { } }
```

Errors:

```json
{ "success": false, "message": "...", "errors": ["..."] }
```

### Auth — `/api/auth`

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create account, sends email OTP |
| POST | `/verify-otp` | Public | Verify email OR confirm password-reset OTP |
| POST | `/login` | Public | Returns `accessToken` + `refreshToken` |
| POST | `/forgot-password` | Public | Sends password-reset OTP |
| POST | `/reset-password` | Public | Consumes reset token from `verify-otp` |
| POST | `/refresh-token` | Public | Exchanges refresh token for new access token |
| GET | `/profile` | Private | Get current user |
| PUT | `/profile` | Private | Update name/phone/preferences/avatar |
| PUT | `/change-password` | Private | Change password while logged in |
| POST | `/logout` | Private | Removes device FCM token |

### Furniture — `/api/furniture`

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List + search + filter + paginate |
| GET | `/recently-viewed` | Private | Current user's recently viewed items |
| GET | `/:id` | Public | Single item detail (tracks view) |
| POST | `/` | Admin | Create item (multipart: `images[]`) |
| PUT | `/:id` | Admin | Update item |
| PUT | `/:id/model` | Admin | Upload/replace `.glb`/`.usdz` AR model |
| DELETE | `/:id` | Admin | Delete item + Cloudinary assets |
| DELETE | `/:id/images/:publicId` | Admin | Remove one image |
| GET | `/:furnitureId/reviews` | Public | List reviews |
| POST | `/:furnitureId/reviews` | Private | Submit a review |

Query params on `GET /`: `q, category, minPrice, maxPrice, colors, materials, roomType, trending, featured, sort, page, limit`.

### Categories — `/api/categories`

Standard CRUD; `GET` is public, mutations are Admin-only.

### Favorites — `/api/favorites`
`GET /`, `POST /` (`{ furnitureId }`), `DELETE /:furnitureId` — all Private.

### Reviews — `/api/reviews`
`PUT /:id`, `DELETE /:id` — owner or Admin.

### Saved Designs — `/api/saved-designs`
`GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `POST /:id/share`,
and public `GET /shared/:shareToken`.

### Notifications — `/api/notifications`
`GET /`, `PUT /:id/read` — Private. `POST /` — Admin (broadcast or targeted).

### AI — `/api/ai`
`POST /recommendations` (`{ roomSizeSqm, wallColor, budget, style, roomType }`),
`GET /match/:furnitureId`,
`POST /interior-design` (multipart: `roomPhoto`) — analyzes a room photo and
recommends style/furniture/appliances,
`POST /visual-search` (multipart: `photo`) — analyzes a photo of a single
product and finds visually/stylistically similar catalog items,
`POST /chat` (`{ message }`) — conversational AI shopping assistant with
rolling history, `GET /chat/history`, `DELETE /chat/history` — all Private.
Every AI endpoint degrades gracefully to catalog filtering / a fallback
message if `GEMINI_API_KEY` is not set.

### Admin — `/api/admin`
`GET /stats`, `GET /users`, `PUT /users/:id/disable`, `GET /saved-designs` — Admin only.

## Deployment Guide

1. **Provision MongoDB Atlas**: create a cluster, a database user, and
   whitelist your server's IP (or `0.0.0.0/0` for platforms with dynamic IPs).
2. **Set environment variables** on your host (Render, Railway, Fly.io, EC2,
   etc.) matching `.env.example`. Never commit `.env`.
3. **Install & build**: `npm ci --production`.
4. **Run migrations/seed** (first deploy only): `npm run seed`.
5. **Start**: `npm start` (or run behind PM2 / a process manager):
   ```bash
   npm i -g pm2
   pm2 start server.js --name ar-furniture-api
   ```
6. **Reverse proxy**: put Nginx or your platform's load balancer in front,
   terminate TLS there, and forward to the Node port.
7. **CORS**: set `CLIENT_URL` to your deployed admin dashboard's origin
   (comma-separate multiple origins).
8. **Health checks**: point your platform's health check at `GET /health`.

## Security Notes

- Passwords hashed with bcrypt (cost factor 12).
- JWT access tokens are short-lived; refresh tokens rotate access tokens.
- `helmet`, `cors`, `express-rate-limit`, `express-mongo-sanitize`, and
  `xss-clean` are applied globally; auth endpoints have a stricter limiter.
- All admin routes require both a valid JWT and `role: 'admin'`.
- Forgot-password responses are identical whether or not the email exists,
  to prevent user enumeration.
