import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const binary = new URL('../dist/index.js', import.meta.url);
function run(args, input = '', token = '', holdInput = false) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [fileURLToPath(binary), ...args], {
      env: { ...process.env, NAS_ACCESS_TOKEN: token }, windowsHide: true,
    });
    let stdout = '', stderr = '';
    child.stdout.on('data', data => stdout += data);
    child.stderr.on('data', data => stderr += data);
    child.on('close', code => resolve({ code, stdout, stderr }));
    if (!holdInput) child.stdin.end(input);
  });
}
async function fixture(fn, body) {
  const requests = [];
  const server = createServer(async (req, res) => {
    let data = '';
    for await (const chunk of req) data += chunk;
    requests.push({ url: req.url, headers: req.headers, body: data ? JSON.parse(data) : null });
    fn(req, res, data ? JSON.parse(data) : null);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await body(`http://127.0.0.1:${server.address().port}`, requests); }
  finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}
function mcp(req, res, message) {
  if (req.method === 'GET') { res.writeHead(405).end(); return; }
  if (message.id === undefined) { res.writeHead(202).end(); return; }
  let result;
  if (message.method === 'initialize') result = { protocolVersion: message.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: 'test', version: '1' } };
  else if (message.method === 'tools/list') result = { tools: [
    { name: 'read', inputSchema: { type: 'object' }, annotations: { readOnlyHint: true } },
    { name: 'write', inputSchema: { type: 'object' } },
  ] };
  else result = { content: [{ type: 'text', text: JSON.stringify(message.params.arguments) }] };
  res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ jsonrpc: '2.0', id: message.id, result }));
}
test('help/version and invalid arguments have stable output', async () => {
  assert.match((await run(['--help'])).stdout, /tools call/);
  assert.equal(JSON.parse((await run(['--version'])).stdout).version, '0.1.0');
  assert.equal((await run(['bogus'])).code, 2);
});
test('public discovery uses v1, encodes context and never attaches token', async () => {
  await fixture((req, res) => res.end('{"ok":true}'), async (url, requests) => {
    for (const command of [['discovery'], ['openapi'], ['context', '/a?x=1&secret=2']]) {
      const result = await run([...command, '--base-url', url], '', 'super-secret');
      assert.equal(result.code, 0, result.stderr);
      assert.deepEqual(JSON.parse(result.stdout), { ok: true });
    }
    assert.equal(requests[0].url, '/api/v1/agent-mode');
    assert.equal(requests[1].url, '/openapi.json');
    assert.equal(new URL(requests[2].url, url).searchParams.get('path'), '/a?x=1&secret=2');
    assert.ok(requests.every(r => !r.headers.authorization));
  });
});
test('HTTP/nonJSON errors redact body and timeout terminates', async () => {
  await fixture((req, res) => res.writeHead(401).end('super-secret'), async url => {
    const result = await run(['discovery', '--base-url', url], '', 'super-secret');
    assert.equal(result.code, 1); assert.equal(result.stdout, '');
    assert.doesNotMatch(result.stderr, /super-secret/);
  });
  await fixture((req, res) => res.end('private text'), async url => {
    assert.equal((await run(['openapi', '--base-url', url])).code, 1);
  });
  await fixture(() => {}, async url => {
    assert.equal((await run(['discovery', '--base-url', url, '--timeout', '50'])).code, 1);
  });
});
test('MCP requires token and guards write calls, forwarding auth/key and stdin JSON', async () => {
  assert.equal((await run(['tools', 'list'])).code, 2);
  await fixture(mcp, async (url, requests) => {
    const base = ['--mcp-url', `${url}/mcp`];
    assert.equal((await run(['tools', 'list', ...base], '', 'secret')).code, 0);
    assert.equal((await run(['tools', 'call', 'write', ...base], '', 'secret')).code, 2);
    assert.equal((await run(['tools', 'call', 'write', '--confirm', ...base], '', 'secret')).code, 2);
    assert.equal((await run(['tools', 'call', 'read', '--args-file', '-', ...base], '{"x":1}', 'secret')).code, 0);
    const result = await run(['tools', 'call', 'write', '--confirm', '--idempotency-key', 'one', '--args-file', '-', ...base], '{"x":2}', 'secret');
    assert.equal(result.code, 0, result.stderr);
    const calls = requests.filter(r => r.body?.method === 'tools/call');
    assert.equal(calls.length, 2);
    assert.equal(calls[1].headers.authorization, 'Bearer secret');
    assert.equal(calls[1].headers['idempotency-key'], 'one');
    assert.deepEqual(calls[1].body.params.arguments, { x: 2 });
  });
});

test('argument file/object validation and unknown tool opt-in', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'nas-cli-args-'));
  const path = join(directory, 'args.json');
  await writeFile(path, '{"from":"file"}');
  await fixture(mcp, async (url, requests) => {
    const base = ['--mcp-url', `${url}/mcp`];
    assert.equal((await run(['tools', 'call', 'read', '--args-file', path, ...base], '', 'secret')).code, 0);
    assert.equal((await run(['tools', 'call', 'read', '--args-file', '-', ...base], '[]', 'secret')).code, 2);
    assert.equal((await run(['tools', 'call', 'unknown', ...base], '', 'secret')).code, 2);
    assert.equal(requests.filter(r => r.body?.method === 'tools/call').length, 1);
    assert.deepEqual(requests.find(r => r.body?.method === 'tools/call').body.params.arguments, { from: 'file' });
  });
});

