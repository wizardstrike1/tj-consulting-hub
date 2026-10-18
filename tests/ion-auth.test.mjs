import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

let sequence = 0;
async function setup() {
  const auth = await import(`../src/lib/ion-auth.ts?test=${sequence++}`);
  const storage = new Map();
  const requests = [];
  const replies = [];
  let navigation;
  const redirects = [];
  let cleaned = false;
  globalThis.sessionStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key)
  };
  globalThis.window = {
    location: {
      origin: 'https://tjconsulting.org', pathname: '/auth/callback/', search: '',
      assign: (url) => { navigation = new URL(url); },
      replace: (url) => { redirects.push(url); }
    },
    history: { replaceState: () => { cleaned = true; } },
    dispatchEvent: () => {}
  };
  globalThis.fetch = async (url, init) => {
    assert.ok(cleaned, 'Remove the authorization code from the URL before requests');
    requests.push({ url, init });
    const reply = replies.shift();
    if (reply instanceof Error) throw reply;
    assert.ok(reply, 'Unexpected extra fetch');
    return reply;
  };
  await auth.beginIonLogin();
  const transactionKey = 'tj-consulting:ion-transaction';
  const identityKey = 'tj-consulting:ion-identity';
  const transaction = JSON.parse(storage.get(transactionKey));
  window.location.search = `?state=${transaction.state}&code=test-authorization-code`;
  return { auth, storage, requests, replies, transaction, transactionKey, identityKey, navigation, redirects };
}

const json = (body) => ({ ok: true, json: async () => body });
const validToken = () => json({ access_token: 'test-access-token', token_type: 'Bearer', expires_in: 3600 });

test('login uses S256 PKCE, read-only scope, random state, and no client secret', async () => {
  const { transaction, navigation } = await setup();
  assert.equal(navigation.origin, 'https://ion.tjhsst.edu');
  assert.equal(navigation.pathname, '/oauth/authorize/');
  assert.equal(navigation.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(navigation.searchParams.get('code_challenge'), createHash('sha256').update(transaction.verifier).digest('base64url'));
  assert.match(transaction.state, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(navigation.searchParams.get('scope'), 'read');
  assert.equal(navigation.searchParams.get('redirect_uri'), 'https://tjconsulting.org/auth/callback/');
  assert.equal(navigation.searchParams.has('client_secret'), false);
});

for (const scenario of ['missing', 'mismatched', 'expired', 'duplicate-state', 'duplicate-code']) {
  test(`rejects ${scenario} callback without exchanging a code`, async () => {
    const { auth, storage, requests, transaction, transactionKey } = await setup();
    if (scenario === 'missing') storage.delete(transactionKey);
    if (scenario === 'mismatched') window.location.search = '?state=incorrect&code=test-authorization-code';
    if (scenario === 'expired') storage.set(transactionKey, JSON.stringify({ ...transaction, createdAt: Date.now() - 11 * 60 * 1000 }));
    if (scenario === 'duplicate-state') window.location.search += `&state=${transaction.state}`;
    if (scenario === 'duplicate-code') window.location.search += '&code=another-code';
    await assert.rejects(auth.completeIonLogin());
    assert.equal(requests.length, 0);
    assert.equal(storage.has(transactionKey), false);
  });
}

test('cancelled approval leaves no signed-in identity', async () => {
  const { auth, storage, requests, transaction, identityKey } = await setup();
  window.location.search = `?state=${transaction.state}&error=access_denied`;
  await assert.rejects(auth.completeIonLogin(), /cancelled/);
  assert.equal(requests.length, 0);
  assert.equal(storage.has(identityKey), false);
});

test('exchanges code only once, fetches profile, and retains no tokens', async () => {
  const { auth, storage, requests, replies, transaction, identityKey } = await setup();
  replies.push(validToken(), json({ ion_username: '2028tester', first_name: 'Test', last_name: 'Student', extra_private_field: 'discard-me' }));
  const [first, second] = await Promise.all([auth.completeIonLogin(), auth.completeIonLogin()]);
  assert.deepEqual(first, second);
  assert.equal(first.name, 'Test Student');
  assert.equal(requests.length, 2);
  const body = new URLSearchParams(requests[0].init.body);
  assert.equal(body.get('code_verifier'), transaction.verifier);
  assert.equal(body.get('client_secret'), null);
  assert.equal(requests[1].init.headers.Authorization, 'Bearer test-access-token');
  const retained = storage.get(identityKey);
  assert.ok(retained);
  assert.equal(retained.includes('test-access-token'), false);
  assert.equal(retained.includes('discard-me'), false);
  assert.equal(retained.includes('test-authorization-code'), false);
  assert.deepEqual(auth.readIdentity(), first);
  auth.signOut();
  assert.equal(auth.readIdentity(), null);
});

test('network/CORS failure reports the problem without a false login', async () => {
  const { auth, storage, replies, identityKey } = await setup();
  replies.push(new TypeError('Failed to fetch'));
  await assert.rejects(auth.completeIonLogin(), /blocking browser access/);
  assert.equal(storage.has(identityKey), false);
});

test('invalid profile cannot create an identity', async () => {
  const { auth, storage, replies, identityKey } = await setup();
  replies.push(validToken(), json({ first_name: 'Unverified' }));
  await assert.rejects(auth.completeIonLogin(), /username/);
  assert.equal(storage.has(identityKey), false);
});

test('invalid token cannot be used to fetch a profile', async () => {
  const { auth, replies, requests } = await setup();
  replies.push(json({ access_token: 'test-token', token_type: 'wrong', expires_in: 3600 }));
  await assert.rejects(auth.completeIonLogin(), /valid access token/);
  assert.equal(requests.length, 1);
});

test('expired cached identity is removed', async () => {
  const { auth, storage, identityKey } = await setup();
  storage.set(identityKey, JSON.stringify({ name: 'Test', username: 'tester', expiresAt: Date.now() - 1 }));
  assert.equal(auth.readIdentity(), null);
  assert.equal(storage.has(identityKey), false);
});

test('successful callback returns home with identity and no error notice', async () => {
  const { auth, replies, redirects } = await setup();
  replies.push(validToken(), json({ ion_username: '2028tester' }));
  await auth.returnHomeAfterIonLogin();
  assert.deepEqual(redirects, ['/']);
  assert.equal(auth.readIdentity().username, '2028tester');
  assert.equal(auth.takeLoginNotice(), null);
});

test('failed callback returns home with a one-time notice and no identity', async () => {
  const { auth, replies, redirects } = await setup();
  replies.push(new TypeError('Failed to fetch'));
  await auth.returnHomeAfterIonLogin();
  assert.deepEqual(redirects, ['/']);
  assert.equal(auth.readIdentity(), null);
  assert.match(auth.takeLoginNotice(), /Ion could not complete sign-in/);
  assert.equal(auth.takeLoginNotice(), null);
});
