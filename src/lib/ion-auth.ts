// Browser-only login for the static site. This is UI identity, not a server
// authorization boundary. Future private resources must verify users server-side.
export const ION_CLIENT_ID = '3htx6CYG1ITWfoaNNxpfaqQBZOXExPyWp6dKOxAt';
export const ION_REDIRECT_URI = 'https://tjconsulting.org/auth/callback/';
const TRANSACTION_KEY = 'tj-consulting:ion-transaction';
const IDENTITY_KEY = 'tj-consulting:ion-identity';
export const IDENTITY_EVENT = 'ion-identity-change';
export const LOGIN_NOTICE_EVENT = 'ion-login-notice';
const LOGIN_NOTICE_KEY = 'tj-consulting:ion-notice';
const TRANSACTION_LIFETIME = 10 * 60 * 1000;

export type IonIdentity = {
  username: string;
  name: string;
  expiresAt: number;
};

type Transaction = { state: string; verifier: string; createdAt: number };

export function saveLoginNotice(message: string) {
  try { sessionStorage.setItem(LOGIN_NOTICE_KEY, message); }
  catch { /* Navigation must still work when browser storage is unavailable. */ }
}

export function takeLoginNotice(): string | null {
  try {
    const message = sessionStorage.getItem(LOGIN_NOTICE_KEY);
    sessionStorage.removeItem(LOGIN_NOTICE_KEY);
    return message;
  } catch { return null; }
}

export async function returnHomeAfterIonLogin() {
  try { await completeIonLogin(); }
  catch {
    saveLoginNotice('Ion could not complete sign-in. Please try again later.');
  } finally {
    window.location.replace('/');
  }
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function createPkce() {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, challenge: base64url(new Uint8Array(hash)) };
}

export function readIdentity(): IonIdentity | null {
  try {
    const identity = JSON.parse(sessionStorage.getItem(IDENTITY_KEY) || 'null');
    if (identity && typeof identity.username === 'string' &&
        typeof identity.name === 'string' && Number.isFinite(identity.expiresAt) &&
        identity.expiresAt > Date.now()) return identity;
    sessionStorage.removeItem(IDENTITY_KEY);
  } catch { /* Browser storage may be unavailable. */ }
  return null;
}

export function signOut() {
  callbackPromise = undefined;
  sessionStorage.removeItem(IDENTITY_KEY);
  sessionStorage.removeItem(TRANSACTION_KEY);
  window.dispatchEvent(new Event(IDENTITY_EVENT));
}

export async function beginIonLogin() {
  callbackPromise = undefined;
  if (window.location.origin !== new URL(ION_REDIRECT_URI).origin) {
    throw new Error('Please open tjconsulting.org to log in with Ion.');
  }
  const { verifier, challenge } = await createPkce();
  const state = base64url(crypto.getRandomValues(new Uint8Array(32)));
  try {
    sessionStorage.removeItem(IDENTITY_KEY);
    sessionStorage.setItem(TRANSACTION_KEY, JSON.stringify({ state, verifier, createdAt: Date.now() }));
  } catch {
    throw new Error('Allow session storage in your browser to log in.');
  }
  const url = new URL('https://ion.tjhsst.edu/oauth/authorize/');
  url.search = new URLSearchParams({
    client_id: ION_CLIENT_ID,
    redirect_uri: ION_REDIRECT_URI,
    response_type: 'code',
    scope: 'read',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256'
  }).toString();
  window.location.assign(url.toString());
}

async function ionRequest(url: string, init: RequestInit, stage: string) {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init, credentials: 'omit', cache: 'no-store',
      referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(20000)
    });
  } catch {
    throw new Error(`Could not ${stage}. Ion may be blocking browser access from tjconsulting.org, or the connection may be unavailable. Please try again later.`);
  }
  if (!response.ok) {
    // Never surface raw responses, authorization codes, or tokens in the UI/logs.
    throw new Error(`Ion could not ${stage} (HTTP ${response.status}). Please start a new login attempt.`);
  }
  try { return await response.json(); }
  catch { throw new Error('Ion returned an unexpected response. Please try again.'); }
}

// Reuse the same in-flight operation if React remounts the callback. An OAuth
// authorization code is single-use and must never be exchanged twice.
let callbackPromise: Promise<IonIdentity> | undefined;
export function completeIonLogin(): Promise<IonIdentity> {
  if (!callbackPromise) callbackPromise = finishCallback();
  return callbackPromise;
}

async function finishCallback(): Promise<IonIdentity> {
  const params = new URLSearchParams(window.location.search);
  // Remove the code before navigation, analytics, or retrying the page.
  window.history.replaceState(null, '', window.location.pathname);
  let transaction: Transaction | null = null;
  try {
    transaction = JSON.parse(sessionStorage.getItem(TRANSACTION_KEY) || 'null');
  } catch { /* Invalid or unavailable storage is rejected below. */ }
  sessionStorage.removeItem(TRANSACTION_KEY);
  sessionStorage.removeItem(IDENTITY_KEY);
  const age = transaction ? Date.now() - transaction.createdAt : NaN;
  if (window.location.origin !== new URL(ION_REDIRECT_URI).origin ||
      !transaction || typeof transaction.state !== 'string' || !transaction.state ||
      typeof transaction.verifier !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(transaction.verifier) ||
      !Number.isFinite(age) || age < 0 || age > TRANSACTION_LIFETIME ||
      params.getAll('state').length !== 1 || params.get('state') !== transaction.state) {
    throw new Error('This login attempt is missing, expired, or could not be verified. Please start again in the same browser tab.');
  }
  if (params.has('error')) {
    throw new Error(params.get('error') === 'access_denied'
      ? 'Ion login was cancelled. You can try again whenever you are ready.'
      : 'Ion did not approve this login attempt. Please try again.');
  }
  const code = params.get('code');
  if (!code || params.getAll('code').length !== 1) {
    throw new Error('Ion did not return a valid login code. Please try again.');
  }
  const token = await ionRequest('https://ion.tjhsst.edu/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code', client_id: ION_CLIENT_ID,
      redirect_uri: ION_REDIRECT_URI, code, code_verifier: transaction.verifier
    }).toString()
  }, 'complete sign-in');
  if (typeof token.access_token !== 'string' || !token.access_token ||
      typeof token.token_type !== 'string' || token.token_type.toLowerCase() !== 'bearer' ||
      !Number.isFinite(token.expires_in) || token.expires_in <= 0) {
    throw new Error('Ion did not return a valid access token. Please try again.');
  }
  const profile = await ionRequest('https://ion.tjhsst.edu/api/profile', {
    headers: { Authorization: `Bearer ${token.access_token}` }
  }, 'retrieve your profile');
  if (typeof profile.ion_username !== 'string' || !profile.ion_username.trim()) {
    throw new Error('Ion did not return your username. Please try again.');
  }
  const name = [profile.first_name, profile.last_name]
    .filter((part) => typeof part === 'string' && part.trim()).join(' ');
  const identity: IonIdentity = {
    username: profile.ion_username,
    name: name || profile.ion_username,
    expiresAt: Date.now() + Math.min(token.expires_in * 1000, 60 * 60 * 1000)
  };
  // Tokens are used only in memory for this request, never persisted. Retain
  // only the minimal identity for this tab, for at most one hour.
  sessionStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  window.dispatchEvent(new Event(IDENTITY_EVENT));
  return identity;
}