test('MCP HTTP/SDK diagnostics exclude tokens and do not retry writes', async () => {
  for (const status of [401, 500]) {
    await fixture((req, res, message) => {
      if (message?.method === 'tools/call') res.writeHead(status).end('Bearer secret and private upstream details');
      else mcp(req, res, message);
    }, async (url, requests) => {
      const result = await run(['tools', 'call', 'write', '--confirm', '--idempotency-key', 'key', '--mcp-url', `${url}/mcp`], '', 'secret');
      assert.equal(result.code, 1);
      assert.equal(result.stdout, '');
      assert.doesNotMatch(result.stderr, /secret|private upstream/);
      assert.equal(requests.filter(r => r.body?.method === 'tools/call').length, 1);
    });
  }
});

test('MCP paginated catalog retains read-only annotation and returns tool errors', async () => {
  await fixture((req, res, message) => {
    if (message?.method === 'tools/list') {
      const result = message.params?.cursor ? { tools: [{ name: 'paged', inputSchema: { type: 'object' }, annotations: { readOnlyHint: true } }] } : { tools: [], nextCursor: 'next' };
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ jsonrpc: '2.0', id: message.id, result }));
    } else if (message?.method === 'tools/call') {
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ jsonrpc: '2.0', id: message.id, result: { content: [{ type: 'text', text: 'validation failed' }], isError: true } }));
    } else mcp(req, res, message);
  }, async url => {
    const result = await run(['tools', 'call', 'paged', '--mcp-url', `${url}/mcp`], '', 'secret');
    assert.equal(result.code, 1);
    assert.equal(JSON.parse(result.stdout).isError, true);
    assert.equal(result.stderr, '');
  });
});

test('endpoint and option validation happens without exposing user input', async () => {
  for (const args of [
    ['discovery', '--base-url', 'http://example.com'],
    ['discovery', '--base-url', 'https://secret@example.com'],
    ['discovery', '--timeout', '0'],
    ['tools', 'list', '--idempotency-key', 'bad'],
    ['context'],
  ]) {
    const result = await run(args);
    assert.equal(result.code, 2);
    assert.equal(result.stdout, '');
    assert.doesNotMatch(result.stderr, /secret/);
  }
});

test('stdin obeys the command deadline and reports a request timeout', async () => {
  const result = await run(['tools', 'call', 'read', '--args-file', '-', '--timeout', '50'], '', 'secret', true);
  assert.equal(result.code, 1);
  assert.equal(JSON.parse(result.stderr).error, 'REQUEST_FAILED');
});

test('idempotency keys match the server 200-character limit before networking', async () => {
  await fixture(mcp, async (url, requests) => {
    const args = ['tools', 'call', 'write', '--confirm', '--mcp-url', `${url}/mcp`, '--idempotency-key'];
    assert.equal((await run([...args, 'k'.repeat(200)], '', 'secret')).code, 0);
    const before = requests.length;
    const result = await run([...args, 'k'.repeat(201)], '', 'secret');
    assert.equal(result.code, 2);
    assert.equal(requests.length, before);
  });
});

test('MCP stdout redacts configured tokens in success, tool errors and catalogs', async () => {
  const token = 'test"\\token';
  for (const isError of [false, true]) {
    await fixture((req, res, message) => {
      if (message?.method === 'tools/call') {
        const result = {
          content: [{ type: 'text', text: `useful result ${req.headers.authorization}` }], isError,
          structuredContent: { nested: [token, { [token]: `prefix ${token} suffix` }, 42, null] },
        };
        res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ jsonrpc: '2.0', id: message.id, result }));
      } else if (message?.method === 'tools/list') {
        res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ jsonrpc: '2.0', id: message.id, result: { tools: [{ name: 'read', description: `useful description ${token}`, inputSchema: { type: 'object' }, annotations: { readOnlyHint: true } }] } }));
      } else mcp(req, res, message);
    }, async url => {
      const base = ['--mcp-url', `${url}/mcp`];
      const result = await run(['tools', 'call', 'read', ...base], '', token);
      assert.equal(result.code, isError ? 1 : 0);
      const output = JSON.parse(result.stdout);
      assert.equal(output.content[0].text, 'useful result Bearer [REDACTED]');
      assert.deepEqual(output.structuredContent.nested, ['[REDACTED]', { '[REDACTED]': 'prefix [REDACTED] suffix' }, 42, null]);
      assert.equal(output.isError, isError);
      assert.equal(result.stderr, '');
      const catalog = JSON.parse((await run(['tools', 'list', ...base], '', token)).stdout);
      assert.equal(catalog.tools[0].description, 'useful description [REDACTED]');
    });
  }
});
