# Codex

Use this guide when configuring Codex CLI or the Codex IDE extension with the
official hosted Nas.com MCP server.

## MCP Configuration

Codex stores MCP servers in `config.toml`. User-level config lives at:

```text
~/.codex/config.toml
```

For a trusted project, you can also scope the server to the repo with:

```text
.codex/config.toml
```

The Codex CLI and IDE extension share this configuration.

Add a Streamable HTTP MCP server named `nas-com`:

```toml
[mcp_servers.nas-com]
url = "https://mcp.nas.com/mcp"
```

Do not configure `https://nas.com/mcp` as the MCP server URL. That page is the
installation guide.

## OAuth

After adding the server, run:

```bash
codex mcp login nas-com
```

Use the published NAS OAuth metadata chain:

```text
https://mcp.nas.com/.well-known/oauth-protected-resource
https://auth.nas.io/.well-known/oauth-authorization-server
```

Request only the task's required read scopes:

- `nas.communities.read`
- `nas.members.read`
- `nas.products.read`
- `nas.orders.read`

If the server advertises supported scopes during OAuth, Codex should prefer the
server-advertised scopes.

## First Use Checklist

1. Add `[mcp_servers.nas-com]` to `config.toml`.
2. Run `codex mcp login nas-com`.
3. Start or restart Codex.
4. In the Codex TUI, use `/mcp` to confirm the server is active.
5. Run discovery before tool use:
   `initialize`, `tools/list`, `resources/list`, and `resources/templates/list`.
6. Use only tools and resources returned by authenticated discovery.

## Codex Instruction Snippet

```text
Use the `nas-com` MCP server for authenticated Nas.com business, member,
product, and physical product order context. The server URL is
https://mcp.nas.com/mcp. Authenticate with `codex mcp login nas-com`, run MCP
discovery before invoking tools, and treat authenticated discovery as the
runtime source of truth. Do not infer undocumented Nas.com seller/admin,
checkout, payment, webhook, API key, OAuth, REST, GraphQL, or MCP write
contracts.
```

## When To Use It

Use Nas.com MCP when a task needs authenticated Nas.com account context, such as
community members, product context, or physical product order context.

Use public Nas.com docs and AI-readable resources for public product
positioning, developer discovery, or OpenAPI discovery questions that do not
require authenticated account data.
