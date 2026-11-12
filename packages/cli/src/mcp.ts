import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { UsageError } from './discovery.js';

export interface McpOptions {
  url: URL; token: string; signal: AbortSignal; timeout: number;
  command: string; name?: string; args: Record<string, unknown>; confirm: boolean; key?: string;
}

export async function mcp(options: McpOptions): Promise<unknown> {
  const client = new Client({ name: '@nas/cli', version: '0.1.0' });
  const transport = new StreamableHTTPClientTransport(options.url, {
    requestInit: { headers: { Authorization: `Bearer ${options.token}` } },
    reconnectionOptions: { maxRetries: 0, initialReconnectionDelay: 1000, maxReconnectionDelay: 1000, reconnectionDelayGrowFactor: 1 },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      // Only the actual mutating invocation receives the caller's idempotency key.
      if (typeof init?.body === 'string' && JSON.parse(init.body).method === 'tools/call' && options.key) {
        headers.set('Idempotency-Key', options.key);
      }
      const signal = init?.signal ? AbortSignal.any([options.signal, init.signal]) : options.signal;
      const response = await fetch(input, { ...init, headers, signal, redirect: 'error' });
      if (!response.ok && response.status !== 405) throw new Error('MCP HTTP request failed.');
      return response;
    },
  });
  const abort = () => { void transport.close(); };
  options.signal.addEventListener('abort', abort, { once: true });
  try {
    await client.connect(transport, { timeout: options.timeout });
    const tools = [];
    const cursors = new Set<string>();
    let cursor: string | undefined;
    do {
      const page = await client.listTools(cursor ? { cursor } : {}, { signal: options.signal, timeout: options.timeout });
      tools.push(...page.tools);
      cursor = page.nextCursor;
      if (cursor && cursors.has(cursor)) throw new Error('Repeated tools cursor.');
      if (cursor) cursors.add(cursor);
    } while (cursor);
    if (options.command === 'list') return { tools };
    const tool = tools.find(tool => tool.name === options.name);
    if (tool?.annotations?.readOnlyHint !== true) {
      if (!options.confirm) throw new UsageError('This tool requires --confirm. Review its effects before proceeding.');
      if (!options.key) throw new UsageError('This tool requires --idempotency-key. Reuse it only for the same intended operation.');
    }
    return await client.callTool({ name: options.name!, arguments: options.args }, undefined, { signal: options.signal, timeout: options.timeout });
  } finally {
    options.signal.removeEventListener('abort', abort);
    await client.close();
  }
}
