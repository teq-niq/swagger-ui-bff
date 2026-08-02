# Edge Cases

## Logout: BFF server unreachable

### Inline fetch path (simple.bff — no redirect)

When the consumer app uses `redirectforlogin: false`, the plugin calls the BFF logout endpoint via an inline `fetch`. If the server is down or returns a non-2xx:

- `.then(resp => { if (!resp.ok) ... })` — catches non-2xx responses (e.g. 500, 401)
- `.catch(err => { ... })` — catches network failure (server down, ERR_CONNECTION_REFUSED)

Both paths: `system.errActions.newAuthErr(...)` shows the error in the Swagger UI auth modal, then `oriLogout()` clears the UI regardless. The user is never left with a locked padlock they cannot clear.

**Tested:** server stopped → `.catch()` fires → error appears in auth modal → UI clears.

### Redirect path (oidc.bff — redirectforlogin: true)

When `redirectforlogin: true`, the plugin does `window.location.href = def.logout` (a full browser navigation). If the server is down, the browser lands on a Chrome ERR_CONNECTION_REFUSED page. The plugin has no control once the navigation has occurred — this is beyond the plugin's scope and mirrors what happens with any redirect-based logout flow.
