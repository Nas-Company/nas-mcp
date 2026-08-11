# OpenAPI or MCP Tool Schema

Use this guide when deciding whether an AI agent should rely on Nas.com OpenAPI
discovery documents, MCP tool discovery, or both.

## Short Answer

Use MCP tool discovery for anonymous onboarding and OAuth-protected Nas.com
account context.

Use the public OpenAPI document and developer resources for public discovery
surfaces only.

Do not use either source to infer private seller/admin, checkout, payment,
webhook, API key, OAuth, REST, GraphQL, or write contracts that are not
documented.

## Source Selection

- For business onboarding, connect to the hosted MCP and discover anonymously.
  Use only the onboarding tools that advertise `noauth`.
- For protected business, member, product, or order context, use the hosted MCP.
  Complete OAuth when the selected tool returns an authentication challenge.
- For the current MCP catalog, use `tools/list`. Live discovery is the source
  of truth.
- For the public developer index, use `https://nas.com/developers` and
  `https://nas.com/developers.md`.
- For public discovery endpoints, use `https://nas.com/openapi.json`.
- For agent API behavior, use `https://nas.com/api/llms.txt`.
- For product and brand context, use `https://nas.com/llms.txt` and
  `https://nas.com/llms-full.txt`.

## MCP Tool Discovery Flow

1. Configure the hosted MCP endpoint:
   `https://mcp.nas.com/mcp`.
2. Run `initialize` and send `notifications/initialized`.
3. Run `tools/list` and inspect each tool's security metadata.
4. Invoke an anonymous onboarding tool when it fits the request.
5. If a protected tool challenges, complete OAuth with only the required
   scopes and retry that tool.
6. Invoke only returned tools.

## Representative Protected Tools

The current server includes these representative protected controls:

- `get_current_user`
  - Purpose: return the normalized profile for the authenticated Nas.com user.
- `check_business_tool_access`
  - Purpose: verify plan and feature access before a protected business action.
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

This list is intentionally incomplete and can change. Always use live MCP
discovery at runtime.

## OpenAPI Guidance

The public OpenAPI document at `https://nas.com/openapi.json` is a discovery
specification. Treat it as a description of public read-only discovery
resources, not as a complete Nas.com product API.

Do not infer request bodies, response schemas, credentials, rate limits,
idempotency behavior, or write operations from undocumented web application
behavior.

## Authentication Boundary

Public discovery documents are unauthenticated. The hosted MCP uses lazy
authentication: connection, discovery, and the supported text-only onboarding
path work anonymously; all other tools require a bearer token.

OAuth metadata:

```text
https://mcp.nas.com/.well-known/oauth-protected-resource
https://auth.nas.com/.well-known/oauth-authorization-server
```

Supported documented scopes:

- `nas.communities.read`
- `nas.communities.write`
- `nas.members.read`
- `nas.products.read`
- `nas.products.write`
- `nas.orders.read`

Anonymous onboarding tools are `create_image_asset_upload` with
`useCase: "onboarding"`, `create_onboarded_business`,
`get_onboarding_plan_options`, and `generate_plan_checkout_link`. Protected
business tools additionally enforce business, plan, and feature authorization.
Use `check_business_tool_access` before offering a protected action or
collecting its inputs.

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
- Do not require sign-in merely to connect, discover tools, or use the
  documented anonymous onboarding path.
- Do not treat authentication as proof that a protected business action is
  authorized.
- Do not invent dynamic client registration or OAuth metadata endpoints.
- Do not treat public page context resources as private API contracts.
- Do not claim public webhook support unless Nas.com publishes an authoritative
  webhook contract.
- State uncertainty plainly when a requested operation is outside the public
  discovery contract.
