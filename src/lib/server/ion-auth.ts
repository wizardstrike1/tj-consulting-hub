// Node-only module. Never import this file into a client component.
import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const DEFAULT_ORIGIN = 'https://tjconsulting.org';
const TRANSACTION_TTL = 600;
const SESSION_TTL = 3600;
type Payload = Record<string, unknown> & { expiresAt: number };
type Config = { origin: string; clientId: string; clientSecret: string; secret: string; secure: boolean };
export type Identity = { id: string; username: string; name: string; expiresAt: number };

function siteOrigin() {
  const url = new URL(process.env.AUTH_BASE_URL || DEFAULT_ORIGIN);
  const local = ['localhost', '127.0.0.1'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Invalid AUTH_BASE_URL');
  }
  return url.origin;
}

function config(): Config {
  const origin = siteOrigin();
  const clientId = process.env.ION_CLIENT_ID;
  const clientSecret = process.env.ION_CLIENT_SECRET;
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!clientId || !clientSecret || !secret || secret.length < 32) throw new Error('Missing server authentication settings');
  return { origin, clientId, clientSecret, secret, secure: origin.startsWith('https:') };
}

function cookieName(kind: string, secure: boolean) {
  return `${secure ? '__Host-' : ''}tjconsulting-${kind}`;
}

