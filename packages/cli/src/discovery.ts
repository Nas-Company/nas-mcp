export class UsageError extends Error {}

// Never include upstream response bodies, URLs, arguments or SDK errors in diagnostics.
export function endpoint(value: string): URL {
  let url: URL;
  try { url = new URL(value); } catch { throw new UsageError('Invalid endpoint URL.'); }
  if (url.username || url.password || url.search || url.hash ||
      (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) {
    throw new UsageError('Endpoints require HTTPS (HTTP is allowed only on loopback), without credentials, query or fragment.');
  }
  return url;
}

export async function discovery(command: string, base: URL, path: string | undefined, signal: AbortSignal): Promise<unknown> {
  const url = new URL(command === 'openapi' ? '/openapi.json' : command === 'context' ? '/api/v1/agent/page-context' : '/api/v1/agent-mode', base);
  if (path !== undefined) url.searchParams.set('path', path);
  const response = await fetch(url, { signal, redirect: 'error', headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error('HTTP request failed.');
  return response.json();
}
