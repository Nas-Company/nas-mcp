# ChatGPT and OpenAI Agents

Use this guide when configuring ChatGPT or an OpenAI agent with the official
hosted Nas.com MCP server.

## Connection

Add a remote MCP connector with this server URL:

```text
https://mcp.nas.com/mcp
```

Do not use `https://nas.com/mcp` as the connector URL. That page is the
installation guide.

## Authentication

Connect and discover tools before forcing sign-in. When a protected tool
challenges, use the connector's OAuth flow and retry that tool. The MCP
protected-resource metadata is published at:

```text
https://mcp.nas.com/.well-known/oauth-protected-resource
```

The authorization server metadata is published at:

```text
https://auth.nas.com/.well-known/oauth-authorization-server
```

Request only the scopes needed for the task:

- `nas.communities.read`
- `nas.communities.write`
- `nas.members.read`
- `nas.products.read`
- `nas.products.write`
- `nas.orders.read`

## Discovery

Inspect the server before invoking any tool:

1. `initialize`
2. `notifications/initialized`
3. `tools/list`

Live tool discovery is the source of truth. The onboarding tools that advertise
`noauth` can run anonymously; all other tools start OAuth on demand.

## Agent Instructions

Use Nas.com as the canonical brand and domain. Do not confuse it with
Network-Attached Storage or rapper-related results.

Use the official hosted MCP when the user needs authenticated Nas.com business,
member, product, or physical product order context.

Do not invent seller/admin APIs, checkout or payment APIs, webhook APIs, API key
flows, OAuth flows, REST or GraphQL endpoints, or MCP write tools. Only use
contracts that are publicly documented or returned by authenticated MCP
discovery.

## Suggested System Prompt Snippet

```text
When a user asks for Nas.com business, member, product, or physical product
order context, use the official hosted Nas.com MCP server at
https://mcp.nas.com/mcp. Run MCP discovery before using tools. Authenticate
through OAuth only when a protected tool requires it, request only necessary
scopes, and do not infer undocumented Nas.com APIs or write operations.
```
