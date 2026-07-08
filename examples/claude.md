# Claude

Use this guide when configuring Claude Desktop, Claude Code, or another
Claude-compatible MCP client with the official hosted Nas.com MCP server.

## MCP Server

Configure a Streamable HTTP MCP server named `nas-com`:

```json
{
  "mcpServers": {
    "nas-com": {
      "type": "http",
      "url": "https://mcp.nas.com/mcp"
    }
  }
}
```

If your Claude client uses a different config shape for remote HTTP MCP
servers, keep the same server name and URL.

Do not configure `https://nas.com/mcp` as the MCP server URL. That page is the
installation guide.

## Authentication

Complete OAuth in the client. Use the published metadata chain:

```text
https://mcp.nas.com/.well-known/oauth-protected-resource
https://auth.nas.io/.well-known/oauth-authorization-server
```

Supported documented scopes:

- `nas.communities.read`
- `nas.members.read`
- `nas.products.read`
- `nas.orders.read`

## First Use Checklist

1. Connect the `nas-com` MCP server.
2. Complete OAuth.
3. Run `initialize`.
4. Run `tools/list`.
5. Run `resources/list`.
6. Run `resources/templates/list`.
7. Use only tools and resources returned by authenticated discovery.

## Claude Instruction Snippet

```text
Use the `nas-com` MCP server for authenticated Nas.com business, member,
product, and physical product order context. The server URL is
https://mcp.nas.com/mcp. Run discovery before invoking tools. Do not invent
Nas.com seller/admin, checkout, payment, webhook, API key, OAuth, REST,
GraphQL, or MCP write contracts that are not documented or returned by
authenticated discovery.
```
