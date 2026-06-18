/**
 * deployApi.js — Netlify & Vercel deploy-status
 *
 * Tokens lagras i localStorage, aldrig i källkod.
 * Anropar respektive API direkt från browsern (CORS stöds).
 */

const TOKEN_KEYS = {
  netlify: 'hub:token:netlify',
  vercel:  'hub:token:vercel',
}

// ─── Token-hantering ──────────────────────────────────────────────────────────

export function getToken(platform) {
  return localStorage.getItem(TOKEN_KEYS[platform]) ?? ''
}

export function setToken(platform, token) {
  if (token.trim()) {
    localStorage.setItem(TOKEN_KEYS[platform], token.trim())
  } else {
    localStorage.removeItem(TOKEN_KEYS[platform])
  }
}

export function hasToken(platform) {
  return !!getToken(platform)
}

// ─── Netlify ──────────────────────────────────────────────────────────────────

/**
 * Hämtar senaste deploy för ett Netlify-projekt.
 * @param {string} siteId  — site_id från Netlify Site settings → General
 * @returns {{ status, state, createdAt, url, branch, commitRef, errorMessage }}
 */
export async function fetchNetlifyDeploy(siteId) {
  const token = getToken('netlify')
  if (!token) throw new Error('Netlify-token saknas. Ange den i projektets inställningar.')
  if (!siteId) throw new Error('site_id saknas. Ange det i projektets konfigpanel.')

  const res = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}/deploys?per_page=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!res.ok) {
    if (res.status === 401) throw new Error('Netlify-token ogiltig eller återkallad.')
    if (res.status === 404) throw new Error('Netlify site_id hittades inte.')
    throw new Error(`Netlify API svarade med ${res.status}`)
  }

  const [deploy] = await res.json()
  if (!deploy) throw new Error('Inga deploys hittades för detta projekt.')

  return normalizeDeploy(deploy, 'netlify')
}

/**
 * Hämtar site-info (namn, URL, etc.) från Netlify.
 * Användbart för att verifiera att site_id är korrekt.
 */
export async function fetchNetlifySiteInfo(siteId) {
  const token = getToken('netlify')
  if (!token) throw new Error('Netlify-token saknas.')

  const res = await fetch(
    `https://api.netlify.com/api/v1/sites/${siteId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error(`Netlify API svarade med ${res.status}`)
  const site = await res.json()
  return { name: site.name, url: site.ssl_url ?? site.url, id: site.id }
}

/**
 * Listar alla Netlify-sajter för det inloggade kontot.
 * Användbart för att välja rätt site_id.
 */
export async function listNetlifySites() {
  const token = getToken('netlify')
  if (!token) throw new Error('Netlify-token saknas.')

  const res = await fetch(
    'https://api.netlify.com/api/v1/sites?per_page=100',
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error(`Netlify API svarade med ${res.status}`)
  const sites = await res.json()
  return sites.map(s => ({ id: s.id, name: s.name, url: s.ssl_url ?? s.url }))
}

// ─── Vercel ───────────────────────────────────────────────────────────────────

/**
 * Hämtar senaste deployment för ett Vercel-projekt.
 * @param {string} projectSlug — projektnamnet på Vercel (syns i URL:en)
 * @returns {{ status, state, createdAt, url, branch, commitRef, errorMessage }}
 */
export async function fetchVercelDeploy(projectSlug) {
  const token = getToken('vercel')
  if (!token) throw new Error('Vercel-token saknas. Ange den i projektets inställningar.')
  if (!projectSlug) throw new Error('Projektnamn saknas. Ange det i projektets konfigpanel.')

  // `app` = projektnamnet (t.ex. "my-app") — inte deploy-URL:ens slug
  const res = await fetch(
    `https://api.vercel.com/v6/deployments?app=${encodeURIComponent(projectSlug)}&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!res.ok) {
    if (res.status === 401) throw new Error('Vercel-token ogiltig eller återkallad.')
    if (res.status === 403) throw new Error('Vercel 403: tokenen saknar behörighet. Skapa ny token på vercel.com/account/tokens med Full Account-scope.')
    if (res.status === 404) throw new Error('Vercel-projektet hittades inte. Kontrollera att projektnamnet stämmer exakt.')
    throw new Error(`Vercel API svarade med ${res.status}`)
  }

  const data = await res.json()
  // API returnerar { deployments: [...] } eller direkt en array
  const deployments = data.deployments ?? data
  if (!Array.isArray(deployments) || !deployments.length) throw new Error('Inga deployments hittades för detta projekt.')

  return normalizeDeploy(deployments[0], 'vercel')
}

// ─── Normalisering ────────────────────────────────────────────────────────────

/**
 * Normaliserar deploy-data från Netlify/Vercel till ett gemensamt format.
 */
function normalizeDeploy(raw, platform) {
  if (platform === 'netlify') {
    const stateMap = {
      ready:      'success',
      building:   'building',
      processing: 'building',
      error:      'failed',
      new:        'unknown',
    }
    return {
      status:       stateMap[raw.state] ?? 'unknown',
      rawState:     raw.state,
      createdAt:    raw.created_at,
      publishedAt:  raw.published_at,
      url:          raw.deploy_ssl_url ?? raw.deploy_url,
      branch:       raw.branch,
      commitRef:    raw.commit_ref,
      commitUrl:    raw.commit_url,
      title:        raw.title,
      errorMessage: raw.error_message ?? null,
      duration:     raw.deploy_time ? `${raw.deploy_time}s` : null,
    }
  }

  if (platform === 'vercel') {
    const stateMap = {
      READY:    'success',
      BUILDING: 'building',
      ERROR:    'failed',
      CANCELED: 'failed',
      QUEUED:   'building',
    }
    return {
      status:      stateMap[raw.state] ?? 'unknown',
      rawState:    raw.state,
      createdAt:   new Date(raw.createdAt).toISOString(),
      publishedAt: raw.ready ? new Date(raw.ready).toISOString() : null,
      url:         raw.url ? `https://${raw.url}` : null,
      branch:      raw.meta?.githubCommitRef ?? null,
      commitRef:   raw.meta?.githubCommitSha?.slice(0, 7) ?? null,
      title:       raw.meta?.githubCommitMessage ?? null,
      errorMessage: null,
      duration:    null,
    }
  }
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

/**
 * Hämtar deploy-status för ett projekt baserat på plattform.
 * Returnerar normaliserat deploy-objekt.
 */
export async function refreshDeploy(project) {
  const platform = (project.platform ?? '').toLowerCase()

  if (platform === 'netlify') {
    return fetchNetlifyDeploy(project.siteId)
  }
  if (platform === 'vercel') {
    return fetchVercelDeploy(project.projectSlug)
  }
  throw new Error(`Plattform "${project.platform}" stöds ej ännu.`)
}
