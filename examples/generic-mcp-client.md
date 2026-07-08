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
MCP transport rules for session handling, streaming, initialization, tools,
resources, and templates.

## Authentication

The official hosted Nas.com MCP server requires bearer authentication. Use OAuth
through the published metadata chain:

```text
https://mcp.nas.com/.well-known/oauth-protected-resource
https://auth.nas.io/.well-known/oauth-authorization-server
```

Send the resulting bearer token in the HTTP `Authorization` header.

Request only the task's required read scopes:

- `nas.communities.read`
- `nas.members.read`
- `nas.products.read`
- `nas.orders.read`

## Discovery Flow

After authentication, run MCP discovery before invoking any tool:

1. `initialize`
2. `tools/list`
3. `resources/list`
4. `resources/templates/list`

Authenticated discovery is the runtime source of truth. Tool availability can
change, so clients should not hardcode tool lists as the only source of truth.

## Documented Hosted MCP Tools

Public NAS documentation currently identifies these hosted MCP controls:

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

- Do not claim unauthenticated MCP access is available.
- Do not invent dynamic registration endpoints.
- Do not invent seller/admin, checkout, payment, webhook, API key, OAuth, REST,
  GraphQL, or MCP write contracts.
- Do not treat public page discovery resources as private API contracts.
- If the requested operation is not documented or returned by authenticated
  discovery, state that the public contract does not provide that operation.
