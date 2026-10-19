# TJ Consulting Club Website

Next.js site at https://tjconsulting.org, with server-side Ion authentication.
This branch requires a Node hosting platform such as Vercel; it is not a static
GitHub Pages export. Public pages can still be generated statically.

## Run and check

Use Node 22 or newer. Install with `npm ci`, then run `npm run dev`.
Run auth regression checks with `npm run test:auth` and build with `npm run build`.
A self-hosted production server can run with `npm start` after the build.

## Server environment

Copy `.env.example` to `.env.local` for local work. Never commit secrets.

- `AUTH_BASE_URL`: exact public origin, normally `https://tjconsulting.org`.
- `ION_CLIENT_ID`: the Ion application's public client ID.
- `ION_CLIENT_SECRET`: its confidential client secret.
- `AUTH_SESSION_SECRET`: an independently generated random string of at least
  32 characters. Keep this stable across deployments; replacing it logs users out.

None of these secrets should have a `NEXT_PUBLIC_` prefix. If the server settings
are missing, login returns home with a notice while the public site remains usable.
For localhost, use `http://localhost:3000` and register
`http://localhost:3000/auth/callback/` in Ion as an additional redirect URI.

## Ion application

Use **Confidential** client type, **Authorization code** grant, and this exact URI:

`https://tjconsulting.org/auth/callback/`

If the existing Public app's secret is unavailable, create a new Confidential
application and save its new client ID and secret at creation time. Update both
server environment variables. The implementation also uses S256 PKCE and a
random state stored in an encrypted, HTTP-only transaction cookie.

## Vercel migration

1. Import `wizardstrike1/tj-consulting-hub` as a Next.js project, using the repo root.
   Deploy `feat/server-ion-auth` for the initial migration/preview. Use the normal
   Next.js build/output settings; do not set an `out` output directory.
2. Add the four server environment variables above in Vercel. For a preview test,
   use a stable preview hostname as `AUTH_BASE_URL`, and register its matching
   `/auth/callback/` URL in Ion. Use different session keys for preview/production.
3. Test login, profile display, refresh, logout, cancelled approval, and a callback
   opened with an invalid/expired state. A real Ion login needs the real client
   secret. Unit tests use mocked Ion responses and do not authenticate an account.
4. Add `tjconsulting.org` to the Vercel project. Follow the exact DNS records Vercel
   supplies for this project; do not guess record values or change unrelated mail
   records. Set Production `AUTH_BASE_URL` to `https://tjconsulting.org` and register
   that callback in Ion before switching DNS.
5. Once preview checks pass, merge this branch and deploy Production on Vercel.
   Then point the custom domain to the verified Vercel project. This branch replaces
   the GitHub Pages deployment workflow with build/test CI; the currently deployed
   Pages website is unaffected until migration/cutover.

## Authentication behavior

The underlined **Log in** link goes to `/api/auth/login/`, which redirects directly
to Ion. `/auth/callback/` exchanges the code and fetches `/api/profile` from the
server, then returns home. Failure returns home with a dismissible notice.
The old `/auth/login/` URL redirects home.

The server uses encrypted/authenticated HTTP-only, SameSite=Lax cookies, with Secure
and the __Host- prefix over HTTPS. The OAuth transaction expires in ten minutes;
the identity session expires in at most one hour. Access and refresh tokens are
used only during the server-side callback, then discarded. They are not included
in the identity cookie, JavaScript, storage, query strings, or API responses.
Logout is a same-origin POST and clears local website cookies, not the Ion login.
There is no database or officer/member authorization yet. Future private routes
must verify the server session and apply their own role rules.

The mobile maintenance screen remains enabled. Auth responses are not cached and
callback routes render no analytics. Server logs include only sanitized failure
stages/status codes, never raw Ion responses or credentials.
