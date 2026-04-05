# SnapKart Grocery App

SnapKart is a full-stack grocery ordering platform built with Next.js and Socket.IO.
It supports three roles:

- User: browse groceries, manage cart, checkout, track orders, chat
- Admin: add/edit/delete grocery items, manage orders
- Delivery Boy: assignment flow, OTP delivery flow, live location updates

This repository contains two apps:

- `grocery-web-app`: main Next.js web app + APIs
- `socket.io-server`: real-time server for chat, notifications, and location updates

## Tech Stack

### Frontend + API
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Redux Toolkit
- NextAuth (Credentials + Google)
- Stripe
- Cloudinary
- MongoDB + Mongoose

### Realtime Service
- Node.js + Express
- Socket.IO
- Axios

## Repository Structure

```text
Grocery_app/
  grocery-web-app/      # Next.js app (UI + backend routes)
  socket.io-server/     # Socket.IO realtime server
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (Atlas or local)
- Cloudinary account (for grocery image upload)
- Stripe account (for online payments)
- Google OAuth credentials (if Google login is enabled)

## Environment Variables

Create environment files as shown below.

### 1) Next.js app env
File: `grocery-web-app/.env.local`

```env
# Database
MONGODB_URL=mongodb+srv://<user>:<pass>@<cluster>/<db>

# NextAuth
AUTH_SECRET=your_long_random_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payments
STRIPE_SECRET_KEY=sk_test_or_live_key
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Mailer (for email/OTP flows)
USER_EMAIL=you@example.com
USER_PASS=your_email_app_password

# AI suggestion feature
GEMINI_API_KEY=your_gemini_api_key

# App URL and Socket URL
NEXT_BASE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:8080
```

### 2) Socket server env
File: `socket.io-server/.env`

```env
# URL of the Next.js app
NEXT_BASE_URL=http://localhost:3000
```

Note:
- In this project, `NEXT_BASE_URL` points to the Next.js app URL.
- `NEXT_PUBLIC_BASE_URL` points to the Socket.IO server URL.

## Installation

From repo root:

```bash
cd grocery-web-app
npm install

cd ../socket.io-server
npm install
```

## Run Locally

Start both services in separate terminals.

Terminal 1 (Next.js app):

```bash
cd grocery-web-app
npm run dev
```

Terminal 2 (Socket server):

```bash
cd socket.io-server
npm run dev
```

Default local URLs:

- Web app: http://localhost:3000
- Socket server: http://localhost:8080

## Available Scripts

### grocery-web-app

```bash
npm run dev      # start Next.js dev server
npm run build    # production build
npm run start    # run production server
npm run lint     # run ESLint
```

### socket.io-server

```bash
npm run dev      # start with nodemon
npm run start    # start with node
```

## Core Features

- Role-based experience (user, admin, delivery)
- Grocery catalog with category and unit management
- Cart with quantity controls and totals
- Order placement and order history
- Stripe checkout flow and webhook handling
- Delivery assignment and live tracking
- In-app realtime chat and notifications
- Google login + credentials login

## Realtime Events (Socket.IO)

The realtime server handles these key events:

- `identity`: map user to a socket id
- `joinRoom`: join a chat room
- `sendMessage`: persist message and broadcast to room
- `updateLocation`: save and broadcast delivery location
- `POST /notify`: emit custom events to one/all clients

## Deployment Notes

- Deploy `grocery-web-app` and `socket.io-server` as separate services.
- Set CORS and base URLs correctly in both environments.
- Use production secrets for NextAuth, Stripe, Cloudinary, mailer, and DB.
- Ensure Stripe webhook endpoint points to:
  - `grocery-web-app/src/app/api/user/stripe/webhook/route.ts`

## Troubleshooting

- If realtime features fail:
  - Verify `NEXT_PUBLIC_BASE_URL` in `grocery-web-app/.env.local`.
  - Verify socket server is running on expected URL/port.
- If API calls from socket server fail:
  - Verify `NEXT_BASE_URL` in `socket.io-server/.env`.
- If login fails:
  - Check NextAuth envs (`AUTH_SECRET`, Google creds).
- If images fail to upload:
  - Check Cloudinary keys.
- If payments fail:
  - Check Stripe keys and webhook secret.

## License

This project currently has no explicit license file.
Add a `LICENSE` file if you plan to distribute it publicly.
