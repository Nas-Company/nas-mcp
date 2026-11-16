#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { readFile } from 'node:fs/promises';
import { discovery, endpoint, UsageError } from './discovery.js';
import { mcp } from './mcp.js';

const HELP = {
  usage: 'nas discovery|openapi|context <path> | nas tools list | nas tools call <name>',
  options: {
    '--help': 'Print help', '--version': 'Print version',
    '--base-url': 'Public discovery origin (default https://nas.com)',
    '--mcp-url': 'Hosted MCP endpoint (default https://mcp.nas.com/mcp)',
    '--timeout': 'Whole command deadline in milliseconds (default 30000, maximum 300000)',
    '--args-file': 'Tool JSON object file, or - for stdin (default empty object)',
    '--confirm': 'Explicitly opt into a tool not annotated read-only',
    '--idempotency-key': 'Required operation key for non-read-only calls',
  },
  authentication: 'MCP commands require NAS_ACCESS_TOKEN. Credentials are never persisted.',
};

async function main(): Promise<void> {
  let parsed;
  try {
    parsed = parseArgs({ allowPositionals: true, options: {
      help: { type: 'boolean' }, version: { type: 'boolean' }, confirm: { type: 'boolean' },
      'base-url': { type: 'string' }, 'mcp-url': { type: 'string' }, timeout: { type: 'string' },
      'args-file': { type: 'string' }, 'idempotency-key': { type: 'string' },
    } });
  } catch { throw new UsageError('Invalid arguments. Use --help.'); }
  const { values, positionals } = parsed;
  if (values.version) { output({ version: '0.1.0' }); return; }
  if (values.help || positionals.length === 0) { output(HELP); return; }
  const [command, action, name] = positionals;
  const timeout = Number(values.timeout ?? 30000);
  if (!Number.isSafeInteger(timeout) || timeout < 1 || timeout > 300000) throw new UsageError('Invalid --timeout.');
  if (values['idempotency-key'] !== undefined && !/^[\x21-\x7e]{1,200}$/.test(values['idempotency-key'])) throw new UsageError('--idempotency-key must be 1-200 visible ASCII characters.');
  const signal = AbortSignal.timeout(timeout);
  let result: unknown;
  if (['discovery', 'openapi', 'context'].includes(command)) {
    if (positionals.length !== (command === 'context' ? 2 : 1) || values.confirm || values['idempotency-key'] || values['args-file'] || values['mcp-url']) throw new UsageError('Invalid discovery arguments. Use --help.');
    const base = endpoint(values['base-url'] ?? 'https://nas.com');
    if (base.pathname !== '/') throw new UsageError('--base-url must be an origin.');
    result = await discovery(command, base, command === 'context' ? action : undefined, signal);
  } else if (command === 'tools' && ['list', 'call'].includes(action)) {
    if (positionals.length !== (action === 'call' ? 3 : 2) || values['base-url'] || (action === 'list' && (values.confirm || values['args-file'] || values['idempotency-key']))) throw new UsageError('Invalid tools arguments. Use --help.');
    const token = process.env.NAS_ACCESS_TOKEN;
    if (!token || /[\r\n]/.test(token)) throw new UsageError('Set NAS_ACCESS_TOKEN to a valid scoped access token.');
    let args: unknown = {};
    if (values['args-file']) {
      let source: string;
      try {
        source = values['args-file'] === '-' ? await readStdin(signal) : await readFile(values['args-file'], { encoding: 'utf8', signal });
        args = JSON.parse(source);
      } catch {
        signal.throwIfAborted();
        throw new UsageError('Cannot read tool arguments as JSON.');
      }
      if (args === null || Array.isArray(args) || typeof args !== 'object') throw new UsageError('Tool arguments must be a JSON object.');
    }
    result = await mcp({ url: endpoint(values['mcp-url'] ?? 'https://mcp.nas.com/mcp'), token, signal, timeout, command: action, name, args: args as Record<string, unknown>, confirm: values.confirm === true, key: values['idempotency-key'] });
    output(result, token);
    if (result && typeof result === 'object' && 'isError' in result && result.isError === true) process.exitCode = 1;
    return;
  } else throw new UsageError('Unknown command. Use --help.');
  output(result);
}

function redact(value: unknown, token: string | undefined): unknown {
  if (!token) return value;
  if (typeof value === 'string') return value.split(token).join('[REDACTED]');
  if (Array.isArray(value)) return value.map(item => redact(item, token));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key.split(token).join('[REDACTED]'), redact(item, token),
    ]));
  }
  return value;
}
function output(value: unknown, token?: string): void { process.stdout.write(`${JSON.stringify(redact(value, token))}\n`); }
async function readStdin(signal: AbortSignal): Promise<string> {
  signal.throwIfAborted();
  let data = '';
  const abort = () => process.stdin.destroy(new Error('Input timed out.'));
  signal.addEventListener('abort', abort, { once: true });
  try { for await (const chunk of process.stdin) data += chunk; return data; }
  finally { signal.removeEventListener('abort', abort); }
}

main().catch(error => {
  // Only locally authored usage messages are safe. Remote bodies and SDK messages may contain credentials.
  const usage = error instanceof UsageError;
  process.stderr.write(`${JSON.stringify(redact({ error: usage ? 'USAGE' : 'REQUEST_FAILED', message: usage ? error.message : 'Request failed or timed out. Check endpoint, token scopes and service availability.' }, process.env.NAS_ACCESS_TOKEN))}\n`);
  process.exitCode = usage ? 2 : 1;
});