function cookie(kind: string, value: string, maxAge: number, secure: boolean) {
  return `${cookieName(kind, secure)}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

function readCookie(request: Request, kind: string, secure: boolean) {
  const name = cookieName(kind, secure);
  return (request.headers.get('cookie') || '').split(';')
    .map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

// Encrypt as well as authenticate cookie contents, with separate purposes for
// OAuth transactions and sessions so one can never be substituted for the other.
export function seal(payload: Payload, purpose: string, secret: string) {
  const iv = randomBytes(12);
  const key = createHash('sha256').update(secret).digest();
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(`tjconsulting:${purpose}:v1`));
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64url'), encrypted.toString('base64url'), cipher.getAuthTag().toString('base64url')].join('.');
}

export function unseal(value: string | undefined, purpose: string, secret: string): Payload | null {
  if (!value || value.length > 4096 || secret.length < 32) return null;
  try {
    const parts = value.split('.');
    if (parts.length !== 4 || parts[0] !== 'v1' || parts.slice(1).some((part) => !/^[A-Za-z0-9_-]+$/.test(part))) return null;
    const [, iv, encrypted, tag] = parts.map((part) => Buffer.from(part, 'base64url'));
    if (iv.length !== 12 || tag.length !== 16) return null;
    const decipher = createDecipheriv('aes-256-gcm', createHash('sha256').update(secret).digest(), iv);
    decipher.setAAD(Buffer.from(`tjconsulting:${purpose}:v1`));
    decipher.setAuthTag(tag);
    const result = JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8'));
    if (!result || typeof result !== 'object' || !Number.isFinite(result.expiresAt) || result.expiresAt <= Date.now()) return null;
    return result;
  } catch { return null; }
}

function headers() {
  return new Headers({ 'Cache-Control': 'no-store', Pragma: 'no-cache', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex' });
}

function redirect(location: string, cookies: string[] = []) {
  const h = headers();
  h.set('Location', location);
  for (const value of cookies) h.append('Set-Cookie', value);
  return new Response(null, { status: 302, headers: h });
}

function homeWithNotice(reason: string, secure: boolean, origin: string) {
  return redirect(`${origin}/`, [
    cookie('oauth', '', 0, secure),
    cookie('notice', reason, 60, secure)
  ]);
}

function fallbackOrigin() {
  try { return siteOrigin(); } catch { return DEFAULT_ORIGIN; }
}

export async function handleLogin(request: Request) {
  let c: Config;
  try { c = config(); }
  catch { const origin = fallbackOrigin(); return homeWithNotice('unconfigured', origin.startsWith('https:'), origin); }
  // Use the configured canonical host, never a caller-supplied Host header.
  if (new URL(request.url).origin !== c.origin) return redirect(`${c.origin}/api/auth/login/`);
  const state = randomBytes(32).toString('base64url');
  const verifier = randomBytes(32).toString('base64url');
  const transaction = seal({ state, verifier, expiresAt: Date.now() + TRANSACTION_TTL * 1000 }, 'oauth', c.secret);
  const url = new URL('https://ion.tjhsst.edu/oauth/authorize/');
  url.search = new URLSearchParams({
    client_id: c.clientId, redirect_uri: `${c.origin}/auth/callback/`,
    response_type: 'code', scope: 'read', state,
    code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256'
  }).toString();
  return redirect(url.toString(), [
    cookie('oauth', transaction, TRANSACTION_TTL, c.secure),
    cookie('notice', '', 0, c.secure)
  ]);
}

function sameState(expected: unknown, actual: string | null) {
  if (typeof expected !== 'string' || !actual) return false;
  const a = Buffer.from(expected), b = Buffer.from(actual);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function ionJson(url: string, init: RequestInit, stage: string) {
  let response;
  try {
    response = await fetch(url, { ...init, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
  } catch { throw new Error(`Ion ${stage} connection failed`); }
  if (!response.ok) throw new Error(`Ion ${stage} returned HTTP ${response.status}`);
  try { return await response.json(); }
  catch { throw new Error(`Ion ${stage} returned invalid JSON`); }
}

export async function handleCallback(request: Request) {
  let c: Config;
  try { c = config(); }
  catch { const origin = fallbackOrigin(); return homeWithNotice('unconfigured', origin.startsWith('https:'), origin); }
  const url = new URL(request.url);
  const transaction = unseal(readCookie(request, 'oauth', c.secure), 'oauth', c.secret);
  if (url.origin !== c.origin || !transaction ||
      typeof transaction.verifier !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(transaction.verifier) ||
      url.searchParams.getAll('state').length !== 1 || !sameState(transaction.state, url.searchParams.get('state'))) {
    return homeWithNotice('invalid', c.secure, c.origin);
  }
  if (url.searchParams.has('error')) {
    return homeWithNotice(url.searchParams.get('error') === 'access_denied' ? 'cancelled' : 'unavailable', c.secure, c.origin);
  }
  const code = url.searchParams.get('code');
  if (!code || url.searchParams.getAll('code').length !== 1) return homeWithNotice('invalid', c.secure, c.origin);
  try {
    const token = await ionJson('https://ion.tjhsst.edu/oauth/token/', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code', client_id: c.clientId, client_secret: c.clientSecret,
        redirect_uri: `${c.origin}/auth/callback/`, code, code_verifier: transaction.verifier
      }).toString()
    }, 'token endpoint');
    const lifetime = Number(token?.expires_in);
    if (typeof token?.access_token !== 'string' || !token.access_token ||
        typeof token.token_type !== 'string' || token.token_type.toLowerCase() !== 'bearer' ||
        !Number.isFinite(lifetime) || lifetime <= 0) throw new Error('Ion returned an invalid token');
    const profile = await ionJson('https://ion.tjhsst.edu/api/profile', {
      headers: { Authorization: `Bearer ${token.access_token}` }
    }, 'profile endpoint');
    const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
    const username = text(profile?.ion_username) || text(profile?.username) ||
      (text(profile?.tj_email).endsWith('@tjhsst.edu') ? text(profile.tj_email).split('@')[0] : '');
    const id = typeof profile?.id === 'number' || typeof profile?.id === 'string' ? String(profile.id) : '';
    const name = text(profile?.full_name) || [text(profile?.first_name), text(profile?.last_name)].filter(Boolean).join(' ') || username;
    if (!id || !username || username.length > 100 || name.length > 200) throw new Error('Ion returned an invalid profile');
    const maxAge = Math.max(1, Math.floor(Math.min(lifetime, SESSION_TTL)));
    const identity = { id, username, name, expiresAt: Date.now() + maxAge * 1000 };
    // Discard the OAuth tokens. The app needs only a short-lived identity cookie.
    return redirect(`${c.origin}/`, [
      cookie('oauth', '', 0, c.secure), cookie('notice', '', 0, c.secure),
      cookie('session', seal(identity, 'session', c.secret), maxAge, c.secure)
    ]);
  } catch (error) {
    // Only sanitized stage/status errors; never log codes, secrets, tokens, or profiles.
    console.warn(error instanceof Error && error.message.startsWith('Ion ') ? error.message : 'Ion login failed');
    return homeWithNotice('unavailable', c.secure, c.origin);
  }
}

export function handleSession(request: Request) {
  const h = headers();
  h.set('Content-Type', 'application/json');
  h.set('Vary', 'Cookie');
  let identity: Identity | null = null;
  let notice: string | null = null;
  try {
    const c = config();
    const session = unseal(readCookie(request, 'session', c.secure), 'session', c.secret);
    if (session && typeof session.id === 'string' && typeof session.username === 'string' && typeof session.name === 'string') {
      identity = { id: session.id, username: session.username, name: session.name, expiresAt: session.expiresAt };
    } else if (readCookie(request, 'session', c.secure)) {
      h.append('Set-Cookie', cookie('session', '', 0, c.secure));
    }
  } catch { /* A public page still works before the server is configured. */ }
  const origin = fallbackOrigin(), secure = origin.startsWith('https:');
  const reason = readCookie(request, 'notice', secure);
  const notices: Record<string, string> = {
    cancelled: 'Ion login was cancelled.', invalid: 'This login attempt expired or could not be verified. Please try again.',
    unavailable: 'Ion could not complete sign-in. Please try again later.', unconfigured: 'Login is not configured yet.'
  };
  if (reason) {
    notice = Object.hasOwn(notices, reason) ? notices[reason] : null;
    h.append('Set-Cookie', cookie('notice', '', 0, secure));
  }
  return new Response(JSON.stringify({ identity, notice }), { headers: h });
}

export function handleLogout(request: Request) {
  const origin = fallbackOrigin(), secure = origin.startsWith('https:');
  if (request.method !== 'POST' || request.headers.get('origin') !== origin || new URL(request.url).origin !== origin) {
    return new Response(null, { status: 403, headers: headers() });
  }
  const h = headers();
  for (const kind of ['session', 'oauth', 'notice']) h.append('Set-Cookie', cookie(kind, '', 0, secure));
  return new Response(null, { status: 204, headers: h });
}
