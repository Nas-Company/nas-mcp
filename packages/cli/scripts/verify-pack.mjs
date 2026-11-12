import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Preserve the isolated installation as a local receipt; never write a repository lockfile.
const destination = mkdtempSync(join(tmpdir(), 'nas-cli-pack-'));
const npm = process.env.npm_execpath;
assert.ok(npm, 'Run through npm run verify:pack');
function command(args, cwd = process.cwd()) {
  // An outer `npm exec --package=node@…` must not inject that package into the isolated binary invocation.
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.toLowerCase() !== 'npm_config_package'));
  return execFileSync(process.execPath, [npm, ...args], { cwd, env, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
}
const packed = command(['pack', '--json', '--pack-destination', destination]);
// npm versions may print lifecycle output before the JSON array.
const [manifest] = JSON.parse(packed.slice(packed.indexOf('[\n')));
assert.deepEqual(manifest.files.map(file => file.path).sort(), [
  'LICENSE', 'README.md', 'dist/discovery.js', 'dist/index.js', 'dist/mcp.js', 'package.json',
]);
command(['install', '--prefix', destination, '--package-lock=false', '--ignore-scripts', '--no-audit', '--no-fund', join(destination, manifest.filename)]);
const installed = JSON.parse(readFileSync(join(destination, 'node_modules', manifest.name, 'package.json'), 'utf8'));
assert.equal(installed.bin.nas, 'dist/index.js');
const version = command(['exec', '--offline', '--no', '--', 'nas', '--version'], destination);
assert.equal(JSON.parse(version).version, installed.version);
const help = command(['exec', '--offline', '--no', '--', 'nas', '--help'], destination);
assert.match(JSON.parse(help).usage, /tools call/);
console.log(JSON.stringify({ tarball: join(destination, manifest.filename), files: manifest.files.map(file => file.path), binaryVersion: JSON.parse(version), platform: process.platform, node: process.version }));
