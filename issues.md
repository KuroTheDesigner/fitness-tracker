# Known Problems - VIGOR Fitness Tracker

This document details all currently unresolved and critical issues in the application, focusing primarily on the Convex Native Authentication flow and its downstream effects on the application's data layer.

## 1. Persistent Dashboard Skeleton Loaders (WebSocket JWT Authentication Failure)

### The Symptom
After a successful registration or login via the `@convex-dev/auth` package (using the `Password` provider), the application correctly transitions from the `AuthPage` to the `HomePage`. However, the main user interface consists entirely of **persistent grey skeleton loaders**. The actual user data, workout schedule, and dashboard content never load.

### The Mechanism
1. The user logs in and the `auth:signIn` POST request succeeds (HTTP 200 OK), returning a valid JWT and a refresh token.
2. The client library stores these tokens in the browser's `localStorage` (e.g., `__convexAuthJWT_httpsfine...`).
3. Because tokens exist locally, the client-side `useConvexAuth()` hook reports `{ isAuthenticated: true, isLoading: false }`. The React router (in `App.jsx`) uses this to let the user into the main application.
4. **The Failure Point:** Once inside the dashboard, all data fetching relies on real-time queries over the Convex WebSocket connection. The Convex client attempts to authenticate these WebSocket queries using the stored JWT. However, the Convex server-side runtime **rejects or fails to validate the identity**.
5. Consequently, any backend query calling `await auth.getUserId(ctx)` (such as the `api.users.current` query) evaluates to `null`.
6. With `users.current` returning `null`, the `userId` passed to the `useWorkout(userId)` hook is `undefined`.
7. Inside the `useWorkout` hook, the dependent queries are intentionally skipped:
   ```javascript
   const program = useQuery(api.workouts.getProgram, userId ? { userId } : "skip");
   ```
8. Because `program` evaluates to `undefined` (skipped), `isLoading` becomes perpetually `true`:
   ```javascript
   isLoading: program === undefined || schedule === undefined,
   ```

### Root Cause Diagnosis
The core issue is a fundamental **desync between Client State and Server State**. The client believes it is authenticated because it holds a JWT, but the Convex server considers the WebSocket connection unauthenticated.

This means that while the `SignIn` mutation works (generating the token and asserting it against the HTTP discovery endpoint), the ongoing WebSocket connection used for `useQuery` cannot validate the token. Potential reasons for this:
- **Issuer/Audience Mismatch:** The token issuer (`https://fine-mink-251.convex.site`) might not perfectly match what the Convex infrastructure expects when verifying the token for a query context.
- **Protocol/Caching Bug:** The backend infrastructure may require a specific delay, or there is an issue with how the `ConvexAuthProvider` hydrates the WebSocket connection with the token upon initial mount.

### Attempted Solutions & Discoveries
- **Key Generation Mismatch:** It was discovered that if `JWT_PRIVATE_KEY` and `JWKS` are generated separately, the backend will fail to match them. **Fix Applied:** We ran the official `jose` key generation script to generate an atomic RSA key pair and set both variables simultaneously via CLI.
- **No Auth Provider Found Error:** A platform-level error originally occurred during `signIn`: `"No auth provider found matching the given token"`.
  - **Fix Applied:** We discovered that exporting `process.env.CONVEX_SITE_URL` in `auth.config.ts` resulted in an `undefined` domain because `auth.config.ts` is bundled and evaluated at deployment time (where `process.env` system variables are not available). We resolved this by hardcoding the domain: `"https://fine-mink-251.convex.site"`.
- **HTTP Actions Missing:** Initially, no HTTP routes were registered for OIDC discovery points. **Fix Applied:** We created `convex/http.ts` yielding valid responses for `/.well-known/openid-configuration` and `/.well-known/jwks.json`.

Despite all these backend corrections fixing the HTTP `signIn` cycle, the **WebSocket query validation** remains broken.

---

## 2. Impossible Logout Flow
### The Symptom
When the application is stuck in the skeleton-loader state, it is impossible for the user to log out via the UI.

### The Mechanism
The "Log Out" button or profile settings menu is part of the application layout that only renders when `isLoading` is false (i.e., when data successfully loads). Because the `useWorkout` hook is stuck in an infinite `isLoading: true` state, the UI remains covered by skeleton placeholders, completely rendering the settings gear and logout mechanisms inaccessible.

### Workaround
Currently, a manual "logout" is only possible via accessing the Chrome Developer Tools and clearing the `localStorage` and `sessionStorage` arrays to remove the `__convexAuthJWT_*` tokens, followed by a hard page refresh.

---

## 3. Potential Hydration Errors on Initialization
### The Symptom
Occasionally, upon refreshing the page on `localhost:5180`, brief console errors appear concerning CORS policy restrictions or `undefined` auth states before the application re-runs the `auth:signIn` refresh token exchange.

### The Mechanism
The front-end client eagerly attempts to load data or render authentication states before the `ConvexAuthProvider` has fully initialized its network handshake. While it often recovers after 1-2 seconds, it creates race conditions in React's component tree and causes the `App.jsx` entry point to thrash between the `AuthPage` and the `HomePage` skeleton loaders.

---

## Summary of Next Steps for Resolution
To fully resolve these issues, the debugging effort must shift entirely from the `auth.config.ts` deployment configuration to **how the `ConvexAuthProvider` attaches the JWT to the WebSocket**.
1. We need to verify if there is a version mismatch between `@convex-dev/auth` and the `convex` core package that is failing the WebSocket token schema.
2. We must verify if the user account actually gets correctly written to the internal `users` table during the `Password` registration mutation, or whether the `users.current` query is simply returning `null` because the newly registered user lacks an entry in the target database.
