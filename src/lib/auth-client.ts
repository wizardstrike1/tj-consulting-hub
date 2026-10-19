export type IonIdentity = { id: string; username: string; name: string; expiresAt: number };
type AuthSession = { identity: IonIdentity | null; notice: string | null };

// Deduplicate React Strict Mode mounts and simultaneous refreshes. The server
// consumes a one-time notice cookie, so both subscribers need the same result.
let pendingSession: Promise<AuthSession> | null = null;
export function getAuthSession(): Promise<AuthSession> {
  if (!pendingSession) {
    pendingSession = fetch('/api/auth/me/', { credentials: 'same-origin', cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not check your session.');
        return await response.json() as AuthSession;
      }).finally(() => { pendingSession = null; });
  }
  return pendingSession;
}

export async function endAuthSession() {
  const response = await fetch('/api/auth/logout/', { method: 'POST', credentials: 'same-origin', cache: 'no-store' });
  if (!response.ok) throw new Error('Could not log out. Please try again.');
}

export function clearLegacyIdentity() {
  try {
    for (const key of ['ion-identity', 'ion-transaction', 'ion-notice']) {
      sessionStorage.removeItem(`tj-consulting:${key}`);
    }
  } catch { /* Server authentication does not require browser storage. */ }
}
