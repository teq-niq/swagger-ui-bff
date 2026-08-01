/**
 * BffPlugin — wraps auth.logout for bff schemes
 * Place this plugin in your BasePreset (after the Auth plugin is registered)
 */

import BffEnabler from "./../../components/bff/bff-enabler"

/**
 * Find a security definition by scheme name
 */
function getDefByScheme(defs, schemeName) {
  for (const defObjMap of defs) {
    const defObj = defObjMap.toJS()
    const key = Object.keys(defObj)[0]
    if (key === schemeName) {
      return defObj[key]
    }
  }
  return null
}

function applyBffRequestPolicy(req) {
  // 1. Cross-origin dev mode → include credentials
  if (req.url && !req.url.startsWith("/")) {
    req.credentials = "include"
  }

  // 2. CSRF for state-changing methods
  const stateChangingMethods = ["POST", "PUT", "PATCH", "DELETE"]

  if (
    req.method &&
    stateChangingMethods.includes(req.method.toUpperCase())
  ) {
    const csrfToken = getCsrfTokenFromCookie("XSRF-TOKEN")

    if (csrfToken) {
      req.headers = req.headers || {}
      req.headers["X-XSRF-TOKEN"] = csrfToken
    }
  }

  return req
}

function getCsrfTokenFromCookie(name) {
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  )
  return match ? match[2] : null
}


const BffPlugin = () => () => {
  return {
    components: {
      BffEnabler,
    },

    statePlugins: {
      auth: {
        wrapActions: {
          logout: (oriLogout, system) => (payload) => {
            const defs = system.authSelectors.definitionsToAuthorize()
            const schemeList = Array.isArray(payload)
              ? payload
              : Object.keys(payload)

            // 1. regular logouts for NON-BFF
            for (const schemeName of schemeList) {
              const def = getDefByScheme(defs, schemeName)
              if (!def) continue

              if (def.scheme !== "bff") {
                oriLogout([schemeName])
              }
            }

            // 2. BFF logout 
            for (const schemeName of schemeList) {
              const def = getDefByScheme(defs, schemeName)
              if (!def) continue

              if (def.scheme === "bff" && def.logout) {
				if(def.redirectforlogin === true){
					setTimeout(() => {
					                 window.location.href = def.logout
					               }, 50)
					               // redirect takes us away; stop processing
					               return
				}
				else{
					fetch(def.logout, { method: "GET", credentials: "include" })
					     .then(() => {
						   oriLogout([schemeName]);
					     })
					     .catch(err => {console.error("Inline BFF logout failed", err);
							oriLogout([schemeName]);
						 })
						 
				}
               
              }
            }
          },

          authorize: (oriAuthorize, system) => async (payload) => {
            const defs = system.authSelectors.definitionsToAuthorize()
            const schemeList = Array.isArray(payload)
              ? payload
              : Object.keys(payload)

            for (const schemeName of schemeList) {
              const def = getDefByScheme(defs, schemeName)

              // Only BFF + inline login
		
              if (def && def.scheme === "bff" ) {
				if (def.scheme === "bff" && def.redirectforlogin === false) {
					
					const payloadSchemaObj = payload[schemeName]

					const creds = payloadSchemaObj["value"];
				    if (creds.loggedIn !== true) {
						// covers:
						  // - loggedIn missing
						  // - loggedIn false
						  // - loggedIn undefined / null
						  
						  // perform inline login

						try {

						  const body = new URLSearchParams({
						    username: creds.username,
						    password: creds.password,
						  }).toString()
						  
						  const req = applyBffRequestPolicy({
						    url: def.login,
						    method: "POST",
						    headers: {
						      "Content-Type": "application/x-www-form-urlencoded",
						    },
						    body,
						  })

						  const resp = await fetch(req.url, req)
	
						  /*const resp = await fetch(def.login, {
						    method: "POST",
						    credentials: "include",
						    headers: {
						      "Content-Type": "application/x-www-form-urlencoded",
						    },
						    body,
						  })*/
	
						  if (!resp.ok) {
						    throw new Error(`Login failed: ${resp.status}`)
						  }
	
						  // session-derived state only (no password retained)
						  const profile = await fetch(def.profilecheck, {
						    credentials: "include",
						    cache: "no-store",
						  }).then((r) => r.json())
	
						  const authObj = {
						    [schemeName]: {
						      name: schemeName,
						      schema: def,
						      value: profile,
						    },
						  }
	
						  oriAuthorize(authObj)
						  return
						} catch (err) {
						  console.error("BFF login failed", err)
						  return
						}
				}
				

              }


              }

            }

            // fallback for non-BFF
			//like super method call
			//TODO: remove passwords from payload for bff schemes.
            oriAuthorize(payload)
          },
        },
      },
    },
  }
}

export default BffPlugin
