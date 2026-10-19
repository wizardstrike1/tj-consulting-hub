import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { handleLogin, handleCallback, handleSession, handleLogout, seal, unseal } from '../src/lib/server/ion-auth.ts';

const origin = 'https://tjconsulting.org';
const secret = 'unit-test-only-key-0123456789abcdef0123456789';
const clientSecret = 'unit-test-only-client-secret';
const cookieName = '__Host-tjconsulting-oauth';
const sessionName = '__Host-tjconsulting-session';
const json = (data) => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
const token = () => json({ access_token: 'test-access-token', refresh_token: 'test-refresh-token', token_type: 'Bearer', expires_in: 3600 });
const profile = () => json({ id: 123, ion_username: '2028tester', first_name: 'Test', last_name: 'Student', private_field: 'discard-me' });
const getCookie = (response, name) => response.headers.getSetCookie().find((value) => value.startsWith(name + '='));
const cookieValue = (response, name) => getCookie(response, name)?.split(';')[0].slice(name.length + 1);
const request = (path, cookies = '', init = {}) => new Request(origin + path, { ...init, headers: { ...init.headers, ...(cookies ? { Cookie: cookies } : {}) } });

async function setup() {
  process.env.AUTH_BASE_URL = origin;
  process.env.ION_CLIENT_ID = 'test-client-id';
  process.env.ION_CLIENT_SECRET = clientSecret;
  process.env.AUTH_SESSION_SECRET = secret;
  const calls = [], replies = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    const reply = replies.shift();
    assert.ok(reply, 'Unexpected network request');
    if (reply instanceof Error) throw reply;
    return reply;
  };
  const login = await handleLogin(request('/api/auth/login/'));
  const authorization = new URL(login.headers.get('Location'));
  const value = cookieValue(login, cookieName);
  const transaction = unseal(value, 'oauth', secret);
  const callback = (extra = '') => request('/auth/callback/?state=' + transaction.state + '&code=test-code' + extra, cookieName + '=' + value);
  return { login, authorization, value, transaction, callback, calls, replies };
}

