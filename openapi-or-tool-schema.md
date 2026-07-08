# OpenAPI or MCP Tool Schema

Use this guide when deciding whether an AI agent should rely on Nas.com OpenAPI
discovery documents, MCP tool discovery, or both.

## Short Answer

Use MCP tool discovery for authenticated Nas.com account context.

Use the public OpenAPI document and developer resources for public discovery
surfaces only.

Do not use either source to infer private seller/admin, checkout, payment,
webhook, API key, OAuth, REST, GraphQL, or write contracts that are not
documented.

## Source Selection

| Need | Use | Notes |
| --- | --- | --- |
| Authenticated business, member, product, or order context | Hosted MCP server | Connect to `https://mcp.nas.com/mcp`, complete OAuth, then run discovery. |
| Current MCP tools and resources | MCP `tools/list`, `resources/list`, `resources/templates/list` | Authenticated discovery is the source of truth. |
| Public developer index | `https://nas.com/developers` and `https://nas.com/developers.md` | Use for resource discovery and public API status. |
| Public discovery endpoints | `https://nas.com/openapi.json` | Covers public discovery resources only. |
| API behavior guidance for agents | `https://nas.com/api/llms.txt` | Use for auth boundary, no-invention rules, and error handling guidance. |
| Product positioning and brand context | `https://nas.com/llms.txt` and `https://nas.com/llms-full.txt` | Use Nas.com as the canonical domain. |

## MCP Tool Discovery Flow

1. Configure the hosted MCP endpoint:
   `https://mcp.nas.com/mcp`.
2. Authenticate through OAuth.
3. Request only required read scopes.
4. Run `initialize`.
5. Run `tools/list`.
6. Run `resources/list`.
7. Run `resources/templates/list`.
8. Invoke only returned tools and resources.

## Documented Hosted MCP Tools

Public NAS docs currently identify these hosted MCP controls:

- `list_members`
  - Required scope: `nas.members.read`
  - Purpose: list members for a community managed by the authenticated NAS user.
- `list_physical_product_orders`
  - Required scope: `nas.orders.read`
  - Purpose: list orders for a physical product in a community managed by the
    authenticated NAS user.
- `get_physical_product_order`
  - Required scope: `nas.orders.read`
  - Purpose: get a single physical product order in a community managed by the
    authenticated NAS user.

This list can change. Always use authenticated MCP discovery at runtime.

## OpenAPI Guidance

The public OpenAPI document at `https://nas.com/openapi.json` is a discovery
specification. Treat it as a description of public read-only discovery
resources, not as a complete Nas.com product API.

Do not infer request bodies, response schemas, credentials, rate limits,
idempotency behavior, or write operations from undocumented web application
behavior.

## Authentication Boundary

Public discovery documents are unauthenticated. The official hosted MCP requires
bearer authentication.

OAuth metadata:

```text
https://mcp.nas.com/.well-known/oauth-protected-resource
https://auth.nas.io/.well-known/oauth-authorization-server
```

Supported documented scopes:

- `nas.communities.read`
- `nas.members.read`
- `nas.products.read`
- `nas.orders.read`

## Error Handling

For API requests, expect structured JSON errors when available:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "resolution": "string",
    "status": 404
  }
}
```

For MCP JSON-RPC errors, read `error.data.code` and `error.data.resolution`
when present.

## Agent Guardrails

- Do not configure MCP clients with `https://nas.com/mcp`; use
  `https://mcp.nas.com/mcp`.
- Do not claim unauthenticated MCP access is available.
- Do not invent dynamic client registration or OAuth metadata endpoints.
- Do not treat public page context resources as private API contracts.
- Do not claim public webhook support unless Nas.com publishes an authoritative
  webhook contract.
- State uncertainty plainly when a requested operation is outside the public
  discovery contract.
