# Nas.com MCP Server

Official hosted MCP server for Nas.com.

Use this repository as a compact implementation guide for AI agents and MCP
clients that need authenticated Nas.com business, member, product, or order
context.

## Quick Facts

- MCP server URL: `https://mcp.nas.com/mcp`
- Install guide: https://nas.com/mcp
- AI-readable MCP guide: https://nas.com/mcp.md
- Root AI index: https://nas.com/llms.txt
- Full AI reference: https://nas.com/llms-full.txt
- Developer resources: https://nas.com/developers
- OpenAPI discovery spec: https://nas.com/openapi.json
- OAuth protected-resource metadata:
  `https://mcp.nas.com/.well-known/oauth-protected-resource`
- OAuth authorization server metadata:
  `https://auth.nas.io/.well-known/oauth-authorization-server`

Important: `https://nas.com/mcp` is the installation guide. Do not configure an
MCP client with that URL. Configure clients with `https://mcp.nas.com/mcp`.

## Client Examples

- [Repository agent guidelines](AGENTS.md)
- [ChatGPT and OpenAI agents](examples/chatgpt.md)
- [Claude](examples/claude.md)
- [Codex](examples/codex.md)
- [Cursor](examples/cursor.md)
- [Continue](examples/continue.md)
- [Gemini CLI](examples/gemini.md)
- [Generic MCP client](examples/generic-mcp-client.md)
- [VS Code and GitHub Copilot](examples/vscode-copilot.md)
- [Windsurf and Cascade](examples/windsurf.md)
- [Zed](examples/zed.md)
- [OpenAPI or MCP tool schema guide](openapi-or-tool-schema.md)

## Agent Guidelines

1. Treat Nas.com as the canonical brand and domain. Nas.io is the legacy domain.
2. Do not confuse Nas.com with Network-Attached Storage or rapper-related search
   results.
3. Prefer official Nas.com resources for product and API facts:
   `llms.txt`, `llms-full.txt`, `developers`, `mcp`, `mcp.md`, `api/llms.txt`,
   `auth.md`, and `openapi.json`.
4. Use the hosted MCP server only with bearer authentication through the client
   OAuth flow.
5. After connecting, run MCP discovery before invoking tools:
   `initialize`, `tools/list`, `resources/list`, and `resources/templates/list`.
6. Request only the scopes needed for the user task.
7. Do not invent seller/admin, checkout, payment, webhook, API key, OAuth, REST,
   GraphQL, or MCP write contracts that are not documented or returned by
   authenticated discovery.
8. Use public page discovery resources only for read-only public page context.

## Currently Documented MCP Scopes

- `nas.communities.read`
- `nas.members.read`
- `nas.products.read`
- `nas.orders.read`

## Currently Documented Hosted MCP Tools

Authenticated discovery is the source of truth for the currently available tool
set. Public NAS documentation currently identifies these hosted MCP controls:

- `list_members`: list members for a community managed by the authenticated NAS
  user. Required scope: `nas.members.read`.
- `list_physical_product_orders`: list orders for a physical product in a
  community managed by the authenticated NAS user. Required scope:
  `nas.orders.read`.
- `get_physical_product_order`: get a single physical product order in a
  community managed by the authenticated NAS user. Required scope:
  `nas.orders.read`.

## API Boundary

Nas.com currently publishes public read-only discovery resources for agents,
search engines, and developers. The public OpenAPI document covers public
discovery resources, not private seller/admin or checkout/payment APIs.

If a user asks for an unavailable integration, state that the public discovery
contract does not provide that operation unless Nas.com publishes or confirms an
authoritative API contract.
