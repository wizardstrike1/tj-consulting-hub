TJ Consulting Club Website

Ion login (static-site test)

The underlined navbar Log in button opens Ion directly. Ion redirects to
`https://tjconsulting.org/auth/callback/` using a Public application with the
Authorization code grant and S256 PKCE. The public client ID and callback URL
are configured in `src/lib/ion-auth.ts`; no client secret is used.

Ion must permit browser requests from `https://tjconsulting.org` to
`/oauth/token/` and `/api/profile`. The domain alone does not enable CORS.
The callback always returns to the homepage. If requests are blocked, a small
dismissible notice reports failure and the user is not signed in. The old
`/auth/login/` URL redirects home without an intermediate page.
To test on localhost, register a localhost redirect URI and update the callback
configuration to that exact origin temporarily; do not commit that override.

After a successful login, only the username, display name, and expiration are
kept in this tab's session storage for at most one hour. Access and refresh tokens
are never persisted. Logout clears the local identity, not the user's Ion login.
This is browser UI identity only: it does not protect resources or establish
officer/member permissions. Any future private endpoints need server-side
authentication and authorization.

Run the OAuth regression checks with Node 22:
`node --experimental-strip-types tests/ion-auth.test.mjs`.
Build the GitHub Pages export with `npm run build`.

Live verification after deployment: open the canonical domain, click Log in,
approve access, confirm you return home with your name in the navbar, refresh,
then log out. Also check that cancelling approval and reloading the callback
return home with a notice rather than a signed-in state. Auth pages omit analytics and use a
no-referrer policy so callback codes are not sent to analytics providers.
