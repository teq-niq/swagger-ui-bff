# Edge Cases

## Logout: BFF server unreachable

### Inline fetch path (simple.bff — no redirect)

When the consumer app uses `redirectforlogin: false`, the plugin calls the BFF logout endpoint via an inline `fetch`. If the server is down or returns a non-2xx:

- `.then(resp => { if (!resp.ok) ... })` — catches non-2xx responses (e.g. 500, 401)
- `.catch(err => { ... })` — catches network failure (server down, ERR_CONNECTION_REFUSED)

Both paths: `system.errActions.newAuthErr(...)` shows the error in the Swagger UI auth modal, then `oriLogout()` clears the UI regardless. The user is never left with a locked padlock they cannot clear.

**Tested:** server stopped → `.catch()` fires → error appears in auth modal → UI clears.

## Login: error handling (simple.bff — inline fetch path)

The BFF security config (`SecurityConfiguration.java`) explicitly sends `401` on login failure via `.failureHandler((req, res, ex) -> res.sendError(401))`. The plugin maps status codes to specific messages:

- **401** → "Invalid credentials." (bad username/password)
- **Other non-2xx** (e.g. 500) → `BFF login failed (${resp.status}) — try again or refresh.` (server reachable, other error)
- **Network failure** (`.catch()`) → "BFF login: server unreachable — try again later." (server down)

The 401-specific message is intentional and tied to the BFF's explicit `sendError(401)` contract — not a generic HTTP assumption.

**Error accumulation:** `newAuthErr` pushes onto a list — errors stack if not cleared. The plugin calls `errActions.clear({ authId, type: "auth", source: "auth" })` before each login attempt (matching Swagger UI's own OAuth2 flow pattern), so only the latest error shows.

**Logout does not need a clear:** `oriLogout` immediately switches the modal back to the input form, so the logout button disappears. Only one logout error per session is possible — the user's next action is to fill in credentials and click Authorize, which triggers the clear.

## Logout: BFF server unreachable — redirect path (oidc.bff — redirectforlogin: true)

When `redirectforlogin: true`, the plugin does `window.location.href = def.logout` (a full browser navigation). If the server is down, the browser lands on a Chrome ERR_CONNECTION_REFUSED page. The plugin has no control once the navigation has occurred — this is beyond the plugin's scope and mirrors what happens with any redirect-based logout flow.
