# Generic MCP Client

Use this guide for any MCP-compatible client that supports remote Streamable
HTTP servers and OAuth.

## Endpoint

Configure the MCP server endpoint exactly as:

```text
https://mcp.nas.com/mcp
```

Do not configure `https://nas.com/mcp` as the MCP endpoint. That page is the
installation guide.

## Transport

Use Streamable HTTP.

Custom clients should send MCP JSON-RPC 2.0 requests over HTTP and follow the
MCP transport rules for session handling, streaming, initialization, and
tools.

## Authentication

The hosted server uses lazy authentication. Connect and discover tools without
a bearer token. Use OAuth through the published metadata chain only when a
protected tool challenges:

```text
https://mcp.nas.com/.well-known/oauth-protected-resource
https://auth.nas.com/.well-known/oauth-authorization-server
```

Send the resulting bearer token in the HTTP `Authorization` header.

Request only the task's required scopes:

- `nas.communities.read`
- `nas.communities.write`
- `nas.members.read`
- `nas.products.read`
- `nas.products.write`
- `nas.orders.read`

## Discovery Flow

Run MCP discovery before invoking any tool:

1. `initialize`
2. `notifications/initialized`
3. `tools/list`

Live discovery is the runtime source of truth. Tool availability can
change, so clients should not hardcode tool lists as the only source of truth.

Anonymous onboarding tools are `create_image_asset_upload` with
`useCase: "onboarding"`, `create_onboarded_business`,
`get_onboarding_plan_options`, and `generate_plan_checkout_link`. All other
tools require OAuth. An invalid supplied credential must be rejected rather
than treated as anonymous.

## Representative Protected Tools

Live discovery is authoritative. Representative protected controls include:

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

## Error Handling

For MCP JSON-RPC errors, inspect:

```text
error.code
error.message
error.data.code
error.data.resolution
```

Surface `error.data.resolution` to the user when present.

## Client Guardrails

- Do not require authentication for connection, discovery, or the documented
  anonymous onboarding path.
- Before a protected business action, call `check_business_tool_access` and do
  not proceed if it blocks or cannot verify permission.
- Do not invent dynamic registration endpoints.
- Do not invent seller/admin, checkout, payment, webhook, API key, OAuth, REST,
  GraphQL, or MCP write contracts.
- Do not treat public page discovery resources as private API contracts.
- If the requested operation is not documented or returned by authenticated
  discovery, state that the public contract does not provide that operation.
