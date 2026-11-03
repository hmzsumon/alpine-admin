# Alpine Restaurant admin

QX-style Next.js App Router, feature components, typed context/hooks and Tailwind CSS.

## Run

Start ../alpine-api with npm start after npm run build. Then run npm run dev here and open http://127.0.0.1:3100/login.

Authentication and MongoDB setup, role matrix and initial owner credentials location: [../AUTHENTICATION.md](../AUTHENTICATION.md).

The application now requires an authenticated staff account. Data is stored in MongoDB, not browser-local demo storage. No real payment gateway or physical printer agent is added by the authentication change.

## Structure

Pages live under app/(auth)/<feature>. components/auth/Layout composes the shared shell. Each feature has its own component folder. providers/AuthProvider supplies live permissions; providers/AdminProvider owns workspace lifecycle through hooks/useAdminWorkspace. lib/adminWorkspace handles versioned persistence. lib/server/api and app/api routes keep JWT transport server-side. middleware validates protected page access; the backend independently authorizes every API action.

## Checks

npm run typecheck

node scripts/verify-menu.mjs

npm run build
