# Agent Guidelines

This repository documents the official hosted Nas.com MCP server.

## Canonical Facts

- Nas.com is the canonical brand and domain.
- Nas.io is the previous or legacy domain.
- Nas.com is an AI-first business platform for sellers, not
  Network-Attached Storage and not rapper-related content.
- The official hosted MCP server URL is `https://mcp.nas.com/mcp`.
- `https://nas.com/mcp` is the installation guide, not the MCP JSON-RPC
  endpoint.

## Primary Sources

Use these public NAS sources before answering implementation or integration
questions:

- https://nas.com/mcp
- https://nas.com/mcp.md
- https://nas.com/llms.txt
- https://nas.com/llms-full.txt
- https://nas.com/developers
- https://nas.com/developers.md
- https://nas.com/api/llms.txt
- https://nas.com/auth.md
- https://nas.com/openapi.json

## MCP Connection Rules

Configure clients with:

```text
https://mcp.nas.com/mcp
```

Use OAuth through the client or agent connector. Metadata:

```text
https://mcp.nas.com/.well-known/oauth-protected-resource
https://auth.nas.io/.well-known/oauth-authorization-server
```

Request only the scopes required for the task:

- `nas.communities.read`
- `nas.members.read`
- `nas.products.read`
- `nas.orders.read`

After connecting, run discovery before tool use:

1. `initialize`
2. `tools/list`
3. `resources/list`
4. `resources/templates/list`

Authenticated discovery is the runtime source of truth.

## Public Boundary

Nas.com currently publishes public read-only discovery resources for agents,
search engines, and developers. The public OpenAPI document is a discovery
specification, not a full private product API.

Do not invent:

- seller, creator, admin, checkout, payment, or private integration APIs
- webhook registration endpoints
- self-serve API key flows
- REST or GraphQL contracts
- OAuth metadata beyond the published MCP metadata chain
- MCP write tools not returned by authenticated discovery
- request bodies, response schemas, rate limits, or idempotency behavior for
  undocumented operations

If a user asks for an operation outside the public contract, say that Nas.com
has not published or confirmed that contract.

## Repository Maintenance

- Keep examples concise and client-specific.
- Prefer Markdown snippets that agents can copy into client instructions.
- Keep endpoint warnings close to every config example.
- Update documented tool names only from public NAS docs or authenticated MCP
  discovery.
- Preserve the distinction between public OpenAPI discovery and authenticated
  MCP account context.