test('login uses state and S256 PKCE in an encrypted, secure, HTTP-only transaction cookie', async () => {
  const { login, authorization, transaction } = await setup();
  assert.equal(login.status, 302);
  assert.equal(authorization.origin, 'https://ion.tjhsst.edu');
  assert.equal(authorization.searchParams.get('scope'), 'read');
  assert.equal(authorization.searchParams.get('response_type'), 'code');
  assert.equal(authorization.searchParams.get('redirect_uri'), origin + '/auth/callback/');
  assert.equal(authorization.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(authorization.searchParams.get('code_challenge'), createHash('sha256').update(transaction.verifier).digest('base64url'));
  assert.match(transaction.state, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(authorization.searchParams.has('client_secret'), false);
  assert.match(getCookie(login, cookieName), /HttpOnly; SameSite=Lax; Max-Age=600; Secure/);
  assert.equal(login.headers.get('Cache-Control'), 'no-store');
});

for (const scenario of ['missing', 'tampered', 'expired', 'wrong-state', 'duplicate-state', 'duplicate-code']) {
  test('rejects ' + scenario + ' callback before any Ion request', async () => {
    const { transaction, value, callback, calls } = await setup();
    let req = callback();
    if (scenario === 'missing') req = request(new URL(req.url).pathname + new URL(req.url).search);
    if (scenario === 'tampered') req = request('/auth/callback/?state=' + transaction.state + '&code=x', cookieName + '=' + value + 'broken');
    if (scenario === 'expired') req = request('/auth/callback/?state=' + transaction.state + '&code=x', cookieName + '=' + seal({ ...transaction, expiresAt: Date.now() - 1 }, 'oauth', secret));
    if (scenario === 'wrong-state') req = request('/auth/callback/?state=wrong&code=x', cookieName + '=' + value);
    if (scenario === 'duplicate-state') req = callback('&state=' + transaction.state);
    if (scenario === 'duplicate-code') req = callback('&code=other');
    const response = await handleCallback(req);
    assert.equal(calls.length, 0);
    assert.equal(response.headers.get('Location'), origin + '/');
    assert.equal(cookieValue(response, '__Host-tjconsulting-notice'), 'invalid');
    assert.match(getCookie(response, cookieName), /Max-Age=0/);
    assert.equal(getCookie(response, sessionName), undefined);
  });
}

test('cancelled approval returns home without creating a session', async () => {
  const { value, transaction, calls } = await setup();
  const response = await handleCallback(request('/auth/callback/?state=' + transaction.state + '&error=access_denied', cookieName + '=' + value));
  assert.equal(calls.length, 0);
  assert.equal(cookieValue(response, '__Host-tjconsulting-notice'), 'cancelled');
});

test('server exchanges the code and returns home with only an encrypted identity cookie', async () => {
  const { callback, replies, calls, transaction } = await setup();
  replies.push(token(), profile());
  const response = await handleCallback(callback());
  assert.equal(response.headers.get('Location'), origin + '/');
  assert.equal(calls.length, 2);
  const body = new URLSearchParams(calls[0].init.body);
  assert.equal(body.get('client_secret'), clientSecret);
  assert.equal(body.get('code_verifier'), transaction.verifier);
  assert.equal(body.get('code'), 'test-code');
  assert.equal(calls[0].init.headers.Origin, undefined);
  assert.equal(calls[1].init.headers.Authorization, 'Bearer test-access-token');
  assert.equal(calls[0].init.redirect, 'error');
  const session = cookieValue(response, sessionName);
  const identity = unseal(session, 'session', secret);
  assert.equal(identity.username, '2028tester');
  assert.equal(identity.name, 'Test Student');
  assert.deepEqual(Object.keys(identity).sort(), ['expiresAt', 'id', 'name', 'username']);
  assert.match(getCookie(response, sessionName), /HttpOnly; SameSite=Lax; Max-Age=3600; Secure/);
  const allHeaders = JSON.stringify([...response.headers]);
  for (const sensitive of ['test-access-token', 'test-refresh-token', clientSecret, 'test-code', 'discard-me']) assert.equal(allHeaders.includes(sensitive), false);
  const me = handleSession(request('/api/auth/me/', sessionName + '=' + session));
  assert.deepEqual((await me.json()).identity, identity);
  assert.equal(me.headers.get('Cache-Control'), 'no-store');
  assert.equal(me.headers.get('Vary'), 'Cookie');
});

test('supports Ion profile username derived from tj_email', async () => {
  const { callback, replies } = await setup();
  replies.push(token(), json({ id: 42, tj_email: '2028tester@tjhsst.edu', full_name: 'Test Student' }));
  const response = await handleCallback(callback());
  assert.equal(unseal(cookieValue(response, sessionName), 'session', secret).username, '2028tester');
});

for (const failure of ['network', 'token-rejection', 'invalid-token', 'invalid-profile']) {
  test(failure + ' never creates a signed-in session', async () => {
    const { callback, replies } = await setup();
    if (failure === 'network') replies.push(new TypeError('Failed to fetch'));
    if (failure === 'token-rejection') replies.push(new Response('Sensitive server details', { status: 401 }));
    if (failure === 'invalid-token') replies.push(json({ access_token: 'invalid' }));
    if (failure === 'invalid-profile') replies.push(token(), json({ first_name: 'Unverified' }));
    const response = await handleCallback(callback());
    assert.equal(response.headers.get('Location'), origin + '/');
    assert.equal(cookieValue(response, '__Host-tjconsulting-notice'), 'unavailable');
    assert.equal(cookieValue(response, sessionName), undefined);
  });
}

test('session integrity rejects tampering, expiry, wrong key, and transaction substitution', async () => {
  await setup();
  const payload = { id: '1', name: 'Test', username: 'tester', expiresAt: Date.now() + 10000 };
  const session = seal(payload, 'session', secret);
  assert.equal(unseal(session + '.extra', 'session', secret), null);
  assert.equal(unseal(session, 'oauth', secret), null);
  assert.equal(unseal(session, 'session', 'different-key-0123456789abcdef0123456789'), null);
  assert.equal(unseal(seal({ ...payload, expiresAt: Date.now() - 1 }, 'session', secret), 'session', secret), null);
  const forged = handleSession(request('/api/auth/me/', sessionName + '=' + Buffer.from(JSON.stringify(payload)).toString('base64url')));
  assert.equal((await forged.json()).identity, null);
  const substituted = handleSession(request('/api/auth/me/', sessionName + '=' + seal(payload, 'oauth', secret)));
  assert.equal((await substituted.json()).identity, null);
});

test('logout requires a same-origin POST and clears all auth cookies', async () => {
  await setup();
  assert.equal(handleLogout(request('/api/auth/logout/', '', { method: 'POST', headers: { Origin: 'https://attacker.example' } })).status, 403);
  assert.equal(handleLogout(request('/api/auth/logout/', '', { method: 'POST' })).status, 403);
  assert.equal(handleLogout(request('/api/auth/logout/', '', { headers: { Origin: origin } })).status, 403);
  const response = handleLogout(request('/api/auth/logout/', '', { method: 'POST', headers: { Origin: origin } }));
  assert.equal(response.status, 204);
  assert.equal(response.headers.getSetCookie().length, 3);
  for (const value of response.headers.getSetCookie()) assert.match(value, /Max-Age=0/);
});

test('missing server configuration fails safely and leaves public pages available', async () => {
  await setup();
  delete process.env.ION_CLIENT_SECRET;
  const response = await handleLogin(request('/api/auth/login/'));
  assert.equal(response.headers.get('Location'), origin + '/');
  assert.equal(cookieValue(response, '__Host-tjconsulting-notice'), 'unconfigured');
  const me = handleSession(request('/api/auth/me/'));
  assert.equal((await me.json()).identity, null);
});

test('only known, one-time error notices are returned to the browser', async () => {
  await setup();
  const response = handleSession(request('/api/auth/me/', '__Host-tjconsulting-notice=unavailable'));
  assert.match((await response.json()).notice, /could not complete sign-in/);
  assert.match(getCookie(response, '__Host-tjconsulting-notice'), /Max-Age=0/);
  const forged = handleSession(request('/api/auth/me/', '__Host-tjconsulting-notice=constructor'));
  assert.equal((await forged.json()).notice, null);
});

test('canonical login redirect cannot be changed by an incoming host', async () => {
  await setup();
  const response = await handleLogin(new Request('https://attacker.example/api/auth/login/'));
  assert.equal(response.headers.get('Location'), origin + '/api/auth/login/');
  assert.equal(response.headers.getSetCookie().length, 0);
});

test('explicit localhost origin supports HTTP development without weakening public cookie settings', async () => {
  await setup();
  process.env.AUTH_BASE_URL = 'http://localhost:3217';
  const response = await handleLogin(new Request('http://localhost:3217/api/auth/login/'));
  assert.equal(new URL(response.headers.get('Location')).origin, 'https://ion.tjhsst.edu');
  const transaction = getCookie(response, 'tjconsulting-oauth');
  assert.match(transaction, /HttpOnly/);
  assert.equal(transaction.includes('; Secure'), false);
  process.env.AUTH_BASE_URL = 'http://tjconsulting.org';
  const rejected = await handleLogin(request('/api/auth/login/'));
  assert.equal(rejected.headers.get('Location'), origin + '/');
  assert.equal(cookieValue(rejected, '__Host-tjconsulting-notice'), 'unconfigured');
});

test('a forged callback cannot log out an existing authenticated session', async () => {
  const { login } = await setup();
  const identity = { id: '1', username: 'tester', name: 'Test', expiresAt: Date.now() + 10000 };
  const session = seal(identity, 'session', secret);
  const response = await handleCallback(request('/auth/callback/?state=forged&code=dummy', sessionName + '=' + session));
  assert.equal(getCookie(response, sessionName), undefined);
  assert.equal(getCookie(login, sessionName), undefined);
  const me = handleSession(request('/api/auth/me/', sessionName + '=' + session));
  assert.deepEqual((await me.json()).identity, identity);
});
