# Nas.com MCP Server

Official hosted MCP server for Nas.com.

Use this repository as a compact implementation guide for AI agents and MCP
clients that need Nas.com onboarding, business, member, product, or order
context. Clients can connect and discover tools anonymously; OAuth begins only
when a protected operation requires it.

## Quick Facts

- MCP server URL: `https://mcp.nas.com/mcp`
- [Install guide](https://nas.com/mcp)
- [AI-readable MCP guide](https://nas.com/mcp.md)
- [Root AI index](https://nas.com/llms.txt)
- [Full AI reference](https://nas.com/llms-full.txt)
- [Developer resources](https://nas.com/developers)
- [OpenAPI discovery spec](https://nas.com/openapi.json)
- OAuth protected-resource metadata:
  `https://mcp.nas.com/.well-known/oauth-protected-resource`
- OAuth authorization server metadata:
  `https://auth.nas.com/.well-known/oauth-authorization-server`

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
4. Connect and run discovery without forcing sign-in. Start OAuth only when a
   protected tool returns an authentication challenge.
5. After connecting, call `initialize`, send `notifications/initialized`, then
   call `tools/list`.
6. Request only the scopes needed for the protected user task.
7. Do not invent seller/admin, checkout, payment, webhook, API key, OAuth, REST,
   GraphQL, or MCP write contracts that are not documented or returned by
   live discovery.
8. Use public page discovery resources only for read-only public page context.

## Currently Documented MCP Scopes

- `nas.communities.read`
- `nas.communities.write`
- `nas.members.read`
- `nas.products.read`
- `nas.products.write`
- `nas.orders.read`

## Lazy Authentication

The hosted server allows these protocol calls without a bearer token:

- `initialize`
- `notifications/initialized`
- `ping`
- `tools/list`

The anonymous text-only onboarding path consists of:

- `create_image_asset_upload` only with `useCase: "onboarding"`
- `create_onboarded_business`
- `get_onboarding_plan_options`
- `generate_plan_checkout_link`

All other tools require OAuth. When a protected call returns a bearer
challenge, complete the advertised OAuth flow and retry the original tool.
Supplying invalid credentials never falls back to anonymous access.

Tool authentication metadata is part of live `tools/list`: anonymous tools
advertise `noauth` plus optional OAuth, while protected tools advertise OAuth.
The server is stateless and may return refreshed credentials in
`X-NAS-Access-Token` and `X-NAS-Refresh-Token`; clients should persist them in
secure credential storage.

## Business Authorization

Authentication establishes identity; it does not guarantee access to every
business action. Before collecting inputs for a protected business tool, call
`check_business_tool_access` with the business and intended tool.

- A blocked free business cannot use protected business features, including
  draft product or event creation, even when an individual feature row says it
  is allowed.
- A free grace-period business may continue only when the preflight explicitly
  allows the feature. Show its warning and verified resubscribe link first.
- Permission-check failures are not approval. Retry only when the result says
  the failure is retryable.
- Use only verified plan-change or resubscribe links returned by tools; never
  construct a checkout URL.

Authorization, validation, pricing, and temporary-service failures are not
signals that a tool is missing. A protected `401` is an OAuth challenge;
permission and plan failures use their structured MCP result contracts.

## Representative Protected Tools

Live discovery is the source of truth for the currently available tool set.
Representative protected controls include:

- `get_current_user`: return the normalized profile for the authenticated
  Nas.com user.
- `check_business_tool_access`: verify plan and feature access before a
  protected business action.
- `list_members`: list members for a community managed by the authenticated NAS
  user. Required scope: `nas.members.read`.
- `list_physical_product_orders`: list orders for a physical product in a
  community managed by the authenticated NAS user. Required scope:
  `nas.orders.read`.
- `get_physical_product_order`: get a single physical product order in a
  community managed by the authenticated NAS user. Required scope:
  `nas.orders.read`.

This is intentionally not an exhaustive catalog. Use live `tools/list` and the
returned schemas and descriptions.

## API Boundary

Nas.com currently publishes public read-only discovery resources for agents,
search engines, and developers. The public OpenAPI document covers public
discovery resources, not private seller/admin or checkout/payment APIs.

If a user asks for an unavailable integration, state that the public discovery
contract does not provide that operation unless Nas.com publishes or confirms an
authoritative API contract.
