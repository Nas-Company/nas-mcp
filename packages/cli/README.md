# Nas.com CLI

Official command-line client for [Nas.com](https://nas.com). It reads the
public discovery resources and calls tools on the hosted MCP server at
`https://mcp.nas.com/mcp`. The binary is `nas` and needs Node.js 22 or later.

> The npm package is not published yet. Until it is, build from source (see
> [Development](#development)). The package name `@nas/cli` is provisional.

## Commands

```sh
nas --help
nas --version
nas discovery
nas openapi
nas context '/your-public-business'
nas tools list
nas tools call <read_tool> --args-file arguments.json
nas tools call <write_tool> --args-file - --confirm --idempotency-key <unique-operation-key>
```

| Command | What it does | Default endpoint |
|---|---|---|
| `discovery` | Agent discovery document | `https://nas.com/api/v1/agent-mode` |
| `openapi` | Public OpenAPI discovery spec | `https://nas.com/openapi.json` |
| `context <path>` | Public page context for one path | `https://nas.com/api/v1/agent/page-context` |
| `tools list` | Live MCP tool catalog | `https://mcp.nas.com/mcp` |
| `tools call <name>` | Call one MCP tool | `https://mcp.nas.com/mcp` |

Options:

- `--base-url <origin>`: discovery origin. Default `https://nas.com`.
- `--mcp-url <url>`: MCP endpoint. Default `https://mcp.nas.com/mcp`.
- `--timeout <ms>`: whole-command deadline. Default 30000, maximum 300000.
- `--args-file <path|->`: tool arguments as a JSON object; `-` reads stdin.
  Omitting it sends `{}`.
- `--confirm` and `--idempotency-key <key>`: both required for any tool that
  is not annotated `readOnlyHint: true`.

Endpoints must use HTTPS; loopback HTTP is allowed for local testing.
Redirects are rejected.

## Authentication

Discovery commands need no credentials and never send a token.

`tools` commands require a scoped bearer token in the `NAS_ACCESS_TOKEN`
environment variable. The CLI does not log in, refresh, or store credentials.
See <https://nas.com/auth.md> for the OAuth flow and scopes.

## Write safety

Tools not annotated `readOnlyHint: true`, including unknown tool names,
require both `--confirm` and `--idempotency-key`. The key (1 to 200 visible
ASCII characters) is sent as the `Idempotency-Key` header on the tool call.
The server stays responsible for idempotency, scopes and any further
confirmation.

The CLI never retries a write and never makes a purchase on its own. After an
ambiguous failure, check server state before retrying with the same key and
identical arguments. Use a new key for each distinct operation.

## Output and exit codes

- Success: JSON on stdout, exit 0. Help and version are also JSON.
- Tool result with `isError: true`: JSON on stdout, exit 1.
- Usage or authentication error: JSON diagnostic on stderr, exit 2.
- Transport, HTTP, invalid response or timeout: fixed JSON diagnostic on
  stderr, exit 1. Upstream error bodies and SDK messages are not echoed.

Occurrences of the configured access token are replaced with `[REDACTED]` in
all output. Tool output can still contain other data your token is allowed to
read, so handle stdout accordingly.

## Development

```sh
cd packages/cli
npm install --no-package-lock
npm test
npm run verify:pack
node dist/index.js --help
```

`verify:pack` packs the explicit file allowlist, installs the tarball into a
temporary directory and runs the installed binary.

## Releasing

Releases run from the manual `CLI release` workflow on `master`, using npm
trusted publishing with provenance. The workflow refuses to publish unless the
`npm-release` environment sets `NAS_CLI_PUBLICATION_APPROVED=true` and the
requested version matches `package.json`.

## License

[MIT](LICENSE)
